import { useRef } from 'preact/hooks';

interface Props {
  angle: number;
  onChange: (angle: number) => void;
}

export function AnglePicker({ angle, onChange }: Props) {
  const dialRef = useRef<HTMLDivElement>(null);

  function handleDialClick(e: MouseEvent) {
    const dial = dialRef.current;
    if (!dial) return;
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // CSS angle: 0deg = up, clockwise
    let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (deg < 0) deg += 360;
    onChange(Math.round(deg));
  }

  function handleInput(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    if (!isNaN(val)) {
      onChange(((val % 360) + 360) % 360);
    }
  }

  return (
    <div class="angle-picker">
      <div class="angle-dial" ref={dialRef} onClick={handleDialClick}>
        <div
          class="angle-needle"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </div>
      <div class="angle-input-group">
        <input
          type="number"
          class="angle-input"
          value={angle}
          min={0}
          max={359}
          onInput={handleInput}
        />
        <span class="angle-unit">deg</span>
      </div>
    </div>
  );
}
