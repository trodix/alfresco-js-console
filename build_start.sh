#!/bin/bash

npm run build

docker-compose build --no-cache
docker-compose up --force-recreate
docker-compose logs -f
