import type { GradientStop, PickerMode, PickerState, ScreenPoint } from '@shared/types';
import { saveSessionState } from '@shared/storage';

let state: PickerState = {
  status: 'idle',
  mode: 'multipoint',
  currentStops: [],
};

let activeTabId: number | null = null;

function setState(next: Partial<PickerState>) {
  state = { ...state, ...next };
  saveSessionState(state);
  // Notify popup
  chrome.runtime.sendMessage({ type: 'PICKER_STATE_CHANGED', state }).catch(() => {
    // Popup may not be open
  });
}

async function captureScreenshot(tabId: number): Promise<string> {
  const dataUrl = await chrome.tabs.captureVisibleTab(null as unknown as number, {
    format: 'png',
  });
  return dataUrl;
}

async function injectContentScript(tabId: number) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content/picker.js'],
    });
  } catch (err) {
    console.error('Failed to inject content script:', err);
  }
}

async function startPicking(mode: PickerMode) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  activeTabId = tab.id;

  setState({
    status: mode === 'linear' ? 'linear_start' : 'picking',
    mode,
    currentStops: [],
    linearStart: undefined,
    linearEnd: undefined,
  });

  await injectContentScript(tab.id);

  // Send screenshot for canvas-based sampling
  const screenshot = await captureScreenshot(tab.id);
  chrome.tabs.sendMessage(tab.id, { type: 'SCREENSHOT_DATA', dataUrl: screenshot });
  chrome.tabs.sendMessage(tab.id, { type: 'START_PICKING', mode });
}

function stopPicking() {
  if (activeTabId != null) {
    chrome.tabs.sendMessage(activeTabId, { type: 'STOP_PICKING' }).catch(() => {});
  }
  setState({ status: 'idle' });
  activeTabId = null;
}

// Handle messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_PICKER_STATE':
      sendResponse({ state });
      return false;

    case 'START_PICKING':
      startPicking(message.mode);
      return false;

    case 'STOP_PICKING':
      stopPicking();
      return false;

    case 'COLOR_PICKED': {
      const stop: GradientStop = {
        color: message.color,
        position: 0,
        screenPoint: message.position,
      };
      const stops = [...state.currentStops, stop];
      // Redistribute positions evenly
      const distributed = stops.map((s, i) => ({
        ...s,
        position: stops.length === 1 ? 0 : i / (stops.length - 1),
      }));
      setState({ currentStops: distributed });
      return false;
    }

    case 'LINEAR_POINTS_SET': {
      setState({
        status: 'idle',
        currentStops: message.stops,
        linearStart: message.start,
        linearEnd: message.end,
      });
      activeTabId = null;
      return false;
    }

    case 'REQUEST_SCREENSHOT': {
      if (activeTabId != null) {
        captureScreenshot(activeTabId).then((dataUrl) => {
          chrome.tabs.sendMessage(activeTabId!, {
            type: 'SCREENSHOT_DATA',
            dataUrl,
          });
        });
      }
      return false;
    }

    case 'UPDATE_STOPS':
      setState({ currentStops: message.stops });
      return false;

    case 'UPDATE_ANGLE':
      // Angle is stored in popup state, not picker state
      return false;

    case 'SAVE_TO_HISTORY':
    case 'GET_HISTORY':
    case 'DELETE_HISTORY':
    case 'CLEAR_HISTORY':
      // These are handled directly by popup via storage module
      return false;
  }
});
