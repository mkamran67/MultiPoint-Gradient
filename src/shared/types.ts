export interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

export interface GradientStop {
  color: RGBAColor;
  position: number; // 0.0 to 1.0
  screenPoint?: ScreenPoint;
}

export interface GradientData {
  stops: GradientStop[];
  angle: number; // degrees (CSS convention: 0=up, 90=right)
  mode: PickerMode;
}

export interface HistoryEntry {
  id: string;
  gradient: GradientData;
  timestamp: number;
  sourceUrl: string;
}

export type PickerMode = 'multipoint' | 'linear';

export type PickerStatus =
  | 'idle'
  | 'picking'
  | 'linear_start'
  | 'linear_end';

export interface PickerState {
  status: PickerStatus;
  mode: PickerMode;
  currentStops: GradientStop[];
  linearStart?: ScreenPoint;
  linearEnd?: ScreenPoint;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export type OutputFormat = 'css' | 'tailwind' | 'svg' | 'raw';

export interface UserSettings {
  defaultFormat: OutputFormat;
  maxHistorySize: number;
  linearSampleCount: number;
  theme: ThemePreference;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultFormat: 'css',
  maxHistorySize: 100,
  linearSampleCount: 10,
  theme: 'system',
};
