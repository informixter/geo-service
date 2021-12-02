BUILD_DATE := `date +%Y-%m-%d\ %H:%M`

run:
	docker-compose up -d

stop:
	docker-compose down

exec-api:
	docker-compose exec api bash


deploy:
	git add .
	git commit -m "Fast commit at : $(BUILD_DATE)"
	git push origin main
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop api && docker-compose up -d api'