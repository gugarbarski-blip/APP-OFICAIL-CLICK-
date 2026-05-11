import React, { useRef, useEffect, useCallback } from 'react';

interface ArtPreviewCanvasProps {
  artUrl: string | null;
}

const W = 300;
const H = 420;
// Print area on canvas coordinates (centered on cup body)
const PRINT = { x: 102, y: 157, w: 96, h: 105 };

function drawCup(ctx: CanvasRenderingContext2D) {
  // Scale from SVG 200x280 viewBox to canvas 300x420
  const sx = W / 200;
  const sy = H / 280;

  ctx.save();
  ctx.scale(sx, sy);

  // Lid top
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.ellipse(100, 32, 52, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lid body
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.roundRect(52, 28, 96, 18, 4);
  ctx.fill();

  // Lid groove
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.roundRect(68, 34, 64, 6, 3);
  ctx.fill();

  // Button top
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(88, 16, 24, 16, 4);
  ctx.fill();

  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.roundRect(93, 10, 14, 10, 3);
  ctx.fill();

  // Cup body
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.moveTo(58, 44);
  ctx.quadraticCurveTo(52, 46, 50, 55);
  ctx.lineTo(44, 220);
  ctx.quadraticCurveTo(43, 235, 58, 240);
  ctx.lineTo(142, 240);
  ctx.quadraticCurveTo(157, 235, 156, 220);
  ctx.lineTo(150, 55);
  ctx.quadraticCurveTo(148, 46, 142, 44);
  ctx.closePath();
  ctx.fill();

  // Gloss highlight
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.moveTo(68, 50);
  ctx.quadraticCurveTo(62, 52, 60, 60);
  ctx.lineTo(56, 190);
  ctx.quadraticCurveTo(58, 195, 65, 196);
  ctx.lineTo(75, 196);
  ctx.lineTo(79, 60);
  ctx.quadraticCurveTo(78, 52, 72, 50);
  ctx.closePath();
  ctx.fill();

  // Bottom ellipse
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.ellipse(100, 238, 42, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0d0d0d';
  ctx.beginPath();
  ctx.ellipse(100, 236, 36, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Handle
  ctx.fillStyle = '#222222';
  ctx.beginPath();
  ctx.roundRect(143, 120, 18, 50, 9);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.roundRect(145, 124, 14, 42, 7);
  ctx.fill();

  ctx.restore();
}

function drawPrintAreaPlaceholder(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.strokeRect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Seu Logo Aqui', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 - 6);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillText('Área de Impressão', PRINT.x + PRINT.w / 2, PRINT.y + PRINT.h / 2 + 10);
  ctx.restore();
}

export const ArtPreviewCanvas: React.FC<ArtPreviewCanvasProps> = ({ artUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    drawCup(ctx);

    if (!artUrl) {
      drawPrintAreaPlaceholder(ctx);
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, W, H);
      drawCup(ctx);

      // Clip to print area and draw art
      ctx.save();
      ctx.beginPath();
      ctx.rect(PRINT.x, PRINT.y, PRINT.w, PRINT.h);
      ctx.clip();

      const ratio = Math.min(PRINT.w / img.width, PRINT.h / img.height);
      const dw = img.width * ratio;
      const dh = img.height * ratio;
      const dx = PRINT.x + (PRINT.w - dw) / 2;
      const dy = PRINT.y + (PRINT.h - dh) / 2;

      ctx.globalAlpha = 0.9;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // Re-draw gloss on top
      ctx.save();
      const sx = W / 200;
      const sy = H / 280;
      ctx.scale(sx, sy);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(68, 50);
      ctx.quadraticCurveTo(62, 52, 60, 60);
      ctx.lineTo(56, 190);
      ctx.quadraticCurveTo(58, 195, 65, 196);
      ctx.lineTo(75, 196);
      ctx.lineTo(79, 60);
      ctx.quadraticCurveTo(78, 52, 72, 50);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    img.src = artUrl;
  }, [artUrl]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="max-w-full"
      style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))' }}
    />
  );
};
