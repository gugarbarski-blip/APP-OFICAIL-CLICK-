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

function drawTexture(ctx: CanvasRenderingContext2D, artImg: HTMLImageElement | null) {
  // True matte black base (preto fosco)
  const grad = ctx.createLinearGradient(0, 0, TEX_W, 0);
  grad.addColorStop(0,    '#050505');
  grad.addColorStop(0.12, '#111111');
  grad.addColorStop(0.35, '#1a1a1a');
  grad.addColorStop(0.5,  '#1e1e1e');
  grad.addColorStop(0.65, '#1a1a1a');
  grad.addColorStop(0.88, '#111111');
  grad.addColorStop(1,    '#050505');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Subtle vertical sheen (light from top)
  const sheen = ctx.createLinearGradient(0, 0, 0, TEX_H);
  sheen.addColorStop(0,    'rgba(255,255,255,0.06)');
  sheen.addColorStop(0.2,  'rgba(255,255,255,0.02)');
  sheen.addColorStop(0.8,  'rgba(0,0,0,0.04)');
  sheen.addColorStop(1,    'rgba(0,0,0,0.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Thin vertical highlight stripe (key light reflection)
  const stripe = ctx.createLinearGradient(TEX_W * 0.06, 0, TEX_W * 0.18, 0);
  stripe.addColorStop(0,   'rgba(255,255,255,0)');
  stripe.addColorStop(0.5, 'rgba(255,255,255,0.06)');
  stripe.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Art area: 46% wide, 68% tall, centered horizontally
  const artX = TEX_W * 0.27;
  const artY = TEX_H * 0.16;
  const artW = TEX_W * 0.46;
  const artH = TEX_H * 0.68;

  if (artImg) {
    const scale = Math.min(artW / artImg.width, artH / artImg.height) * 0.88;
    const dw = artImg.width * scale;
    const dh = artImg.height * scale;
    ctx.globalAlpha = 0.9;
    ctx.drawImage(artImg, artX + (artW - dw) / 2, artY + (artH - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  } else {
    ctx.save();
    ctx.strokeStyle = 'rgba(212,175,55,0.55)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 7]);
    ctx.strokeRect(artX, artY, artW, artH);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(212,175,55,0.7)';
    ctx.font = `bold ${Math.round(TEX_H * 0.068)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Seu Logo Aqui', artX + artW / 2, artY + artH / 2 - TEX_H * 0.04);
    ctx.font = `${Math.round(TEX_H * 0.042)}px Arial, sans-serif`;
    ctx.fillStyle = 'rgba(212,175,55,0.42)';
    ctx.fillText('Área de Impressão', artX + artW / 2, artY + artH / 2 + TEX_H * 0.055);
    ctx.restore();
  }
}

export const CupPreview3D: React.FC<CupPreview3DProps> = ({ artUrl }) => {
  const mountRef  = useRef<HTMLDivElement>(null);
  const texCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const rafRef    = useRef<number>(0);

  // Reload art whenever artUrl changes
  useEffect(() => {
    const ctx = texCtxRef.current;
    const tex = textureRef.current;
    if (!ctx || !tex) return;

    if (!artUrl) {
      drawTexture(ctx, null);
      tex.needsUpdate = true;
      return;
    }
    const img = new Image();
    img.onload = () => { drawTexture(ctx, img); tex.needsUpdate = true; };
    img.src = artUrl;
  }, [artUrl]);

  // Build scene once on mount
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth || 400;
    const H = mount.clientHeight || 420;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1814');

    const camera = new THREE.PerspectiveCamera(36, W / H, 0.1, 100);
    camera.position.set(0, 0.2, 6.5);

    /* ── Environment (reflections) ── */
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const key = new THREE.DirectionalLight(0xffffff, 2.5);
    key.position.set(3, 8, 5);
    key.castShadow = true;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffa060, 0.35);
    fill.position.set(-5, 2, -2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.5);
    rim.position.set(0, -3, -5);
    scene.add(rim);

    /* ── Texture canvas ── */
    const texCanvas = document.createElement('canvas');
    texCanvas.width  = TEX_W;
    texCanvas.height = TEX_H;
    const ctx = texCanvas.getContext('2d')!;
    texCtxRef.current = ctx;
    drawTexture(ctx, null);

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.wrapS = THREE.RepeatWrapping;
    textureRef.current = texture;

    /* ── Materials ── */
    // Matte black body with art texture
    const bodyMat = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0x111111,
      metalness: 0.45,
      roughness: 0.65,
    });
    // Shiny metal for rim / button
    const shineMat = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.95,
      roughness: 0.08,
    });
    // Dark matte for lid & bottom
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d0d,
      metalness: 0.35,
      roughness: 0.75,
    });
    // Pure rubber for the bottom ring
    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      metalness: 0,
      roughness: 1,
    });

    /* ── Cup group ── */
    const cup = new THREE.Group();
    scene.add(cup);

    // --- Body (open cylinder, slightly tapered: wider at top) ---
    // Real cup: top 9.1cm, ~bottom 8.2cm → ratio 0.9
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 0.9, 3.1, 96, 1, true),
      bodyMat,
    );
    cup.add(body);

    // --- Top inner edge (thin ring flush with body top) ---
    const innerRim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.97, 0.97, 0.06, 64),
      shineMat,
    );
    innerRim.position.y = 1.52;
    cup.add(innerRim);

    // --- Bottom cap ---
    const bottom = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 64),
      darkMat,
    );
    bottom.rotation.x = -Math.PI / 2;
    bottom.position.y = -1.55;
    cup.add(bottom);

    // --- Rubber foot ring (sits at base) ---
    const rubber = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.035, 12, 80),
      rubberMat,
    );
    rubber.rotation.x = Math.PI / 2;
    rubber.position.y = -1.5;
    cup.add(rubber);

    // --- Lid: flat disc that sits on top of the cup, same radius ---
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 0.14, 80),
      darkMat,
    );
    lid.position.y = 1.62;
    cup.add(lid);

    // --- Lid top surface (slightly inset disc) ---
    const lidTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.92, 0.04, 64),
      darkMat,
    );
    lidTop.position.y = 1.71;
    cup.add(lidTop);

    // --- Sliding button / opening mechanism (small low-profile bump) ---
    const btnBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 0.07, 48),
      darkMat,
    );
    btnBase.position.y = 1.76;
    cup.add(btnBase);

    const btnTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.28, 0.04, 48),
      shineMat,
    );
    btnTop.position.y = 1.805;
    cup.add(btnTop);

    /* ── OrbitControls ── */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan  = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 4;
    controls.maxDistance = 9;
    controls.minPolarAngle = Math.PI * 0.1;
    controls.maxPolarAngle = Math.PI * 0.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.3;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    controls.addEventListener('end',   () => { setTimeout(() => { controls.autoRotate = true; }, 2500); });

    /* ── Animate ── */
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /* ── Load initial art ── */
    if (artUrl) {
      const img = new Image();
      img.onload = () => { drawTexture(ctx, img); texture.needsUpdate = true; };
      img.src = artUrl;
    }

    /* ── Resize ── */
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ height: 420 }}>
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white/60 text-xs px-3 py-1.5 rounded-full pointer-events-none select-none">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 9l7-7 7 7"/><path d="M5 15l7 7 7-7"/>
        </svg>
        Arraste para rotacionar
      </div>
    </div>
  );
};
