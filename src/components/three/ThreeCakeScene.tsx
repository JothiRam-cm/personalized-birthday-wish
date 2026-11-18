import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  createContactShadowTexture,
  createStudioScene,
  disposeObject3D,
  scheduleNextFrame,
} from '../../three/studioSetup';

interface ThreeCakeSceneProps {
  extinguished: boolean;
  wishMade: boolean;
}

function createStripeCandleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#FFF8E9';
  ctx.fillRect(0, 0, 128, 256);

  ctx.strokeStyle = '#EFA9B8';
  ctx.lineWidth = 18;
  for (let y = -128; y < 384; y += 44) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y + 64);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSpongeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#8F5E4D';
  ctx.fillRect(0, 0, 256, 128);

  // Subtle chocolate-sponge crumb variation
  for (let i = 0; i < 420; i++) {
    const x = (i * 53) % 256;
    const y = (i * 37) % 128;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(68, 41, 32, 0.22)' : 'rgba(176, 127, 107, 0.16)';
    ctx.fillRect(x, y, 2.5, 2.5);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ThreeCakeScene: React.FC<ThreeCakeSceneProps> = ({
  extinguished,
  wishMade,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const extinguishedRef = useRef(extinguished);
  extinguishedRef.current = extinguished;
  const wishMadeRef = useRef(wishMade);
  wishMadeRef.current = wishMade;

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
    camera.position.set(0, 2.55, 5.25);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.44;
    controls.target.set(0, 0.72, 0);
    controls.update();

    // Lighting rig
    const hemi = new THREE.HemisphereLight(0xf7effe, 0xe8c7d1, 0.95);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff1e4, 1.55);
    keyLight.position.set(3.5, 5.5, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffdae6, 0.65);
    rimLight.position.set(-3.5, 3, -3);
    scene.add(rimLight);

    // Warm candle PointLight
    const flameLight = new THREE.PointLight(0xffc966, 2.2, 6, 1.8);
    flameLight.position.set(0, 1.98, 0);
    scene.add(flameLight);

    // Composite Cake Group grounded at Y = 0
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // Soft radial contact shadow
    const shadowTex = createContactShadowTexture();
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.85,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = 0.01;
    cakeGroup.add(shadowPlane);

    // 1. Ceramic Pedestal Stand (LatheGeometry)
    const standPts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.75, 0),
      new THREE.Vector2(0.72, 0.06),
      new THREE.Vector2(0.24, 0.14),
      new THREE.Vector2(0.18, 0.34),
      new THREE.Vector2(0.28, 0.42),
      new THREE.Vector2(1.42, 0.46),
      new THREE.Vector2(1.45, 0.54),
      new THREE.Vector2(1.36, 0.54),
      new THREE.Vector2(1.3, 0.49),
      new THREE.Vector2(0, 0.49),
    ];
    const standMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.03,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });
    const standMesh = new THREE.Mesh(
      new THREE.LatheGeometry(standPts, 48),
      standMat
    );
    standMesh.castShadow = !isSoftwareGl;
    standMesh.receiveShadow = !isSoftwareGl;
    cakeGroup.add(standMesh);

    // Gold trim ring on plate rim
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xe7c382,
      roughness: 0.25,
      metalness: 0.85,
    });
    const plateTrim = new THREE.Mesh(
      new THREE.TorusGeometry(1.41, 0.018, 12, 64),
      goldMat
    );
    plateTrim.rotation.x = Math.PI / 2;
    plateTrim.position.y = 0.525;
    cakeGroup.add(plateTrim);

    // 2. Brown Sponge Cake Base
    const spongeTex = createSpongeTexture();
    spongeTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const spongeMat = new THREE.MeshStandardMaterial({
      map: spongeTex,
      roughness: 0.82,
      metalness: 0.0,
    });
    const cakeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.08, 0.72, 48),
      spongeMat
    );
    cakeBase.position.y = 0.86;
    cakeBase.castShadow = !isSoftwareGl;
    cakeBase.receiveShadow = !isSoftwareGl;
    cakeGroup.add(cakeBase);

    // Subtle strawberry cream filling band mid-layer
    const fillingRing = new THREE.Mesh(
      new THREE.CylinderGeometry(1.072, 1.072, 0.08, 48),
      new THREE.MeshStandardMaterial({ color: 0xf7b9c7, roughness: 0.5 })
    );
    fillingRing.position.y = 0.84;
    cakeGroup.add(fillingRing);

    // 3. White Whipped Frosting Cap + Drips
    const frostingMat = new THREE.MeshPhysicalMaterial({
      color: 0xfffdfd,
      roughness: 0.36,
      metalness: 0.0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.35,
    });
    const frostingCap = new THREE.Mesh(
      new THREE.CylinderGeometry(1.09, 1.09, 0.16, 48),
      frostingMat
    );
    frostingCap.position.y = 1.24;
    frostingCap.castShadow = !isSoftwareGl;
    frostingCap.receiveShadow = !isSoftwareGl;
    cakeGroup.add(frostingCap);

    // Soft bevel frosting rim
    const frostingRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.02, 0.09, 16, 48),
      frostingMat
    );
    frostingRim.rotation.x = Math.PI / 2;
    frostingRim.position.y = 1.26;
    cakeGroup.add(frostingRim);

    // Drips around circumference
    const dripGeo = new THREE.CapsuleGeometry(0.068, 0.14, 8, 12);
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const drip = new THREE.Mesh(dripGeo, frostingMat);
      const lenScale = 0.75 + ((i * 7) % 5) * 0.16;
      drip.scale.set(1, lenScale, 1);
      drip.position.set(
        Math.cos(angle) * 1.08,
        1.14 - lenScale * 0.05,
        Math.sin(angle) * 1.08
      );
      cakeGroup.add(drip);
    }

    // 4. Pastel Sprinkles (InstancedMesh)
    const sprinkleGeo = new THREE.CapsuleGeometry(0.018, 0.055, 4, 8);
    const sprinkleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
    });
    const sprinkleCount = 36;
    const sprinkles = new THREE.InstancedMesh(
      sprinkleGeo,
      sprinkleMat,
      sprinkleCount
    );
    const dummy = new THREE.Object3D();
    const sprinkleColors = [
      new THREE.Color('#EFA9B8'),
      new THREE.Color('#A9D6F5'),
      new THREE.Color('#D3C2F3'),
      new THREE.Color('#B4E3C5'),
      new THREE.Color('#FAD482'),
    ];
    for (let i = 0; i < sprinkleCount; i++) {
      const r = 0.25 + ((i * 19) % 70) / 100;
      const theta = i * 2.39996;
      dummy.position.set(Math.cos(theta) * r, 1.33, Math.sin(theta) * r);
      dummy.rotation.set(Math.PI / 2, theta * 0.7, i * 0.5);
      dummy.updateMatrix();
      sprinkles.setMatrixAt(i, dummy.matrix);
      sprinkles.setColorAt(i, sprinkleColors[i % sprinkleColors.length]);
    }
    sprinkles.instanceMatrix.needsUpdate = true;
    if (sprinkles.instanceColor) sprinkles.instanceColor.needsUpdate = true;
    sprinkles.computeBoundingSphere();
    cakeGroup.add(sprinkles);

    // 5. Candle Holder & Striped Wax Candle
    const candleHolder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0xf4a6ba, roughness: 0.35 })
    );
    candleHolder.position.y = 1.34;
    cakeGroup.add(candleHolder);

    const candleTex = createStripeCandleTexture();
    candleTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const candleStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.072, 0.56, 24),
      new THREE.MeshStandardMaterial({
        map: candleTex,
        roughness: 0.42,
        metalness: 0.0,
      })
    );
    candleStick.position.y = 1.62;
    candleStick.castShadow = !isSoftwareGl;
    cakeGroup.add(candleStick);

    // Wick
    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.012, 0.07, 8),
      new THREE.MeshStandardMaterial({ color: 0x3b2926, roughness: 0.9 })
    );
    wick.position.y = 1.92;
    cakeGroup.add(wick);

    // 6. Animated Multi-Layer Flame
    const flameGroup = new THREE.Group();
    flameGroup.position.y = 1.96;
    cakeGroup.add(flameGroup);

    const flamePts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.058, 0.045),
      new THREE.Vector2(0.052, 0.12),
      new THREE.Vector2(0.022, 0.21),
      new THREE.Vector2(0, 0.26),
    ];
    const outerFlameGeo = new THREE.LatheGeometry(flamePts, 20);
    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffb338,
      transparent: true,
      opacity: 0.92,
    });
    const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
    flameGroup.add(outerFlame);

    const innerFlame = new THREE.Mesh(
      outerFlameGeo,
      new THREE.MeshBasicMaterial({
        color: 0xfff5c0,
      })
    );
    innerFlame.scale.set(0.55, 0.6, 0.55);
    innerFlame.position.y = 0.02;
    flameGroup.add(innerFlame);

    // 7. Rising Smoke Puffs on Extinguish
    interface SmokePuff {
      mesh: THREE.Mesh;
      age: number;
      maxAge: number;
      driftX: number;
      driftZ: number;
      active: boolean;
    }
    const smokeGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const smokePuffs: SmokePuff[] = [];
    for (let i = 0; i < 12; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xeadfe3,
        roughness: 1,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(smokeGeo, mat);
      mesh.visible = false;
      cakeGroup.add(mesh);
      smokePuffs.push({
        mesh,
        age: 0,
        maxAge: 1.5,
        driftX: ((i % 3) - 1) * 0.12,
        driftZ: (((i + 1) % 3) - 1) * 0.08,
        active: false,
      });
    }

    const triggerSmoke = () => {
      smokePuffs.forEach((p, idx) => {
        p.active = true;
        p.age = -idx * 0.1;
        p.maxAge = 1.4 + (idx % 4) * 0.2;
        p.mesh.position.set(0, 1.96, 0);
        p.mesh.scale.setScalar(0.5);
        p.mesh.visible = true;
      });
    };

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
    let prevExtinguished = extinguishedRef.current;
    let flameScale = prevExtinguished ? 0 : 1;

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      const isOut = extinguishedRef.current;
      const isWished = wishMadeRef.current;

      if (isOut && !prevExtinguished) {
        triggerSmoke();
      }
      prevExtinguished = isOut;

      // Damped flame scale & warm flicker
      const targetFlameScale = isOut ? 0 : 1;
      flameScale = THREE.MathUtils.damp(flameScale, targetFlameScale, 12, dt);
      flameGroup.visible = flameScale > 0.02;

      if (flameGroup.visible) {
        const flicker = reducedMotion
          ? 1
          : 1 + Math.sin(elapsed * 13) * 0.07 + Math.cos(elapsed * 21) * 0.04;
        flameGroup.scale.set(
          flameScale * (0.95 + flicker * 0.05),
          flameScale * flicker,
          flameScale * (0.95 + flicker * 0.05)
        );
        flameGroup.rotation.z = reducedMotion
          ? 0
          : Math.sin(elapsed * 6.5) * 0.08;
        flameLight.intensity = flameScale * (2.0 + Math.sin(elapsed * 14) * 0.25);
      } else {
        flameLight.intensity = 0;
      }

      // Dim key/hemi softly during wish moment, restore when wishMade
      const targetKey = isOut && !isWished ? 0.55 : 1.55;
      const targetHemi = isOut && !isWished ? 0.45 : 0.95;
      keyLight.intensity = THREE.MathUtils.damp(keyLight.intensity, targetKey, 5, dt);
      hemi.intensity = THREE.MathUtils.damp(hemi.intensity, targetHemi, 5, dt);

      // Smoke puffs evolution
      smokePuffs.forEach((p) => {
        if (!p.active) return;
        p.age += dt;
        if (p.age < 0) return;
        if (p.age >= p.maxAge) {
          p.active = false;
          p.mesh.visible = false;
          return;
        }
        const progress = p.age / p.maxAge;
        p.mesh.position.y = 1.96 + progress * 1.15;
        p.mesh.position.x =
          p.driftX * progress + Math.sin(elapsed * 3 + progress * 6) * 0.04;
        p.mesh.position.z = p.driftZ * progress;
        p.mesh.scale.setScalar(0.55 + progress * 1.6);
        (p.mesh.material as THREE.MeshStandardMaterial).opacity =
          Math.sin(progress * Math.PI) * 0.55;
      });

      // Gentle lazy cake idle sway when not being dragged
      if (!reducedMotion) {
        cakeGroup.rotation.y = Math.sin(elapsed * 0.45) * 0.14;
      }

      controls.update();
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
      controls.dispose();
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
    <div className="relative w-full max-w-[460px] h-[300px] sm:h-[340px] mx-auto select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-[#914B61]">
          Cake 3D preview paused — use the button below to blow out the candle!
        </div>
      )}
    </div>
  );
};
