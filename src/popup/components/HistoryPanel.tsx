import { signal } from '@preact/signals';
import { useEffect } from 'preact/hooks';
import type { GradientData, HistoryEntry } from '@shared/types';
import { getHistory, removeFromHistory, clearHistory, addToHistory } from '@shared/storage';
import { rgbaToHex } from '@shared/color-utils';

interface Props {
  onLoad: (gradient: GradientData) => void;
}

const entries = signal<HistoryEntry[]>([]);

export function HistoryPanel({ onLoad }: Props) {
  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    entries.value = await getHistory();
  }

  async function handleDelete(id: string) {
    await removeFromHistory(id);
    await loadHistory();
  }

  async function handleClear() {
    await clearHistory();
    entries.value = [];
  }

  function gradientCSS(entry: HistoryEntry): string {
    const stops = entry.gradient.stops
      .map((s) => `${rgbaToHex(s.color)} ${Math.round(s.position * 100)}%`)
      .join(', ');
    return `linear-gradient(${entry.gradient.angle}deg, ${stops})`;
  }

  return (
    <div class="history-panel">
      <div class="history-header">
        <h2>History</h2>
        {entries.value.length > 0 && (
          <button class="btn btn-small btn-danger" onClick={handleClear}>
            Clear All
          </button>
        )}
      </div>
      {entries.value.length === 0 ? (
        <p class="empty-state">No saved gradients yet.</p>
      ) : (
        <ul class="history-list">
          {entries.value.map((entry) => (
            <li key={entry.id} class="history-item">
              <div
                class="history-preview"
                style={{ background: gradientCSS(entry) }}
                onClick={() => onLoad(entry.gradient)}
              />
              <div class="history-meta">
                <span class="history-colors">{entry.gradient.stops.length} colors</span>
                <span class="history-date">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
              <button
                class="btn-icon btn-remove"
                onClick={() => handleDelete(entry.id)}
                title="Delete"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Export save helper for use from App
export async function saveCurrentGradient(gradient: GradientData, sourceUrl: string) {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    gradient,
    timestamp: Date.now(),
    sourceUrl,
  };
  await addToHistory(entry);
}
