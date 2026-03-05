import type { GradientStop } from '@shared/types';
import { rgbaToHex, rgbaToHslString } from '@shared/color-utils';

interface Props {
  stops: GradientStop[];
  onReorder: (stops: GradientStop[]) => void;
}

export function ColorList({ stops, onReorder }: Props) {
  function handleRemove(index: number) {
    const next = stops.filter((_, i) => i !== index);
    // Redistribute positions
    const redistributed = next.map((s, i) => ({
      ...s,
      position: next.length === 1 ? 0 : i / (next.length - 1),
    }));
    onReorder(redistributed);
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...stops];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    // Recalculate positions based on new order
    const repositioned = next.map((s, i) => ({
      ...s,
      position: next.length === 1 ? 0 : i / (next.length - 1),
    }));
    onReorder(repositioned);
  }

  function handleMoveDown(index: number) {
    if (index === stops.length - 1) return;
    const next = [...stops];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    const repositioned = next.map((s, i) => ({
      ...s,
      position: next.length === 1 ? 0 : i / (next.length - 1),
    }));
    onReorder(repositioned);
  }

  return (
    <div class="color-list">
      <div class="color-list-header">
        <span>Colors ({stops.length})</span>
      </div>
      <ul class="color-items">
        {stops.map((stop, i) => (
          <li key={i} class="color-item">
            <span
              class="color-swatch"
              style={{ backgroundColor: rgbaToHex(stop.color) }}
            />
            <span class="color-hex">{rgbaToHex(stop.color)}</span>
            <span class="color-hsl">{rgbaToHslString(stop.color)}</span>
            <span class="color-pos">{Math.round(stop.position * 100)}%</span>
            <div class="color-actions">
              <button class="btn-icon" onClick={() => handleMoveUp(i)} disabled={i === 0} title="Move up">
                &#9650;
              </button>
              <button class="btn-icon" onClick={() => handleMoveDown(i)} disabled={i === stops.length - 1} title="Move down">
                &#9660;
              </button>
              <button class="btn-icon btn-remove" onClick={() => handleRemove(i)} title="Remove">
                &times;
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
