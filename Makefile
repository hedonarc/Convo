# -------------------------
# Convo web — single-package layout.
# (Was a turbo+pnpm monorepo; collapsed to root after deciding to keep
# the mobile project in a separate repo.)
# -------------------------

install:
	pnpm install

setup: install

dev:
	pnpm dev

host:
	pnpm dev -- --host

build:
	pnpm build

preview:
	pnpm preview

lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

format:
	pnpm format

fix: lint-fix format
