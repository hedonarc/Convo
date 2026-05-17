# Frontend Architecture

The web application is a modern React application built with performance and developer experience in mind.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Key Features

### React Compiler
The [React Compiler](https://react.dev/learn/react-compiler) is enabled to automatically optimize re-renders. This is configured via the `@vitejs/plugin-react` and `babel-plugin-react-compiler`.

### CSS Engine
We use [Lightning CSS](https://lightningcss.dev/) via Vite for fast CSS processing and minification.

## Code Quality

### ESLint Configuration
We use a modern flat configuration (`eslint.config.js`). For production-grade applications, we recommend type-aware lint rules.

To enable type-aware rules, update `eslint.config.js`:

We also utilize `eslint-plugin-react-x` and `eslint-plugin-react-dom` for React-specific best practices.

## Directory Structure

- `src/`: Main source code.
  - `assets/`: Static assets like images and SVGs.
  - `App.tsx`: Root component.
  - `main.tsx`: Entry point.
  - `index.css`: Global styles including Tailwind imports.
- `public/`: Static files served directly.
