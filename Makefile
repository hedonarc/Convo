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

setup: sync migs


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
# Testing & Checks
# -------------------------

check-settings:
	$(CD) $(PYTHON) manage.py check --settings=settings.local

test:
	$(CD) $(PYTHON) manage.py test --settings=settings.test
