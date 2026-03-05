import type { ThemePreference } from '@shared/types';

interface Props {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

export function SettingsPanel({ theme, onThemeChange }: Props) {
  return (
    <div class="settings-panel">
      <h2>Settings</h2>

      <div class="setting-group">
        <label class="setting-label">Theme</label>
        <div class="theme-options">
          {(['system', 'light', 'dark'] as ThemePreference[]).map((t) => (
            <button
              key={t}
              class={`theme-btn ${theme === t ? 'active' : ''}`}
              onClick={() => onThemeChange(t)}
            >
              {t === 'system' ? 'System' : t === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </div>

      <div class="setting-group">
        <label class="setting-label">About</label>
        <p class="setting-description">
          MultiPoint Gradient v1.0.0
          <br />
          Pick colors from webpages and generate gradient code.
        </p>
      </div>
    </div>
  );
}
