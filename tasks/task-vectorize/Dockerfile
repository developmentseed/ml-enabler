FROM alpine:3.15

RUN apk add nodejs npm git make bash sqlite-dev zlib-dev gcc g++ python3 py3-pip

RUN pip3 install --upgrade pip \
    && pip3 install --no-cache-dir awscli


# Download and install Tippecanoe
RUN git clone -b 1.36.0 https://github.com/mapbox/tippecanoe.git /tmp/tippecanoe && \
    cd /tmp/tippecanoe && \
    make && \
    PREFIX=/usr/local make install && \
    rm -rf /tmp/tippecanoe

WORKDIR /usr/local/src/task
ADD . /usr/local/src/task

RUN npm install

CMD ./task
