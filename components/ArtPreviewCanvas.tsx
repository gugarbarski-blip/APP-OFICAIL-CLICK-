import React, { useRef, useEffect, useCallback } from 'react';

interface ArtPreviewCanvasProps {
  artUrl: string | null;
}

const W = 300;
const H = 420;
// Print area mapped to the black body of the cup photo
const PRINT = { x: 78, y: 130, w: 144, h: 160 };

const cupImage = new Image();
cupImage.src = '/Copo.jpg.png';

export const ArtPreviewCanvas: React.FC<ArtPreviewCanvasProps> = ({ artUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw cup photo filling the canvas (center-crop)
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
        // Dashed border placeholder
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Seu Logo Aqui', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 - 6);
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('Área de Impressão', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 + 12);
        ctx.restore();
        return;
      }

      // Draw uploaded art clipped to print area
      const art = new Image();
      art.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.rect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);
        ctx.clip();

        const ratio = Math.min(PRINT.w / art.width, PRINT.h / art.height);
        const dw = art.width * ratio;
        const dh = art.height * ratio;
        const dx = PRINT.x + (PRINT.w - dw) / 2;
        const dy = PRINT.y + (PRINT.h - dh) / 2;

        ctx.globalAlpha = 0.88;
        ctx.drawImage(art, dx, dy, dw, dh);
        ctx.restore();
      };
      art.src = artUrl;
    };

    if (cupImage.complete && cupImage.naturalWidth > 0) {
      draw();
    } else {
      cupImage.onload = draw;
    }
  }, [artUrl]);

  useEffect(() => {
    render();
  }, [render]);

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
