import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createContactShadowTexture,
  createStudioScene,
  disposeObject3D,
  scheduleNextFrame,
} from '../../three/studioSetup';

interface ThreeBalloonSceneProps {
  words: [string, string, string, string];
  popped: [boolean, boolean, boolean, boolean];
  onPop: (index: number) => void;
}

const BALLOON_PALETTE = [
  { name: 'Pastel Pink', color: '#F4A6BA', stringColor: '#C8758B', badgeBg: '#FFEAF0' },
  { name: 'Pastel Blue', color: '#A9D6F5', stringColor: '#7EA9CB', badgeBg: '#EAF6FF' },
  { name: 'Pastel Lavender', color: '#D3C2F3', stringColor: '#9C87C8', badgeBg: '#F3EEFF' },
  { name: 'Pastel Mint', color: '#B4E3C5', stringColor: '#73AC88', badgeBg: '#EAF8EE' },
];

const _vec3 = new THREE.Vector3();

function createBalloonTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle pearlescent sheen gradient & tiny soft pastel stars
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, 'rgba(255,255,255,0.28)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.0)');
  grad.addColorStop(1, 'rgba(145,75,97,0.08)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  for (let i = 0; i < 16; i++) {
    const x = ((i * 67) % 220) + 18;
    const y = ((i * 97) % 200) + 28;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ThreeBalloonScene: React.FC<ThreeBalloonSceneProps> = ({
  words,
  popped,
  onPop,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const poppedRef = useRef(popped);
  poppedRef.current = popped;
  const onPopRef = useRef(onPop);
  onPopRef.current = onPop;

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const burstTriggerRef = useRef<((index: number) => void) | null>(null);

  // Trigger 3D burst whenever a balloon transitions to popped (via click or keyboard)
  const prevPoppedRef = useRef<[boolean, boolean, boolean, boolean]>([...popped]);
  useEffect(() => {
    popped.forEach((isPopped, idx) => {
      if (isPopped && !prevPoppedRef.current[idx]) {
        burstTriggerRef.current?.(idx);
      }
    });
    prevPoppedRef.current = [...popped];
  }, [popped]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const studio = createStudioScene(container);
    const { renderer, scene, isSoftwareGl } = studio;

    const camera = new THREE.PerspectiveCamera(
      38,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      50
    );

    const updateCameraForAspect = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      const aspect = w / h;
      camera.aspect = aspect;
      camera.position.set(0, 0.2, aspect < 1 ? 10.6 : 8.4);
      camera.lookAt(0, 0.05, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    updateCameraForAspect();

    // 3-point warm/cool studio rig
    const hemi = new THREE.HemisphereLight(0xf6f0ff, 0xf2d3dc, 1.05);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff4ea, 1.6);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffdce6, 0.75);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Shared balloon lathe geometry (teardrop silhouette)
    const lathePts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const angle = t * Math.PI;
      const r =
        Math.sin(angle) *
        (0.68 + 0.16 * Math.sin(t * Math.PI * 0.85)) *
        (t < 0.2 ? 0.55 + t * 2.2 : 1);
      const y = -0.9 + t * 1.85;
      lathePts.push(new THREE.Vector2(Math.max(0, r), y));
    }
    const bodyGeo = new THREE.LatheGeometry(lathePts, 32);
    const knotCollarGeo = new THREE.TorusGeometry(0.1, 0.036, 12, 24);
    knotCollarGeo.rotateX(Math.PI / 2);
    const knotTipGeo = new THREE.ConeGeometry(0.11, 0.15, 16);
    const hitGeo = new THREE.SphereGeometry(0.95, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const shadowTex = createContactShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });

    // Positions in 2x2 grid
    const gridCoords: Array<[number, number, number]> = [
      [-1.32, 1.05, 0],
      [1.32, 1.05, 0.12],
      [-1.32, -1.15, 0.12],
      [1.32, -1.15, 0],
    ];

    interface BalloonRig {
      root: THREE.Group;
      visual: THREE.Group;
      hitMesh: THREE.Mesh;
      basePos: THREE.Vector3;
      scaleCurrent: number;
      poppingProgress: number;
      isHidden: boolean;
    }

    const rigs: BalloonRig[] = [];
    const hitTargets: THREE.Object3D[] = [];

    BALLOON_PALETTE.forEach((pal, idx) => {
      const root = new THREE.Group();
      const [bx, by, bz] = gridCoords[idx];
      root.position.set(bx, by, bz);

      const visual = new THREE.Group();
      const tex = createBalloonTexture(pal.color);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const bodyMat = new THREE.MeshPhysicalMaterial({
        map: tex,
        color: 0xffffff,
        roughness: 0.22,
        metalness: 0.02,
        clearcoat: 0.88,
        clearcoatRoughness: 0.14,
      });

      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = !isSoftwareGl;
      bodyMesh.receiveShadow = !isSoftwareGl;
      visual.add(bodyMesh);

      const knotMat = new THREE.MeshStandardMaterial({
        color: pal.color,
        roughness: 0.55,
        metalness: 0.0,
      });
      const collar = new THREE.Mesh(knotCollarGeo, knotMat);
      collar.position.y = -0.92;
      visual.add(collar);

      const tip = new THREE.Mesh(knotTipGeo, knotMat);
      tip.position.y = -0.99;
      visual.add(tip);

      // Curved hanging ribbon string
      const stringPts = [
        new THREE.Vector3(0, -1.03, 0),
        new THREE.Vector3(0.06, -1.28, 0.03),
        new THREE.Vector3(-0.05, -1.52, -0.02),
        new THREE.Vector3(0.03, -1.78, 0.02),
      ];
      const stringCurve = new THREE.CatmullRomCurve3(stringPts);
      const stringGeo = new THREE.TubeGeometry(stringCurve, 20, 0.016, 8, false);
      const stringMat = new THREE.MeshStandardMaterial({
        color: pal.stringColor,
        roughness: 0.65,
      });
      const stringMesh = new THREE.Mesh(stringGeo, stringMat);
      visual.add(stringMesh);

      // Soft contact shadow directly underneath
      const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
      shadowPlane.position.y = -1.92;
      root.add(shadowPlane);

      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData.balloonIndex = idx;
      hitMesh.layers.set(1);
      root.add(hitMesh);
      hitTargets.push(hitMesh);

      root.add(visual);
      scene.add(root);

      const alreadyPopped = poppedRef.current[idx];
      if (alreadyPopped) {
        visual.visible = false;
        shadowPlane.visible = false;
      }

      rigs.push({
        root,
        visual,
        hitMesh,
        basePos: new THREE.Vector3(bx, by, bz),
        scaleCurrent: 1,
        poppingProgress: alreadyPopped ? 1 : 0,
        isHidden: alreadyPopped,
      });
    });

    // Pop particle burst system (pre-allocated pool)
    interface Shard {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      active: boolean;
    }
    const shardGeo = new THREE.OctahedronGeometry(0.06, 0);
    const shards: Shard[] = [];
    for (let i = 0; i < 48; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: BALLOON_PALETTE[i % 4].color,
        roughness: 0.3,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(shardGeo, mat);
      mesh.visible = false;
      scene.add(mesh);
      shards.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        active: false,
      });
    }

    const spawnBurst = (idx: number) => {
      const rig = rigs[idx];
      if (!rig || rig.isHidden) return;
      rig.poppingProgress = 0.01;
      const origin = rig.basePos;
      let spawned = 0;
      for (let i = 0; i < shards.length && spawned < 12; i++) {
        const s = shards[i];
        if (!s.active) {
          s.active = true;
          s.life = 1;
          s.mesh.visible = true;
          s.mesh.position.copy(origin);
          const angle = (spawned / 12) * Math.PI * 2 + Math.random() * 0.4;
          const speed = 2.0 + Math.random() * 2.1;
          s.vel.set(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed + 1.0,
            (Math.random() - 0.5) * 2.0
          );
          (s.mesh.material as THREE.MeshStandardMaterial).color.set(
            BALLOON_PALETTE[idx].color
          );
          (s.mesh.material as THREE.MeshStandardMaterial).opacity = 1;
          spawned++;
        }
      }
    };
    burstTriggerRef.current = spawnBurst;

    // Pointer raycasting (layer 1 hit proxies)
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let activeHover: number | null = null;
    let lastMoveTs = 0;

    const getHitIndex = (clientX: number, clientY: number): number | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      if (hits.length === 0) return null;
      const idx = hits[0].object.userData.balloonIndex as number;
      return poppedRef.current[idx] ? null : idx;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveTs < 45) return;
      lastMoveTs = now;
      const hit = getHitIndex(e.clientX, e.clientY);
      if (hit !== activeHover) {
        activeHover = hit;
        setHoveredIdx(hit);
        renderer.domElement.style.cursor = hit !== null ? 'pointer' : 'default';
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const hit = getHitIndex(e.clientX, e.clientY);
      if (hit !== null && !poppedRef.current[hit]) {
        spawnBurst(hit);
        onPopRef.current(hit);
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    const handleLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleRestored = () => setContextLost(false);
    renderer.domElement.addEventListener('webglcontextlost', handleLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleRestored);

    const resizeObs = new ResizeObserver(updateCameraForAspect);
    resizeObs.observe(container);

    const clock = new THREE.Clock();
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let frameHandle = 0;
    let disposed = false;

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      rigs.forEach((rig, idx) => {
        if (rig.isHidden) return;

        // Popping scale-up -> vanish
        if (rig.poppingProgress > 0) {
          rig.poppingProgress += dt * 7.5;
          const s = 1 + rig.poppingProgress * 0.35;
          rig.visual.scale.setScalar(s);
          if (rig.poppingProgress >= 1) {
            rig.isHidden = true;
            rig.root.visible = false;
          }
          return;
        }

        // Gentle floating bob + hover damping
        const floatY = reducedMotion
          ? 0
          : Math.sin(elapsed * 1.55 + idx * 1.4) * 0.09;
        const swayZ = reducedMotion
          ? 0
          : Math.cos(elapsed * 1.1 + idx * 0.9) * 0.04;
        rig.visual.position.y = floatY;
        rig.visual.rotation.z = swayZ;

        const targetScale = activeHover === idx ? 1.09 : 1.0;
        rig.scaleCurrent = THREE.MathUtils.damp(
          rig.scaleCurrent,
          targetScale,
          10,
          dt
        );
        rig.visual.scale.setScalar(rig.scaleCurrent);
      });

      shards.forEach((s) => {
        if (!s.active) return;
        s.life -= dt * 1.65;
        if (s.life <= 0) {
          s.active = false;
          s.mesh.visible = false;
          return;
        }
        s.vel.y -= dt * 4.8;
        _vec3.copy(s.vel).multiplyScalar(dt);
        s.mesh.position.add(_vec3);
        s.mesh.rotation.x += dt * 6;
        s.mesh.rotation.y += dt * 5;
        s.mesh.scale.setScalar(Math.max(0.05, s.life));
        (s.mesh.material as THREE.MeshStandardMaterial).opacity = s.life;
      });

      renderer.render(scene, camera);
      scheduleNextFrame(renderer, isSoftwareGl, tick, (id) => {
        frameHandle = id;
      });
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameHandle);
      clearTimeout(frameHandle);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', handleLost);
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleRestored
      );
      disposeObject3D(scene);
      studio.dispose();
    };
  }, []);

  return (
    <div className="relative w-full max-w-[540px] h-[360px] sm:h-[420px] mx-auto select-none">
      {/* Three.js Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#914B61]">
          3D scene paused — tap any balloon card below to pop!
        </div>
      )}

      {/* Aligned 2x2 Accessible Overlay Grid for Revealed Words & Keyboard Controls */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
        {words.map((word, idx) => {
          const isPopped = popped[idx];
          const pal = BALLOON_PALETTE[idx];
          return (
            <div
              key={idx}
              className="flex items-center justify-center p-2"
            >
              {isPopped ? (
                <div
                  className="pointer-events-auto px-5 py-3 rounded-2xl border border-[#EED8DE] shadow-card-soft text-center transition-all duration-300"
                  style={{ backgroundColor: pal.badgeBg }}
                >
                  <span className="font-serif-editorial font-bold text-xl sm:text-2xl tracking-wide text-[#914B61]">
                    {word}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onPop(idx)}
                  aria-label={`Pop ${pal.name} balloon ${idx + 1}`}
                  className={`pointer-events-auto w-28 h-32 sm:w-32 sm:h-36 rounded-full opacity-0 focus-visible:opacity-100 focus-visible:bg-white/60 focus-visible:outline-2 focus-visible:outline-[#C8758B] cursor-pointer transition-opacity ${
                    hoveredIdx === idx ? 'ring-0' : ''
                  }`}
                >
                  <span className="sr-only">Pop {pal.name} balloon</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
