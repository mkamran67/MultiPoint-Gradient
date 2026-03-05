import { loadScreenshot, sampleColorAt, sampleLinearPath, isReady } from './canvas-sampler';
import { createOverlay, removeOverlay, addDot, drawLine, showTooltip, hideTooltip, clearDots, setCrosshair } from './overlay';
import { screenAngleToCssAngle } from '@shared/color-utils';
import type { ScreenPoint, PickerMode } from '@shared/types';

let isActive = false;
let mode: PickerMode = 'multipoint';
let linearStart: ScreenPoint | null = null;
let scrollDebounceTimer: ReturnType<typeof setTimeout> | null = null;

const LINEAR_SAMPLE_COUNT = 10;

function onClick(e: MouseEvent) {
  if (!isActive || !isReady()) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  // clientX/clientY for viewport-relative canvas sampling
  const cx = e.clientX;
  const cy = e.clientY;
  // pageX/pageY for document-relative dot placement
  const px = e.pageX;
  const py = e.pageY;
  const color = sampleColorAt(cx, cy);
  if (!color) return;

  if (mode === 'multipoint') {
    addDot(px, py, color);
    chrome.runtime.sendMessage({
      type: 'COLOR_PICKED',
      color,
      position: { x: cx, y: cy },
    });
  } else if (mode === 'linear') {
    if (!linearStart) {
      // First click: set start point
      linearStart = { x: px, y: py };
      addDot(px, py, color, 'start');
      showTooltip('Click the end point of your gradient line');
    } else {
      // Second click: set end point, sample along line
      const end = { x: px, y: py };
      addDot(px, py, color, 'end');
      drawLine(linearStart, end);

      // Use viewport coords for canvas sampling along the line
      const sampleStart = { x: linearStart.x - window.scrollX, y: linearStart.y - window.scrollY };
      const sampleEnd = { x: cx, y: cy };
      const stops = sampleLinearPath(sampleStart, sampleEnd, LINEAR_SAMPLE_COUNT);
      const angle = screenAngleToCssAngle(sampleStart.x, sampleStart.y, sampleEnd.x, sampleEnd.y);

      // Show sampled dots along the line (convert viewport screenPoints to page coords)
      for (const stop of stops) {
        if (stop.screenPoint) {
          addDot(stop.screenPoint.x + window.scrollX, stop.screenPoint.y + window.scrollY, stop.color);
        }
      }

      hideTooltip();
      chrome.runtime.sendMessage({
        type: 'LINEAR_POINTS_SET',
        start: linearStart,
        end,
        stops,
        angle,
      });

      // Clean up after a brief delay so user can see the result
      setTimeout(() => {
        cleanup();
      }, 1500);
    }
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isActive) {
    e.preventDefault();
    chrome.runtime.sendMessage({ type: 'STOP_PICKING' });
    cleanup();
  }
}

function onScroll() {
  if (!isActive) return;
  if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
  scrollDebounceTimer = setTimeout(() => {
    chrome.runtime.sendMessage({ type: 'REQUEST_SCREENSHOT' });
  }, 300);
}

function startPicking(pickerMode: PickerMode) {
  if (isActive) return;

  isActive = true;
  mode = pickerMode;
  linearStart = null;

  createOverlay();
  setCrosshair(true);

  if (mode === 'linear') {
    showTooltip('Click the start point of your gradient line');
  } else {
    showTooltip('Click to pick colors. Press Escape or use shortcut to stop.');
  }

  // Use capture phase to intercept clicks before the page
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

function cleanup() {
  isActive = false;
  linearStart = null;

  setCrosshair(false);

  document.removeEventListener('click', onClick, true);
  document.removeEventListener('keydown', onKeyDown, true);
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);

  if (scrollDebounceTimer) {
    clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = null;
  }

  // Delay overlay removal so user can see dots briefly
  setTimeout(() => {
    removeOverlay();
  }, 800);
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'START_PICKING':
      startPicking(message.mode);
      break;

    case 'STOP_PICKING':
      cleanup();
      break;

    case 'SCREENSHOT_DATA':
      loadScreenshot(message.dataUrl);
      break;
  }
});
