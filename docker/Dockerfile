FROM nginx:latest

WORKDIR /var/www/html/app

COPY docker/templates/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/alfresco-js-console ./
EXPOSE 8090
