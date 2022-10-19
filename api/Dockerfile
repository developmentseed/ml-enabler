FROM ubuntu:22.04

EXPOSE 2000

ENV HOME=/home/mle
WORKDIR $HOME
COPY ./ $HOME/api
WORKDIR $HOME/api

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y nginx curl git

RUN export NODEV='18.7.0' \
    && curl "https://nodejs.org/dist/v${NODEV}/node-v${NODEV}-linux-x64.tar.gz" | tar -xzv \
    && cp ./node-v${NODEV}-linux-x64/bin/node /usr/bin/ \
    && ./node-v${NODEV}-linux-x64/bin/npm install -g npm@7

RUN npm install \
    && npm run doc \
    && cd web \
    && npm install \
    && npm run prod

RUN cp ./nginx.conf /etc/nginx/sites-enabled/default

CMD service nginx restart \
    && ./node_modules/.bin/knex migrate:latest \
    && npm start

