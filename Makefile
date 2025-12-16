.PHONY: setup up shell sync-extensions frontend-init docker-setup docker-up docker-shell

COMPOSE ?= docker compose -f docker-compose.yml
SERVICE ?= web

# Installs workspace dependencies inside the web container (npm + pnpm).
docker-setup:
	$(COMPOSE) run --rm $(SERVICE) npm install
	$(COMPOSE) run --rm $(SERVICE) npm run generate:interceptors
	$(COMPOSE) run --rm $(SERVICE) npm run build:i18n
	$(COMPOSE) run --rm $(SERVICE) npm run build:client
	$(COMPOSE) run --rm $(SERVICE) npm run build:server

# Builds and starts the web service via local compose file.
docker-up:
	$(COMPOSE) up --build

# Opens an interactive shell inside the running web container.
docker-shell:
	$(COMPOSE) exec $(SERVICE) bash
