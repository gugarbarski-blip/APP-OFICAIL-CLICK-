import React, { useRef, useEffect, useCallback } from 'react';

interface ArtPreviewCanvasProps {
  artUrl: string | null;
}

const W = 320;
const H = 400;

// Approximate print area on the cup photo (centered on cup body)
// Adjust these values if the art appears off-center on the real photo
const PRINT = { x: 88, y: 148, w: 144, h: 136 };

const CUP_IMG_SRC = '/images/copo-mockup.png';

function drawPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Sua Arte Aqui', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 - 6);

  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillText('Faça upload do seu logo', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 + 14);
  ctx.restore();
}

export const ArtPreviewCanvas: React.FC<ArtPreviewCanvasProps> = ({ artUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cupImgRef = useRef<HTMLImageElement | null>(null);

  // Pre-load cup image once
  useEffect(() => {
    const img = new Image();
    img.src = CUP_IMG_SRC;
    img.onload = () => {
      cupImgRef.current = img;
      renderFrame(canvasRef.current, img, null);
    };
  }, []);

  const render = useCallback(() => {
    if (!cupImgRef.current) return;
    renderFrame(canvasRef.current, cupImgRef.current, artUrl);
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
      style={{ filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.45))' }}
    />
  );
};

function renderFrame(
  canvas: HTMLCanvasElement | null,
  cupImg: HTMLImageElement,
  artUrl: string | null
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, W, H);

  // Draw cup photo scaled to fill canvas
  ctx.drawImage(cupImg, 0, 0, W, H);

  if (!artUrl) {
    drawPlaceholder(ctx);
    return;
  }

  const art = new Image();
  art.onload = () => {
    // Redraw cup first
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(cupImg, 0, 0, W, H);

    // Clip to print area and draw art with slight transparency to blend
    ctx.save();
    ctx.beginPath();
    ctx.rect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);
    ctx.clip();

    // Blend mode to integrate with cup texture
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.85;

    const ratio = Math.min(PRINT.w / art.width, PRINT.h / art.height);
    const dw = art.width * ratio;
    const dh = art.height * ratio;
    const dx = PRINT.x + (PRINT.w - dw) / 2;
    const dy = PRINT.y + (PRINT.h - dh) / 2;

    ctx.drawImage(art, dx, dy, dw, dh);
    ctx.restore();
  };
  art.src = artUrl;
}
