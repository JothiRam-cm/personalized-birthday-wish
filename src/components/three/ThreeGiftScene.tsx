import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createContactShadowTexture,
  createStudioScene,
  disposeObject3D,
  scheduleNextFrame,
} from '../../three/studioSetup';

interface ThreeGiftSceneProps {
  opened: boolean;
  onOpen: () => void;
}

function createGiftPaperTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#F6BAC8';
  ctx.fillRect(0, 0, 256, 256);

  // Subtle pastel polka-dot highlight pattern
  ctx.fillStyle = 'rgba(255, 248, 233, 0.35)';
  for (let y = 16; y < 256; y += 32) {
    const offset = (y / 32) % 2 === 0 ? 0 : 16;
    for (let x = 16; x < 256; x += 32) {
      ctx.beginPath();
      ctx.arc((x + offset) % 256, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _vec3 = new THREE.Vector3();

export const ThreeGiftScene: React.FC<ThreeGiftSceneProps> = ({
  opened,
  onOpen,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const openedRef = useRef(opened);
  openedRef.current = opened;
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  const [hovered, setHovered] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const studio = createStudioScene(container);
    const { renderer, scene, isSoftwareGl } = studio;

    const camera = new THREE.PerspectiveCamera(
      36,
      Math.max(container.clientWidth, 1) / Math.max(container.clientHeight, 1),
      0.1,
      50
    );
    camera.position.set(2.3, 2.25, 4.15);
    camera.lookAt(0, 0.72, 0);

    // 3-point warm/cool studio rig
    const hemi = new THREE.HemisphereLight(0xf6f0ff, 0xf2d1db, 1.05);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff4ea, 1.6);
    keyLight.position.set(4, 6, 4.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffdce7, 0.8);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const giftRoot = new THREE.Group();
    scene.add(giftRoot);

    // Contact shadow
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 3.1),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    giftRoot.add(shadowPlane);

    const boxGroup = new THREE.Group();
    giftRoot.add(boxGroup);

    const paperTex = createGiftPaperTexture();
    paperTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const boxMat = new THREE.MeshStandardMaterial({
      map: paperTex,
      roughness: 0.5,
      metalness: 0.02,
    });

    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8617c,
      roughness: 0.24,
      metalness: 0.08,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xebd092,
      roughness: 0.22,
      metalness: 0.88,
    });

    // 1. Beveled Box Base (ExtrudeGeometry rounded square)
    const makeRoundedSquare = (size: number, radius: number) => {
      const s = size / 2;
      const shape = new THREE.Shape();
      shape.moveTo(-s + radius, -s);
      shape.lineTo(s - radius, -s);
      shape.quadraticCurveTo(s, -s, s, -s + radius);
      shape.lineTo(s, s - radius);
      shape.quadraticCurveTo(s, s, s - radius, s);
      shape.lineTo(-s + radius, s);
      shape.quadraticCurveTo(-s, s, -s, s - radius);
      shape.lineTo(-s, -s + radius);
      shape.quadraticCurveTo(-s, -s, -s + radius, -s);
      return shape;
    };

    const baseGeo = new THREE.ExtrudeGeometry(makeRoundedSquare(1.42, 0.14), {
      depth: 1.02,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    });
    baseGeo.rotateX(-Math.PI / 2);
    const baseMesh = new THREE.Mesh(baseGeo, boxMat);
    baseMesh.position.y = 0.05;
    baseMesh.castShadow = !isSoftwareGl;
    baseMesh.receiveShadow = !isSoftwareGl;
    boxGroup.add(baseMesh);

    // Warm glowing surprise core inside the box
    const innerGlowLight = new THREE.PointLight(0xffe19c, 0, 5, 1.5);
    innerGlowLight.position.set(0, 1.0, 0);
    boxGroup.add(innerGlowLight);

    const innerCreamCap = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.04, 1.3),
      new THREE.MeshStandardMaterial({
        color: 0xfff8e9,
        emissive: 0xffd57e,
        emissiveIntensity: 0.35,
        roughness: 0.6,
      })
    );
    innerCreamCap.position.y = 1.07;
    boxGroup.add(innerCreamCap);

    // 2. Vertical Cross-Ribbons on Base
    const ribbonSideA = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 1.07, 1.53),
      ribbonMat
    );
    ribbonSideA.position.y = 0.56;
    ribbonSideA.castShadow = !isSoftwareGl;
    boxGroup.add(ribbonSideA);

    const ribbonSideB = new THREE.Mesh(
      new THREE.BoxGeometry(1.53, 1.07, 0.24),
      ribbonMat
    );
    ribbonSideB.position.y = 0.56;
    ribbonSideB.castShadow = !isSoftwareGl;
    boxGroup.add(ribbonSideB);

    // 3. Separate Lid Group (hinges/lifts open!)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 1.06, -0.76);
    boxGroup.add(lidGroup);

    const lidInner = new THREE.Group();
    lidInner.position.set(0, 0, 0.76);
    lidGroup.add(lidInner);

    const lidGeo = new THREE.ExtrudeGeometry(makeRoundedSquare(1.56, 0.14), {
      depth: 0.26,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 3,
    });
    lidGeo.rotateX(-Math.PI / 2);
    const lidMesh = new THREE.Mesh(lidGeo, boxMat);
    lidMesh.castShadow = !isSoftwareGl;
    lidMesh.receiveShadow = !isSoftwareGl;
    lidInner.add(lidMesh);

    // Gold trim accent around lid bottom
    const lidTrim = new THREE.Mesh(
      new THREE.BoxGeometry(1.64, 0.03, 1.64),
      goldMat
    );
    lidTrim.position.y = 0.01;
    lidInner.add(lidTrim);

    // Cross ribbons on lid
    const lidRibA = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.34, 1.66),
      ribbonMat
    );
    lidRibA.position.y = 0.14;
    lidInner.add(lidRibA);

    const lidRibB = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 0.34, 0.25),
      ribbonMat
    );
    lidRibB.position.y = 0.14;
    lidInner.add(lidRibB);

    // 4. Sculpted Multi-Loop Bow on Lid Top
    const bowGroup = new THREE.Group();
    bowGroup.position.y = 0.34;
    lidInner.add(bowGroup);

    const loopGeo = new THREE.TorusGeometry(0.22, 0.068, 12, 28);
    for (let i = 0; i < 4; i++) {
      const loop = new THREE.Mesh(loopGeo, ribbonMat);
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      loop.rotation.y = angle;
      loop.rotation.x = Math.PI * 0.26;
      loop.position.set(Math.cos(angle) * 0.18, 0.12, Math.sin(angle) * 0.18);
      loop.scale.set(1.1, 0.8, 0.9);
      loop.castShadow = !isSoftwareGl;
      bowGroup.add(loop);
    }

    const bowKnot = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 18, 18),
      ribbonMat
    );
    bowKnot.position.y = 0.08;
    bowGroup.add(bowKnot);

    // Invisible click proxy on layer 1
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.8, 1.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitBox.position.y = 0.78;
    hitBox.layers.set(1);
    boxGroup.add(hitBox);

    // Pre-allocated burst confetti shards emerging from the opened gift
    interface ConfettiPiece {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      active: boolean;
      life: number;
    }
    const pieceGeo = new THREE.BoxGeometry(0.08, 0.08, 0.02);
    const burstColors = ['#EFA9B8', '#A9D6F5', '#D3C2F3', '#B4E3C5', '#FBE08A'];
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 36; i++) {
      const mesh = new THREE.Mesh(
        pieceGeo,
        new THREE.MeshStandardMaterial({
          color: burstColors[i % burstColors.length],
          roughness: 0.35,
          transparent: true,
          opacity: 1,
        })
      );
      mesh.visible = false;
      scene.add(mesh);
      pieces.push({
        mesh,
        vel: new THREE.Vector3(),
        active: false,
        life: 0,
      });
    }

    let burstFired = false;
    const fireConfetti = () => {
      if (burstFired) return;
      burstFired = true;
      pieces.forEach((p, idx) => {
        p.active = true;
        p.life = 1.6;
        p.mesh.visible = true;
        p.mesh.position.set(0, 1.05, 0);
        const angle = (idx / pieces.length) * Math.PI * 2 + Math.random() * 0.3;
        const radial = 1.1 + Math.random() * 1.4;
        p.vel.set(
          Math.cos(angle) * radial,
          2.8 + Math.random() * 2.2,
          Math.sin(angle) * radial
        );
      });
    };

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let isHovered = false;
    let lastMoveTs = 0;

    const checkHit = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObject(hitBox, false).length > 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastMoveTs < 45) return;
      lastMoveTs = now;
      const hit = !openedRef.current && checkHit(e.clientX, e.clientY);
      if (hit !== isHovered) {
        isHovered = hit;
        setHovered(hit);
        renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!openedRef.current && checkHit(e.clientX, e.clientY)) {
        fireConfetti();
        onOpenRef.current();
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

    const handleResize = () => {
      const w = Math.max(container.clientWidth, 1);
      const h = Math.max(container.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    const clock = new THREE.Clock();
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    let frameHandle = 0;
    let disposed = false;
    let boxScale = 1;
    let lidAngle = 0;
    let lidLift = 0;
    let bouncePhase = 0;

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const isOpened = openedRef.current;
      if (isOpened && !burstFired) {
        fireConfetti();
      }

      if (!isOpened) {
        if (!reducedMotion) {
          boxGroup.position.y = Math.sin(elapsed * 2.1) * 0.06;
          boxGroup.rotation.y = Math.sin(elapsed * 0.7) * 0.16;
        }
        const targetScale = isHovered ? 1.07 : 1.0;
        boxScale = THREE.MathUtils.damp(boxScale, targetScale, 9, dt);
        boxGroup.scale.setScalar(boxScale);
      } else {
        bouncePhase = Math.min(1, bouncePhase + dt * 4.2);
        const squash =
          bouncePhase < 0.45
            ? 1 + Math.sin((bouncePhase / 0.45) * Math.PI) * 0.1
            : 1;
        boxGroup.scale.set(squash, 2 - squash, squash);
        boxGroup.position.y = THREE.MathUtils.damp(boxGroup.position.y, 0, 8, dt);
        lidAngle = THREE.MathUtils.damp(lidAngle, -Math.PI * 0.62, 7.5, dt);
        lidLift = THREE.MathUtils.damp(lidLift, 0.35, 7.5, dt);
        lidGroup.rotation.x = lidAngle;
        lidGroup.position.y = 1.06 + lidLift;
        innerGlowLight.intensity = THREE.MathUtils.damp(
          innerGlowLight.intensity,
          3.2,
          6,
          dt
        );
      }

      pieces.forEach((p) => {
        if (!p.active) return;
        p.life -= dt * 0.9;
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          return;
        }
        p.vel.y -= dt * 4.5;
        _vec3.copy(p.vel).multiplyScalar(dt);
        p.mesh.position.add(_vec3);
        p.mesh.rotation.x += dt * 7;
        p.mesh.rotation.y += dt * 5;
        (p.mesh.material as THREE.MeshStandardMaterial).opacity = Math.min(
          1,
          p.life
        );
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
    <div className="relative w-full max-w-[420px] h-[300px] sm:h-[340px] mx-auto select-none">
      <div ref={mountRef} className="w-full h-full" />

      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#914B61]">
          Tap below to open your birthday gift!
        </div>
      )}

      {!opened && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Tap to open the birthday gift box"
          className={`absolute inset-8 rounded-3xl opacity-0 focus-visible:opacity-100 focus-visible:bg-white/40 focus-visible:outline-2 focus-visible:outline-[#C8758B] cursor-pointer ${
            hovered ? 'ring-0' : ''
          }`}
        >
          <span className="sr-only">Open birthday gift</span>
        </button>
      )}
    </div>
  );
};
