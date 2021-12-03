CURR_DATE := `date +%Y-%m-%d\ %H:%M`

run:
	docker-compose up -d

stop:
	docker-compose down

git-commit:
	git add .
	git commit -m "Fast commit at : $(CURR_DATE)"
	git push origin main

deploy-jupyter: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop jupyter && docker-compose build jupyter && docker-compose up -d jupyter'

deploy-front: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop front && docker-compose build front && docker-compose up -d front'

exec-api:
	docker-compose exec api bash

deploy-api: git-commit
	ssh -t root@159.69.178.233 'cd router && git pull origin main && docker-compose stop api && docker-compose up -d api'

get_maps:
	wget https://download.geofabrik.de/russia/volga-fed-district-latest.osm.pbf -O ./maps/volga-fed-district-latest.osm.pbf