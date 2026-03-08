import type { RGBAColor, ScreenPoint } from '@shared/types';
import { rgbaToHex } from '@shared/color-utils';

let host: HTMLElement | null = null;
let shadow: ShadowRoot | null = null;
let dotsContainer: HTMLElement | null = null;
let lineEl: HTMLElement | null = null;
let tooltipEl: HTMLElement | null = null;

const OVERLAY_CSS = `
  :host {
    all: initial;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2147483647;
    pointer-events: none;
  }
  .mpg-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2147483647;
    pointer-events: none;
  }
  .mpg-dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    transform: translate(-50%, -50%);
    transition: transform 0.15s ease;
  }
  .mpg-dot.start, .mpg-dot.end {
    width: 18px;
    height: 18px;
    border-width: 3px;
  }
  .mpg-line {
    position: absolute;
    height: 2px;
    background: rgba(255,255,255,0.7);
    box-shadow: 0 0 4px rgba(0,0,0,0.5);
    transform-origin: left center;
    pointer-events: none;
  }
  .mpg-tooltip {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    white-space: nowrap;
    pointer-events: none;
    backdrop-filter: blur(4px);
  }
`;

export function createOverlay() {
  if (host) return;

  host = document.createElement('mpg-overlay');
  shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = OVERLAY_CSS;
  shadow.appendChild(style);

  dotsContainer = document.createElement('div');
  dotsContainer.className = 'mpg-container';
  const scrollW = document.documentElement.scrollWidth;
  const scrollH = document.documentElement.scrollHeight;
  dotsContainer.style.width = `${scrollW}px`;
  dotsContainer.style.height = `${scrollH}px`;
  host.style.width = `${scrollW}px`;
  host.style.height = `${scrollH}px`;
  shadow.appendChild(dotsContainer);

  document.documentElement.appendChild(host);
}

export function removeOverlay() {
  if (host) {
    host.remove();
    host = null;
    shadow = null;
    dotsContainer = null;
    lineEl = null;
    tooltipEl = null;
  }
}

export function addDot(x: number, y: number, color: RGBAColor, type?: 'start' | 'end') {
  if (!dotsContainer) return;

  const dot = document.createElement('div');
  dot.className = `mpg-dot ${type || ''}`;
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.backgroundColor = rgbaToHex(color);
  dotsContainer.appendChild(dot);
}

export function drawLine(start: ScreenPoint, end: ScreenPoint) {
  if (!dotsContainer) return;

  if (lineEl) lineEl.remove();

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  lineEl = document.createElement('div');
  lineEl.className = 'mpg-line';
  lineEl.style.left = `${start.x}px`;
  lineEl.style.top = `${start.y}px`;
  lineEl.style.width = `${length}px`;
  lineEl.style.transform = `rotate(${angle}deg)`;
  dotsContainer.appendChild(lineEl);
}

export function showTooltip(text: string) {
  if (!dotsContainer) return;

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.className = 'mpg-tooltip';
    dotsContainer.appendChild(tooltipEl);
  }
  tooltipEl.textContent = text;
}

export function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
}

export function clearDots() {
  if (!dotsContainer) return;
  while (dotsContainer.firstChild) {
    dotsContainer.firstChild.remove();
  }
  lineEl = null;
  tooltipEl = null;
}

export function setCrosshair(enabled: boolean) {
  document.documentElement.style.cursor = enabled ? 'crosshair' : '';
}
