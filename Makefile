# Makefile for FastAPI project with React frontend

# Variables
DOCKER_IMAGE_NAME = code-reviewer-app
CONTAINER_NAME = code-reviewer
PORT = 8110

# Targets
.PHONY: build run stop restart frontend-install frontend-build

build: frontend-build
	docker build -t $(DOCKER_IMAGE_NAME) .

run:
	docker run -d --env-file .env --name $(CONTAINER_NAME) -p $(PORT):8000 -p 3000:3000 $(DOCKER_IMAGE_NAME)

stop:
	docker stop -t 0 $(CONTAINER_NAME) || true
	docker rm -f $(CONTAINER_NAME) || true

restart: stop run

frontend-install:
	cd frontend && npm install

frontend-build: frontend-install
	cd frontend && npm run build

dev: frontend-build
	uvicorn main:app --reload --port $(PORT)
