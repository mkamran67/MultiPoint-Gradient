import type { RGBAColor, ScreenPoint, GradientStop } from '@shared/types';

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let imageData: ImageData | null = null;
let currentDpr = 1;

export function loadScreenshot(dataUrl: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (!canvas) {
        canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d', { willReadFrequently: true });
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.drawImage(img, 0, 0);
      imageData = ctx!.getImageData(0, 0, img.width, img.height);
      currentDpr = window.devicePixelRatio || 1;
      resolve();
    };
    img.src = dataUrl;
  });
}

export function sampleColorAt(x: number, y: number): RGBAColor | null {
  if (!imageData) return null;

  const px = Math.round(x * currentDpr);
  const py = Math.round(y * currentDpr);

  if (px < 0 || py < 0 || px >= imageData.width || py >= imageData.height) return null;

  const idx = (py * imageData.width + px) * 4;
  return {
    r: imageData.data[idx],
    g: imageData.data[idx + 1],
    b: imageData.data[idx + 2],
    a: imageData.data[idx + 3] / 255,
  };
}

export function sampleLinearPath(
  start: ScreenPoint,
  end: ScreenPoint,
  sampleCount: number
): GradientStop[] {
  const stops: GradientStop[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const t = sampleCount === 1 ? 0 : i / (sampleCount - 1);
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    const color = sampleColorAt(x, y);
    if (color) {
      stops.push({
        color,
        position: t,
        screenPoint: { x, y },
      });
    }
  }
  return stops;
}

export function isReady(): boolean {
  return imageData !== null;
}
