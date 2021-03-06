CURR_DATE := `date +%Y-%m-%d\ %H:%M`

init: get_maps
	docker-compose build
	docker-compose up -d api postgres
	echo "Sleep 30 sec for postgres run" && sleep 30
	docker-compose exec api bash -c "php artisan migrate --seed && php artisan map:reseter"
	docker-compose down
	chmod +x wait.sh

run:
	docker-compose up -d
	bash ./wait.sh

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
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop front && docker-compose build  --build-arg REACT_APP_GEO_PATH=http://159.69.178.233:8080 front && docker-compose up -d front'

exec-api:
	docker-compose exec api bash

deploy-api: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop api && docker-compose build api && docker-compose up -d api'

get_maps:
	mkdir -p maps
	wget https://59830.selcdn.ru/cdn/volga-fed-district-latest.osm.pbf -O ./maps/volga-fed-district-latest.osm.pbf
	#wget https://download.geofabrik.de/russia/volga-fed-district-latest.osm.pbf -O ./maps/volga-fed-district-latest.osm.pbf
