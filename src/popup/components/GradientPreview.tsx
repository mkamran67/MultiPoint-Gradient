import { useRef, useEffect } from 'preact/hooks';
import type { GradientData } from '@shared/types';
import { rgbaToHex } from '@shared/color-utils';

interface Props {
  gradient: GradientData;
}

export function GradientPreview({ gradient }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gradient.stops.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const angleRad = ((gradient.angle - 90) * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const len = Math.sqrt(w * w + h * h) / 2;

    const x0 = cx - Math.cos(angleRad) * len;
    const y0 = cy - Math.sin(angleRad) * len;
    const x1 = cx + Math.cos(angleRad) * len;
    const y1 = cy + Math.sin(angleRad) * len;

    const lg = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const stop of gradient.stops) {
      const hex = rgbaToHex(stop.color);
      lg.addColorStop(stop.position, hex);
    }

    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);
  }, [gradient]);

  return (
    <div class="gradient-preview">
      <canvas ref={canvasRef} width={360} height={60} class="gradient-canvas" />
    </div>
  );
}
