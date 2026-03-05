import type { RGBAColor } from './types';

export function rgbaToHex(color: RGBAColor): string {
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function rgbaToRgbString(color: RGBAColor): string {
  if (color.a < 1) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a.toFixed(2)})`;
  }
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function rgbaToHsl(color: RGBAColor): { h: number; s: number; l: number } {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbaToHslString(color: RGBAColor): string {
  const { h, s, l } = rgbaToHsl(color);
  if (color.a < 1) {
    return `hsla(${h}, ${s}%, ${l}%, ${color.a.toFixed(2)})`;
  }
  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function hexToRgba(hex: string): RGBAColor {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
    a: 1,
  };
}

export function screenAngleToCssAngle(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): number {
  const rad = Math.atan2(endX - startX, startY - endY);
  let deg = rad * (180 / Math.PI);
  if (deg < 0) deg += 360;
  return Math.round(deg);
}
