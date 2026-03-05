import { signal } from '@preact/signals';
import type { GradientData, OutputFormat } from '@shared/types';
import { formatGradient } from '@shared/gradient-formatter';

interface Props {
  gradient: GradientData;
  format: OutputFormat;
}

const copied = signal(false);

export function OutputPanel({ gradient, format }: Props) {
  const output = formatGradient(gradient, format);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      copied.value = true;
      setTimeout(() => (copied.value = false), 1500);
    } catch {
      // Fallback for contexts where clipboard API isn't available
      const textarea = document.createElement('textarea');
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      copied.value = true;
      setTimeout(() => (copied.value = false), 1500);
    }
  }

  return (
    <div class="output-panel">
      <pre class="output-code"><code>{output}</code></pre>
      <button class="btn btn-copy" onClick={handleCopy}>
        {copied.value ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
