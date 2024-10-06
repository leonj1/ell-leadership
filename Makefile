# Makefile for FastAPI project

# Variables
DOCKER_IMAGE_NAME = code-reviewer-app
CONTAINER_NAME = code-reviewer
PORT = 8110

# Targets
.PHONY: build run stop restart

build:
	docker build -t $(DOCKER_IMAGE_NAME) .

run:
	docker run --rm --env-file .env --name $(CONTAINER_NAME) -p $(PORT):8000 $(DOCKER_IMAGE_NAME)

stop:
	docker stop -t 0 $(CONTAINER_NAME) || true
	docker rm -f $(CONTAINER_NAME) || true

restart: stop run
