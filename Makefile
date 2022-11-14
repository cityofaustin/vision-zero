# 🍄 https://makefiletutorial.com/

rebuild:
	docker-compose build --no-cache

db-up:
	docker-compose up -d postgis

graphql-engine-up:
	docker-compose up -d graphql-engine

db-tools-up: db-up
  docker-compose up -d db-tools

tools-shell: db-tools-up
  docker exec -it db-tools /bin/bash