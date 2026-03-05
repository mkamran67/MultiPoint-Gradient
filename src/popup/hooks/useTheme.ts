import { signal, computed } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { ThemePreference } from '@shared/types';
import { getSettings, updateSettings } from '@shared/storage';

const theme = signal<ThemePreference>('system');
const systemDark = signal(false);

export function useTheme() {
  useEffect(() => {
    // Load saved preference
    getSettings().then((s) => {
      theme.value = s.theme;
    });

    // Detect system theme
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.value = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      systemDark.value = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = computed(() => {
    if (theme.value === 'system') return systemDark.value ? 'dark' : 'light';
    return theme.value;
  });

  function setTheme(t: ThemePreference) {
    theme.value = t;
    updateSettings({ theme: t });
  }

  return { theme, setTheme, resolvedTheme };
}
