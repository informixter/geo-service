CURR_DATE := `date +%Y-%m-%d\ %H:%M`

init: get_maps
	docker-compose build
	docker-compose up -d api postgres
	docker-compose exec api bash -c "php artisan migrate --seed && php artisan map:reseter"
	docker-compose down

run:
	docker-compose up -d

stop:
	docker-compose down

git-commit:
	git add .
	git commit -m "Fast commit at : $(CURR_DATE)"
	git push origin main

deploy-calc: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop calc && docker-compose build calc && docker-compose up -d calc'

deploy-jupyter: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop jupyter && docker-compose build jupyter && docker-compose up -d jupyter'

deploy-front: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop front && docker-compose build front && docker-compose up -d front'

exec-api:
	docker-compose exec api bash

deploy-api: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop api && docker-compose build api && docker-compose up -d api'

get_maps:
	wget https://download.geofabrik.de/russia/volga-fed-district-latest.osm.pbf -O ./maps/volga-fed-district-latest.osm.pbf
