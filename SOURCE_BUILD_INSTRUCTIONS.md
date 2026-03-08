# Build Instructions

## Prerequisites

- Node.js 18 or later
- pnpm 10.x (`corepack enable && corepack prepare pnpm@10.30.3 --activate`)

## Install dependencies

```
pnpm install
```

## Build the Firefox extension

```
pnpm build:firefox
```

The output will be in the `dist-firefox/` directory.

## Build the Chrome extension

```
pnpm build:chrome
```

The output will be in the `dist/` directory.
