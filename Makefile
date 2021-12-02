run:
	docker-compose up -d

stop:
	docker-compose down

exec-api:
	docker-compose exec api bash