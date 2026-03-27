# MultiPoint Gradient

A browser extension for picking colors directly from webpages and generating gradient code in multiple formats. Sample individual points or draw a line to extract colors along a gradient path, then export as CSS, Tailwind, SVG, or raw JSON.

## Features

- **Multipoint Color Picking** — Click anywhere on a webpage to sample colors. Positions are automatically distributed evenly across the gradient.
- **Linear Sampling Mode** — Draw a line across a webpage to automatically sample colors along a gradient path (default 10 samples).
- **Multiple Output Formats** — Generate gradient code as CSS `linear-gradient()`, Tailwind `bg-[linear-gradient()]`, SVG `<linearGradient>`, or raw JSON.
- **Interactive Angle Picker** — Adjust gradient direction with a visual dial or numeric input.
- **Live Gradient Preview** — Canvas-based real-time preview of the generated gradient.
- **Color Management** — Reorder, remove, and inspect colors in hex and HSL formats.
- **Gradient History** — Save and restore up to 100 previously created gradients.
- **Theme Support** — System, light, and dark themes.
- **Cross-Browser** — Works on Chrome and Firefox.

## Technologies

- **Preact** + **Preact Signals** — Lightweight reactive UI
- **TypeScript** — Type-safe codebase
- **Vite** — Build tooling and dev server
- **Chrome Extension Manifest V3** — Service worker, content scripts, storage API
- **Canvas API** — Screenshot-based color sampling with high-DPI support
- **Shadow DOM** — Isolated visual overlay on webpages

## Project Structure

```
src/
├── background/       # Service worker for extension lifecycle & message routing
├── content/          # Content scripts (color sampler, overlay, picker logic)
├── popup/            # Extension popup UI (components, hooks, styles)
├── shared/           # Color utils, gradient formatter, storage, types
└── assets/           # Extension icons
```

## Getting Started

```bash
pnpm install
pnpm dev          # Development build with watch
pnpm build        # Production build (Chrome → dist/, Firefox → dist-firefox/)
```

Load the `dist/` directory as an unpacked extension in Chrome, or `dist-firefox/` in Firefox.

## Usage

1. Click the extension icon to open the popup.
2. Choose **Multipoint** or **Linear Sample** mode.
3. Click on the webpage to pick colors (or draw a line in linear mode).
4. Adjust the gradient angle and color order as needed.
5. Select an output format and copy the generated code.
