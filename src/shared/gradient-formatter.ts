import type { GradientData } from './types';
import { rgbaToHex } from './color-utils';

export function formatAsCSS(gradient: GradientData): string {
  const stops = gradient.stops
    .map((s) => `${rgbaToHex(s.color)} ${Math.round(s.position * 100)}%`)
    .join(', ');
  return `linear-gradient(${gradient.angle}deg, ${stops})`;
}

export function formatAsTailwind(gradient: GradientData): string {
  const stops = gradient.stops
    .map((s) => `${rgbaToHex(s.color)}_${Math.round(s.position * 100)}%`)
    .join(',');
  return `bg-[linear-gradient(${gradient.angle}deg,${stops})]`;
}

export function formatAsSVG(gradient: GradientData): string {
  const angleRad = ((gradient.angle - 90) * Math.PI) / 180;
  const x1 = Math.round((50 + Math.cos(angleRad + Math.PI) * 50) * 100) / 100;
  const y1 = Math.round((50 + Math.sin(angleRad + Math.PI) * 50) * 100) / 100;
  const x2 = Math.round((50 + Math.cos(angleRad) * 50) * 100) / 100;
  const y2 = Math.round((50 + Math.sin(angleRad) * 50) * 100) / 100;

  const stops = gradient.stops
    .map(
      (s) =>
        `  <stop offset="${Math.round(s.position * 100)}%" stop-color="${rgbaToHex(s.color)}"${s.color.a < 1 ? ` stop-opacity="${s.color.a}"` : ''} />`
    )
    .join('\n');

  return `<linearGradient id="gradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
${stops}
</linearGradient>`;
}

export function formatAsRaw(gradient: GradientData): string {
  const data = gradient.stops.map((s) => ({
    color: rgbaToHex(s.color),
    position: Math.round(s.position * 100) / 100,
  }));
  return JSON.stringify(data, null, 2);
}

export function formatGradient(
  gradient: GradientData,
  format: 'css' | 'tailwind' | 'svg' | 'raw'
): string {
  switch (format) {
    case 'css':
      return formatAsCSS(gradient);
    case 'tailwind':
      return formatAsTailwind(gradient);
    case 'svg':
      return formatAsSVG(gradient);
    case 'raw':
      return formatAsRaw(gradient);
  }
}
