#!/bin/bash

npm run build

docker-compose up --force-recreate
docker-compose logs -f
