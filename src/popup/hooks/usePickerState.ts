import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { GradientStop, PickerMode, PickerState } from '@shared/types';

const defaultState: PickerState = {
  status: 'idle',
  mode: 'multipoint',
  currentStops: [],
};

const pickerState = signal<PickerState>(defaultState);

export function usePickerState() {
  useEffect(() => {
    // Get initial state
    chrome.runtime.sendMessage({ type: 'GET_PICKER_STATE' }, (response) => {
      if (response?.state) {
        pickerState.value = response.state;
      }
    });

    // Listen for state changes
    function onMessage(message: { type: string; state?: PickerState }) {
      if (message.type === 'PICKER_STATE_CHANGED' && message.state) {
        pickerState.value = message.state;
      }
    }

    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  function startPicking(mode: PickerMode) {
    chrome.runtime.sendMessage({ type: 'START_PICKING', mode });
  }

  function stopPicking() {
    chrome.runtime.sendMessage({ type: 'STOP_PICKING' });
  }

  function updateStops(stops: GradientStop[]) {
    chrome.runtime.sendMessage({ type: 'UPDATE_STOPS', stops });
    pickerState.value = { ...pickerState.value, currentStops: stops };
  }

  return {
    pickerState,
    startPicking,
    stopPicking,
    updateStops,
  };
}
