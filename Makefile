# TODO: Remove this file as now Turbo and pnpm are used
# -------------------------
# Project Config
# -------------------------

FRONTEND := apps/web

# Detect current context (root vs web)
ifeq ($(notdir $(CURDIR)),web)
	FRONTEND_DIR := ../$(FRONTEND)
else
	FRONTEND_DIR := $(FRONTEND)
endif

# Smart cd wrappers
CD_FE := cd $(FRONTEND_DIR) &&

# -------------------------
# Install / Setup
# -------------------------

web-install:
	$(CD_FE) pnpm install

fe-setup: web-install pc-install

setup: web-install

# -------------------------
# Testing & Checks
# -------------------------

web-lint:
	$(CD_FE) pnpm lint

web-format:
	$(CD_FE) pnpm format

web-fix:
	web-lint && web-format

web-dev:
	$(CD_FE) pnpm dev

web-host:
	$(CD_FE) pnpm dev -- --host

web-preview:
	$(CD_FE) pnpm preview
