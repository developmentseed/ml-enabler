FROM alpine:3.14

RUN apk add nodejs npm git make bash sqlite-dev zlib-dev gcc g++

# Download and install Tippecanoe
RUN git clone -b 1.36.0 https://github.com/mapbox/tippecanoe.git /tmp/tippecanoe && \
    cd /tmp/tippecanoe && \
    make && \
    PREFIX=/usr/local make install && \
    rm -rf /tmp/tippecanoe

WORKDIR /usr/local/src/task
ADD . /usr/local/src/task

RUN npm install

CMD node task.js
