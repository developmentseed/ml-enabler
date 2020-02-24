FROM python:3.6.3-jessie

EXPOSE 5000

ENV HOME=/home/hot
WORKDIR $HOME

COPY ./ $HOME/ml-enabler
WORKDIR $HOME/ml-enabler

RUN \
    apt-get update \
    && apt-get install -y postgresql postgresql-contrib git curl

RUN curl 'https://nodejs.org/dist/v13.8.0/node-v13.8.0-linux-x64.tar.gz' | tar -xzv \
    && cp ./node-v13.8.0-linux-x64/bin/node /usr/bin/ \
    && ./node-v13.8.0-linux-x64/bin/npm install -g npm \
    && npm install -g yarn \
    && cd web \
    && yarn install \
    && yarn build

RUN \
  pip install gunicorn; \
  pip install -r requirements.txt

CMD echo "CREATE DATABASE ${POSTGRES_DB}" | psql postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_ENDPOINT}:${POSTGRES_PORT} || true \
    && echo "CREATE EXTENSION POSTGIS" | psql postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_ENDPOINT}:${POSTGRES_PORT}/${POSTGRES_DB} \
    && flask db migrate \
    && gunicorn --bind 0.0.0.0:5000 --timeout 120 'ml_enabler:create_app()'
