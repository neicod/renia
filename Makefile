.PHONY: setup up shell sync-extensions frontend-init docker-setup docker-up docker-shell packages-build packages-use packages-local docker-packages-build docker-packages-use docker-packages-local

COMPOSE ?= docker compose -f docker-compose.yml
SERVICE ?= web
DOCKER_RUN ?= $(COMPOSE) run --rm -e NPM_CONFIG_CACHE=/tmp/npm-cache $(SERVICE)

# Installs workspace dependencies inside the web container (npm + pnpm).
docker-setup:
	$(DOCKER_RUN) npm install
	$(DOCKER_RUN) npm run generate:interceptors
	$(DOCKER_RUN) npm run build:i18n
	$(DOCKER_RUN) npm run build:client
	$(DOCKER_RUN) npm run build:server

# Builds and starts the web service via local compose file.
docker-up:
	$(COMPOSE) up --build

# Opens an interactive shell inside the running web container.
docker-shell:
	$(COMPOSE) exec $(SERVICE) bash

# Builds npm tarballs for local Renia modules into ./packages.
packages-build:
	npm run build:packages

# Builds npm tarballs inside the web container into ./packages.
docker-packages-build:
	$(DOCKER_RUN) npm run build:packages

# Switches root package.json to use ./packages/*.tgz tarballs.
packages-use:
	node scripts/switch-package-sources.mjs pack

# Switches root package.json to use ./packages/*.tgz tarballs inside container.
docker-packages-use:
	$(DOCKER_RUN) node scripts/switch-package-sources.mjs pack

# Switches root package.json back to file:app/modules/renia/*.
packages-local:
	node scripts/switch-package-sources.mjs local

# Switches root package.json back to file:app/modules/renia/* inside container.
docker-packages-local:
	$(DOCKER_RUN) node scripts/switch-package-sources.mjs local
