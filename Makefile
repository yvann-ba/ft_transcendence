.PHONY: all down logs clean re

all:
	@docker-compose -f ./docker-compose.yml up --build -d > /dev/null 2>&1
	@echo "\033[1;32m✅ Services started successfully!\033[0m"
	@echo "\033[1;36m🌐 Access at: \033[1mhttps://localhost:8443\033[0m"

stop:
	@docker-compose -f ./docker-compose.yml stop > /dev/null 2>&1
	@echo "\033[1;33m⏹️  Services stopped\033[0m"

down:
	@docker-compose -f ./docker-compose.yml down > /dev/null 2>&1
	@echo "\033[1;31m🗑️  Containers removed\033[0m"

logs:
	@echo "\033[1;34m📋 Showing logs (Ctrl+C to exit):\033[0m"
	@docker-compose -f ./docker-compose.yml logs -f

clean:
	@docker-compose -f ./docker-compose.yml down -v > /dev/null 2>&1
	@docker system prune -f > /dev/null 2>&1
	@echo "\033[1;35m🧹 Cleanup complete\033[0m"

re: down all