import { signal, computed } from '@preact/signals';
import type { GradientData, GradientStop, PickerState, OutputFormat, ThemePreference } from '@shared/types';
import { DEFAULT_SETTINGS } from '@shared/types';
import { GradientPreview } from './components/GradientPreview';
import { ColorList } from './components/ColorList';
import { OutputTabs } from './components/OutputTabs';
import { OutputPanel } from './components/OutputPanel';
import { HistoryPanel, saveCurrentGradient } from './components/HistoryPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AnglePicker } from './components/AnglePicker';
import { usePickerState } from './hooks/usePickerState';
import { useTheme } from './hooks/useTheme';
import './styles/popup.css';

type View = 'main' | 'history' | 'settings';

const currentView = signal<View>('main');
const activeFormat = signal<OutputFormat>('css');
const gradientAngle = signal(90);

export function App() {
  const { pickerState, startPicking, stopPicking, updateStops } = usePickerState();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const gradient = computed<GradientData>(() => ({
    stops: pickerState.value.currentStops,
    angle: gradientAngle.value,
    mode: pickerState.value.mode,
  }));

  const isPicking = computed(
    () => pickerState.value.status !== 'idle'
  );

  function handleStartPicking(mode: 'multipoint' | 'linear') {
    startPicking(mode);
    window.close();
  }

  function handleStopPicking() {
    stopPicking();
  }

  function handleReorder(stops: GradientStop[]) {
    updateStops(stops);
  }

  function handleAngleChange(angle: number) {
    gradientAngle.value = angle;
  }

  function handleLoadGradient(g: GradientData) {
    updateStops(g.stops);
    gradientAngle.value = g.angle;
    currentView.value = 'main';
  }

  return (
    <div class={`app ${resolvedTheme.value}`}>
      <header class="header">
        <h1 class="title">MultiPoint Gradient</h1>
        <nav class="nav">
          <button
            class={`nav-btn ${currentView.value === 'main' ? 'active' : ''}`}
            onClick={() => (currentView.value = 'main')}
          >
            Gradient
          </button>
          <button
            class={`nav-btn ${currentView.value === 'history' ? 'active' : ''}`}
            onClick={() => (currentView.value = 'history')}
          >
            History
          </button>
          <button
            class={`nav-btn ${currentView.value === 'settings' ? 'active' : ''}`}
            onClick={() => (currentView.value = 'settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      {currentView.value === 'main' && (
        <main class="main-view">
          <div class="picker-controls">
            {isPicking.value ? (
              <button class="btn btn-stop" onClick={handleStopPicking}>
                Stop Picking
              </button>
            ) : (
              <div class="btn-group">
                <button class="btn btn-primary" onClick={() => handleStartPicking('multipoint')}>
                  Pick Colors
                </button>
                <button class="btn btn-secondary" onClick={() => handleStartPicking('linear')}>
                  Linear Sample
                </button>
              </div>
            )}
          </div>

          {gradient.value.stops.length > 0 && (
            <>
              <GradientPreview gradient={gradient.value} />
              <AnglePicker angle={gradientAngle.value} onChange={handleAngleChange} />
              <ColorList stops={gradient.value.stops} onReorder={handleReorder} />
              <OutputTabs active={activeFormat.value} onChange={(f) => (activeFormat.value = f)} />
              <OutputPanel gradient={gradient.value} format={activeFormat.value} />
              <button
                class="btn btn-secondary"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => saveCurrentGradient(gradient.value, '')}
              >
                Save to History
              </button>
            </>
          )}

          {gradient.value.stops.length === 0 && !isPicking.value && (
            <div class="empty-state">
              <p>Click "Pick Colors" to start selecting colors from any webpage.</p>
              <p class="hint">Use "Linear Sample" to sample along a line.</p>
            </div>
          )}
        </main>
      )}

      {currentView.value === 'history' && (
        <HistoryPanel onLoad={handleLoadGradient} />
      )}

      {currentView.value === 'settings' && (
        <SettingsPanel theme={theme.value} onThemeChange={setTheme} />
      )}
    </div>
  );
}
