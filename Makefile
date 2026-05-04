# -------------------------
# Project Config
# -------------------------

BACKEND := backend
PYTHON := uv run

# Detect current context (root vs backend)
ifeq ($(notdir $(CURDIR)),backend)
	BACKEND_DIR := .
else
	BACKEND_DIR := backend
endif

# Smart cd wrapper (handles both cases cleanly)
CD := cd $(BACKEND_DIR) &&

# -------------------------
# Install / Setup
# -------------------------

sync:
	$(CD) uv sync

sync-dev:
	$(CD) uv sync --all-extras

setup: sync migrate

# -------------------------
# Django Commands
# -------------------------

server:
	$(CD) $(PYTHON) manage.py runserver

migrate:
	$(CD) $(PYTHON) manage.py migrate

makemigrations:
	$(CD) $(PYTHON) manage.py makemigrations

migs:
	$(CD) $(PYTHON) manage.py makemigrations && $(CD) $(PYTHON) manage.py migrate

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
