# Frontend Setup

The Convo web application is built with React 19 and Vite, using `pnpm` for dependency management.

## Prerequisites

- **Node.js**: Version 24.15.0 or higher (see `.nvmrc` in the root)
- **pnpm**: Version 11.1.1 or higher

## Installation

Run from the `apps/web/` directory or use `turbo` from the root.

To install dependencies locally in `apps/web/`:
```bash
pnpm install
```

## Development

To start the development server with Hot Module Replacement (HMR):
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`.

## Build

To build the application for production:
```bash
pnpm build
```

The output will be in the `dist/` directory.

## Linting

To run ESLint:
```bash
pnpm lint
```
