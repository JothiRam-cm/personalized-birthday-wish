import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) ?? '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export interface StudioRendererContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  envRenderTarget: THREE.WebGLRenderTarget;
  isSoftwareGl: boolean;
  dispose: () => void;
}

export function createStudioScene(
  container: HTMLElement
): StudioRendererContext {
  const isSoftwareGl = detectSoftwareWebGL();
  const width = Math.max(container.clientWidth, 1);
  const height = Math.max(container.clientHeight, 1);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha: true,
    powerPreference: 'high-performance',
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(
    isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2)
  );
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envRenderTarget = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04
  );
  scene.environment = envRenderTarget.texture;
  pmremGenerator.dispose();

  return {
    renderer,
    scene,
    envRenderTarget,
    isSoftwareGl,
    dispose: () => {
      envRenderTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 122);
  grad.addColorStop(0, 'rgba(145, 75, 97, 0.32)');
  grad.addColorStop(0.55, 'rgba(145, 75, 97, 0.12)');
  grad.addColorStop(1, 'rgba(145, 75, 97, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function scheduleNextFrame(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
  tick: () => void,
  setTimerHandle: (id: number) => void
) {
  if (!isSoftwareGl) {
    setTimerHandle(requestAnimationFrame(tick));
    return;
  }

  const gl = renderer.getContext() as WebGL2RenderingContext;
  const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  if (!sync) {
    setTimerHandle(window.setTimeout(tick, 80));
    return;
  }

  const poll = () => {
    const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      setTimerHandle(window.setTimeout(poll, 5));
    } else {
      gl.deleteSync(sync);
      setTimerHandle(window.setTimeout(tick, 80));
    }
  };
  setTimerHandle(window.setTimeout(poll, 5));
}

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (mesh.material) {
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((mat) => {
        Object.values(mat).forEach((val) => {
          if (val && typeof val === 'object' && 'isTexture' in val) {
            (val as THREE.Texture).dispose();
          }
        });
        mat.dispose();
      });
    }
  });
}
