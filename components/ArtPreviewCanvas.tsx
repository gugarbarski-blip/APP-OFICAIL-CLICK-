import React, { useRef, useEffect, useCallback } from 'react';

interface ArtPreviewCanvasProps {
  artUrl: string | null;
  cupImageUrl: string;
  customizationType?: 'serigrafia' | 'laser';
  serigrafiaColorHex?: string;
}

const W = 300;
const H = 420;

// Print areas derived from physical measurements per product
// Copo 475ml: 12cm×6cm gravação / 17.1cm×9.1cm copo
// Cuia 320ml:  4cm×5cm gravação / 11.7cm×8.7cm copo
const PRINT_AREAS: Record<string, { x: number; y: number; w: number; h: number }> = {
  '/CopoPreview475.webp':        { x: 93,  y: 155, w: 68,  h: 129 },
  '/CopoCuia.webp':              { x: 63,  y: 144, w: 153, h: 127 },
  '/EcoBagPreview.semlogo.webp': { x: 99,  y: 190, w: 104, h: 151 },
  '/Moleskine.SemLogo.webp':     { x: 72,  y: 71,  w: 136, h: 272 },
};
const PRINT_DEFAULT = { x: 59, y: 71, w: 136, h: 272 };

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function applySerigrafiaColor(src: HTMLImageElement, hex: string): HTMLCanvasElement {
  const [r, g, b] = hexToRgb(hex);
  const off = document.createElement('canvas');
  off.width  = src.naturalWidth  || src.width;
  off.height = src.naturalHeight || src.height;
  const ctx = off.getContext('2d')!;
  ctx.drawImage(src, 0, 0);
  const data = ctx.getImageData(0, 0, off.width, off.height);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] > 20) {   // non-transparent pixel
      px[i]     = r;
      px[i + 1] = g;
      px[i + 2] = b;
    }
  }
  ctx.putImageData(data, 0, 0);
  return off;
}

export const ArtPreviewCanvas: React.FC<ArtPreviewCanvasProps> = ({
  artUrl,
  cupImageUrl,
  customizationType = 'serigrafia',
  serigrafiaColorHex = '#1a1a1a',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cupImage = new Image();
    cupImage.src = cupImageUrl;

    const PRINT = PRINT_AREAS[cupImageUrl] ?? PRINT_DEFAULT;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#6b6257');
      grad.addColorStop(0.5, '#4d473f');
      grad.addColorStop(1, '#36322c');
      ctx.fillStyle = grad;
      ctx.roundRect(0, 0, W, H, 12);
      ctx.fill();

      // Cup image (cover-fit)
      const imgRatio = cupImage.naturalWidth / cupImage.naturalHeight;
      const canvasRatio = W / H;
      let sx = 0, sy = 0, sw = cupImage.naturalWidth, sh = cupImage.naturalHeight;
      if (imgRatio > canvasRatio) {
        sw = cupImage.naturalHeight * canvasRatio;
        sx = (cupImage.naturalWidth - sw) / 2;
      } else {
        sh = cupImage.naturalWidth / canvasRatio;
        sy = (cupImage.naturalHeight - sh) / 2;
      }
      ctx.drawImage(cupImage, sx, sy, sw, sh, 0, 0, W, H);

      if (!artUrl) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Seu Logo Aqui', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 - 6);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Área de Impressão', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 + 12);
        ctx.restore();
        return;
      }

      const art = new Image();
      art.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);
        ctx.clip();

        const ratio = Math.min(PRINT.w / art.width, PRINT.h / art.height);
        const dw = art.width  * ratio;
        const dh = art.height * ratio;
        const dx = PRINT.x + (PRINT.w - dw) / 2;
        const dy = PRINT.y + (PRINT.h - dh) / 2;

        if (customizationType === 'serigrafia') {
          ctx.globalAlpha = 0.92;
          ctx.drawImage(art, dx, dy, dw, dh);
        } else {
          // Laser: draw as-is (engraved look, slightly transparent)
          ctx.globalAlpha = 0.82;
          ctx.drawImage(art, dx, dy, dw, dh);
        }
        ctx.restore();
      };
      art.src = artUrl;
    };

    if (cupImage.complete && cupImage.naturalWidth > 0) {
      draw();
    } else {
      cupImage.onload = draw;
    }
  }, [artUrl, cupImageUrl, customizationType, serigrafiaColorHex]);

  useEffect(() => { render(); }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="max-w-full rounded-xl"
      style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.35))' }}
    />
  );
};
