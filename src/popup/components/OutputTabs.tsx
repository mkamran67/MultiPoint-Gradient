import type { OutputFormat } from '@shared/types';

interface Props {
  active: OutputFormat;
  onChange: (format: OutputFormat) => void;
}

const FORMATS: { key: OutputFormat; label: string }[] = [
  { key: 'css', label: 'CSS' },
  { key: 'tailwind', label: 'Tailwind' },
  { key: 'svg', label: 'SVG' },
  { key: 'raw', label: 'Raw' },
];

export function OutputTabs({ active, onChange }: Props) {
  return (
    <div class="output-tabs">
      {FORMATS.map((f) => (
        <button
          key={f.key}
          class={`tab-btn ${active === f.key ? 'active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
