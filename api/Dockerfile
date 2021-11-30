FROM ubuntu:20.04

EXPOSE 2000

ENV HOME=/home/mle
WORKDIR $HOME
COPY ./ $HOME/api
WORKDIR $HOME/api

COPY ./cloudformation/prediction.template.json ./cloudformation/

RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y nginx curl

RUN export NODEV='16.9.0' \
    && curl "https://nodejs.org/dist/v${NODEV}/node-v${NODEV}-linux-x64.tar.gz" | tar -xzv \
    && cp ./node-v${NODEV}-linux-x64/bin/node /usr/bin/ \
    && ./node-v${NODEV}-linux-x64/bin/npm install -g npm@7

RUN npm install \
    && npm run doc \
    && cd web \
    && npm install -g yarn \
    && yarn install \
    && yarn prod

RUN cp ./nginx.conf /etc/nginx/sites-enabled/default

CMD service nginx restart \
    && ./node_modules/.bin/knex migrate:latest \
    && npm run dev

