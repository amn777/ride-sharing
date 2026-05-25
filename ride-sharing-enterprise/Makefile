.PHONY: help up down build restart logs ps clean

help:
	@echo ""
	@echo "  make up              Start all services"
	@echo "  make down            Stop all services"
	@echo "  make build           Build all images"
	@echo "  make restart         Rebuild + restart"
	@echo "  make logs            Tail all logs"
	@echo "  make logs s=<svc>    Tail one service"
	@echo "  make ps              Show status"
	@echo "  make clean           Remove everything"
	@echo ""

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --parallel

restart: down build up

logs:
ifdef s
	docker compose logs -f $(s)
else
	docker compose logs -f
endif

ps:
	docker compose ps

clean:
	docker compose down -v --remove-orphans
	docker system prune -f
