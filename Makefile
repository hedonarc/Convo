# -------------------------
# Project Config
# -------------------------

BACKEND := backend
FRONTEND := apps/web
PYTHON := uv run
PRECOMMIT := uv run --project backend pre-commit

# Detect current context (root vs backend)
ifeq ($(notdir $(CURDIR)),backend)
	BACKEND_DIR := .
	FRONTEND_DIR := ../$(FRONTEND)
else
	BACKEND_DIR := $(BACKEND)
	FRONTEND_DIR := $(FRONTEND)
endif

# Smart cd wrappers
CD := cd $(BACKEND_DIR) &&
CD_FE := cd $(FRONTEND_DIR) &&

# -------------------------
# Install / Setup
# -------------------------

sync:
	$(CD) uv sync

sync-dev:
	$(CD) uv sync --all-extras

web-install:
	$(CD_FE) pnpm install

pc-install:
	$(PRECOMMIT) install --hook-type pre-commit
	$(PRECOMMIT) install --hook-type commit-msg

setup: sync web-install migs pc-install

# -------------------------
# Django Commands
# -------------------------

server:
	$(CD) $(PYTHON) manage.py runserver

redis:
	docker run -d --rm --name redis-dev -p 6379:6379 redis:7

dev:
	docker run -d --rm --name redis-dev -p 6379:6379 redis:7 & \
	$(CD) $(PYTHON) manage.py runserver

stop-redis:
	docker stop redis-dev

migrate:
	$(CD) $(PYTHON) manage.py migrate

makemigrations:
	$(CD) $(PYTHON) manage.py makemigrations

migs:
	$(CD) $(PYTHON) manage.py makemigrations && $(PYTHON) manage.py migrate

showmigrations:
	$(CD) $(PYTHON) manage.py showmigrations

shell:
	$(CD) $(PYTHON) manage.py shell

# -------------------------
# Ruff (Linting / Formatting)
# -------------------------

check:
	$(CD) uv run ruff check .

checki:
	$(CD) uv run ruff check --select I .

fix:
	$(CD) uv run ruff check --fix .

format:
	$(CD) uv run ruff format .

lint: check checki fix format

# -------------------------
# Pre-commit
# -------------------------

pc:
	$(PRECOMMIT) run --all-files

pc-eslint:
	$(PRECOMMIT) run eslint --all-files

pc-ruff:
	$(PRECOMMIT) run ruff --all-files

# -------------------------
# Testing & Checks
# -------------------------

check-settings:
	$(CD) $(PYTHON) manage.py check --settings=settings.local

test:
	$(CD) $(PYTHON) manage.py test --settings=settings.test

web-lint:
	$(CD_FE) pnpm lint

web-format:
	$(CD_FE) pnpm format

web-preview:
	$(CD_FE) pnpm preview
