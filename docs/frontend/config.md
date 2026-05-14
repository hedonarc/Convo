# Frontend Flavor Configuration

This app uses Vite environment files to define per-flavor frontend configuration.
Each flavor has its own `.env.<mode>` file under `apps/web`, and those values are exposed to the app at build/runtime via `import.meta.env`.

## Flavor environment files

The following flavor files are available in `apps/web`:

- `.env.dev`
- `.env.qa`
- `.env.prod`
- `.env.client1`
- `.env.client2`
- `.env.client3`
- `.env.example` (template)

Each file contains Vite-prefixed values such as:

- `VITE_NAME`
- `VITE_FLAVOR`
- `VITE_FONT`
- `VITE_THEME`
- `VITE_API_URL`

These values are loaded automatically by Vite when running with the matching mode.

## How the app uses flavor config

In `apps/web/src/config/index.ts`, the app reads environment values from `import.meta.env`:

- `VITE_NAME` becomes `config.name`
- `VITE_API_URL` becomes `config.apiBaseUrl`
- `VITE_FONT` becomes `config.font`
- `VITE_THEME` becomes `config.theme`

`apps/web/src/main.tsx` then applies the configured font and theme colors globally, so each flavor can render with its own visual style and API endpoint.

## Running a flavor locally

Use the package scripts in `apps/web/package.json`:

- `pnpm dev` → uses `.env.dev`
- `pnpm qa` → uses `.env.qa`
- `pnpm prod` → uses `.env.prod`
- `pnpm c1` → uses `.env.client1`
- `pnpm c2` → uses `.env.client2`
- `pnpm c3` → uses `.env.client3`

For production builds:

- `pnpm build:dev`
- `pnpm build:qa`
- `pnpm build:prod`
- `pnpm build:client1`
- `pnpm build:client2`
- `pnpm build:client3`

## Adding a new flavor

1. Create a new `.env.<flavor>` file in `apps/web`.
2. Add the flavor values using the same keys as the .env.example file.
3. Add a matching `vite --mode <flavor>` script to `apps/web/package.json`.
4. Use the new script to run or build that flavor.

Example env entries:

```env
VITE_NAME=Whatsapp
VITE_FLAVOR=whatsapp
VITE_FONT=Roboto
VITE_THEME=green
VITE_API_URL=https://api.example.com
```

## Notes

- `.env.dev` and `.env.prod` are listed in `apps/web/.gitignore`, so they are intended to be local or environment-specific files.
- `.env.example` is a good starting point for new flavors.
- The `VITE_FLAVOR` variable is available for flavor-specific logic if needed, but the core app already consumes `VITE_NAME`, `VITE_API_URL`, `VITE_FONT`, and `VITE_THEME`.
