import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

interface CupPreview3DProps {
  artUrl: string | null;
  productId?: string;
}

const TEX_W = 1024;
const TEX_H = 512;

function buildTexture(ctx: CanvasRenderingContext2D, artImg: HTMLImageElement | null) {
  // Metallic dark gradient base
  const grad = ctx.createLinearGradient(0, 0, TEX_W, 0);
  grad.addColorStop(0,    '#141210');
  grad.addColorStop(0.15, '#2a2620');
  grad.addColorStop(0.4,  '#3a3528');
  grad.addColorStop(0.6,  '#3a3528');
  grad.addColorStop(0.85, '#2a2620');
  grad.addColorStop(1,    '#141210');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Vertical sheen (top lighter, bottom darker — simulates light from above)
  const sheen = ctx.createLinearGradient(0, 0, 0, TEX_H);
  sheen.addColorStop(0,   'rgba(255,255,255,0.08)');
  sheen.addColorStop(0.25,'rgba(255,255,255,0.03)');
  sheen.addColorStop(0.75,'rgba(0,0,0,0.05)');
  sheen.addColorStop(1,   'rgba(0,0,0,0.18)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Specular highlight strip (left side — simulates key light reflection)
  const spec = ctx.createLinearGradient(TEX_W * 0.08, 0, TEX_W * 0.22, 0);
  spec.addColorStop(0,   'rgba(255,255,255,0)');
  spec.addColorStop(0.5, 'rgba(255,255,255,0.07)');
  spec.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = spec;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Print area (center 50% of width, 70% of height)
  const artX = TEX_W * 0.25;
  const artY = TEX_H * 0.15;
  const artW = TEX_W * 0.50;
  const artH = TEX_H * 0.70;

  if (artImg) {
    const scale = Math.min(artW / artImg.width, artH / artImg.height) * 0.9;
    const dw = artImg.width * scale;
    const dh = artImg.height * scale;
    const dx = artX + (artW - dw) / 2;
    const dy = artY + (artH - dh) / 2;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(artImg, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  } else {
    ctx.save();
    ctx.strokeStyle = 'rgba(212,175,55,0.5)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.strokeRect(artX, artY, artW, artH);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(212,175,55,0.65)';
    ctx.font = `bold ${TEX_H * 0.07}px Poppins, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Seu Logo Aqui', artX + artW / 2, artY + artH / 2 - TEX_H * 0.04);
    ctx.font = `${TEX_H * 0.045}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(212,175,55,0.4)';
    ctx.fillText('Área de Impressão', artX + artW / 2, artY + artH / 2 + TEX_H * 0.05);
    ctx.restore();
  }
}

export const CupPreview3D: React.FC<CupPreview3DProps> = ({ artUrl }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const texCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const rafRef = useRef<number>(0);

  // Update texture when art changes
  useEffect(() => {
    const texCanvas = texCanvasRef.current;
    const texture = textureRef.current;
    if (!texCanvas || !texture) return;

    const ctx = texCanvas.getContext('2d');
    if (!ctx) return;

    if (!artUrl) {
      buildTexture(ctx, null);
      texture.needsUpdate = true;
      return;
    }

    const img = new Image();
    img.onload = () => {
      buildTexture(ctx, img);
      texture.needsUpdate = true;
    };
    img.src = artUrl;
  }, [artUrl]);

  // Build scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // Scene & camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#2d2924');
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0.4, 6.2);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(4, 6, 5);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xD4AF37, 0.4);
    fill.position.set(-5, 1, -3);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(0, -4, -6);
    scene.add(rim);

    // Texture canvas
    const texCanvas = document.createElement('canvas');
    texCanvas.width = TEX_W;
    texCanvas.height = TEX_H;
    texCanvasRef.current = texCanvas;

    const ctx = texCanvas.getContext('2d')!;
    buildTexture(ctx, null);

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    textureRef.current = texture;

    // Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.2,
    });
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x606060,
      metalness: 0.95,
      roughness: 0.08,
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1a1714,
      metalness: 0.82,
      roughness: 0.3,
    });
    const lidMat = new THREE.MeshStandardMaterial({
      color: 0x252018,
      metalness: 0.75,
      roughness: 0.45,
    });

    // Environment map for metallic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment()).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Cup group
    const cup = new THREE.Group();
    scene.add(cup);

    // Body
    const bodyGeo = new THREE.CylinderGeometry(1.0, 0.87, 3.0, 96, 1, true);
    cup.add(new THREE.Mesh(bodyGeo, bodyMat));

    // Bottom cap
    const bottomGeo = new THREE.CircleGeometry(0.87, 64);
    const bottomMesh = new THREE.Mesh(bottomGeo, darkMat);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = -1.5;
    cup.add(bottomMesh);

    // Bottom rubber ring (small torus)
    const rubberGeo = new THREE.TorusGeometry(0.78, 0.04, 12, 64);
    const rubberMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0, roughness: 0.95 });
    const rubber = new THREE.Mesh(rubberGeo, rubberMat);
    rubber.rotation.x = Math.PI / 2;
    rubber.position.y = -1.46;
    cup.add(rubber);

    // Top rim
    const rimGeo = new THREE.TorusGeometry(1.0, 0.045, 16, 96);
    const rimMesh = new THREE.Mesh(rimGeo, metalMat);
    rimMesh.position.y = 1.5;
    cup.add(rimMesh);

    // Lid body
    const lidBodyGeo = new THREE.CylinderGeometry(0.78, 1.01, 0.22, 64);
    const lidBody = new THREE.Mesh(lidBodyGeo, lidMat);
    lidBody.position.y = 1.61;
    cup.add(lidBody);

    // Lid top flat disk
    const lidTopGeo = new THREE.CylinderGeometry(0.76, 0.78, 0.06, 64);
    const lidTop = new THREE.Mesh(lidTopGeo, lidMat);
    lidTop.position.y = 1.75;
    cup.add(lidTop);

    // Lid opening button (small cylinder)
    const btnGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.1, 32);
    const btn = new THREE.Mesh(btnGeo, metalMat);
    btn.position.y = 1.83;
    cup.add(btn);

    // Initial art load
    if (artUrl) {
      const img = new Image();
      img.onload = () => { buildTexture(ctx, img); texture.needsUpdate = true; };
      img.src = artUrl;
    }

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4;
    controls.maxDistance = 9;
    controls.maxPolarAngle = Math.PI * 0.78;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.4;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    controls.addEventListener('end', () => {
      setTimeout(() => { controls.autoRotate = true; }, 2500);
    });

    // Animate
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ height: 420 }}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white/70 text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 9l7-7 7 7"/><path d="M5 15l7 7 7-7"/></svg>
        Arraste para rotacionar
      </div>
    </div>
  );
};
