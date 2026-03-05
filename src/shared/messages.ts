import type { GradientStop, HistoryEntry, PickerMode, PickerState, ScreenPoint } from './types';

// Popup → Background
export type PopupToBackground =
  | { type: 'START_PICKING'; mode: PickerMode }
  | { type: 'STOP_PICKING' }
  | { type: 'GET_PICKER_STATE' }
  | { type: 'SAVE_TO_HISTORY'; entry: HistoryEntry }
  | { type: 'GET_HISTORY' }
  | { type: 'DELETE_HISTORY'; id: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_STOPS'; stops: GradientStop[] }
  | { type: 'UPDATE_ANGLE'; angle: number };

// Background → Content Script
export type BackgroundToContent =
  | { type: 'START_PICKING'; mode: PickerMode }
  | { type: 'STOP_PICKING' }
  | { type: 'SCREENSHOT_DATA'; dataUrl: string };

// Content Script → Background
export type ContentToBackground =
  | { type: 'COLOR_PICKED'; color: { r: number; g: number; b: number; a: number }; position: ScreenPoint }
  | { type: 'LINEAR_POINTS_SET'; start: ScreenPoint; end: ScreenPoint; stops: GradientStop[]; angle: number }
  | { type: 'REQUEST_SCREENSHOT' };

// Background → Popup (via storage change or direct response)
export type BackgroundToPopup =
  | { type: 'PICKER_STATE_CHANGED'; state: PickerState }
  | { type: 'HISTORY_DATA'; entries: HistoryEntry[] };

export type Message = PopupToBackground | BackgroundToContent | ContentToBackground | BackgroundToPopup;
