import type { HistoryEntry, PickerState, UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { STORAGE_KEYS } from './constants';

export async function getHistory(): Promise<HistoryEntry[]> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.HISTORY);
  return (data[STORAGE_KEYS.HISTORY] as HistoryEntry[] | undefined) || [];
}

export async function addToHistory(entry: HistoryEntry): Promise<void> {
  const history = await getHistory();
  const settings = await getSettings();
  history.unshift(entry);
  if (history.length > settings.maxHistorySize) {
    history.length = settings.maxHistorySize;
  }
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: history });
}

export async function removeFromHistory(id: string): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter((e) => e.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: filtered });
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.HISTORY]: [] });
}

export async function getSettings(): Promise<UserSettings> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(data[STORAGE_KEYS.SETTINGS] || {}) };
}

export async function updateSettings(partial: Partial<UserSettings>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...partial },
  });
}

export async function getSessionState(): Promise<PickerState | null> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.CURRENT_SESSION);
  return (data[STORAGE_KEYS.CURRENT_SESSION] as PickerState | undefined) || null;
}

export async function saveSessionState(state: PickerState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_SESSION]: state });
}
