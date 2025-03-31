.PHONY: all down logs clean re dev

all:
	@echo "Starting ft_transcendence"
	docker-compose -f ./docker-compose.yml up --build
	@echo "Services started successfully. Access the application at https://localhost:8443"

stop:
	@echo "Stopping services..."
	docker-compose -f ./docker-compose.yml stop

down:
	@echo "Removing containers..."
	docker-compose -f ./docker-compose.yml down

clean:
	@echo "Cleaning up Docker resources..."
	docker-compose -f ./docker-compose.yml down -v
	docker system prune -f

re: down all