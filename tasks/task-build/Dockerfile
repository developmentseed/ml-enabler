FROM docker:20.10.12-dind

ENV SHELL /bin/bash
ENV DEBIAN_FRONTEND=noninteractive
ENV DOCKER_DRIVER=overlay2
ENV DOCKER_TLS_CERTDIR=''

RUN apk add nodejs nodejs-npm
RUN apk -v --update add \
        python \
        py-pip \
        groff \
        less \
        mailcap \
        && \
    pip install --upgrade awscli==1.14.5 s3cmd==2.0.1 python-magic && \
    apk -v --purge del py-pip && \
    rm /var/cache/apk/*

WORKDIR /usr/local/src/batch
ADD . /usr/local/src/batch

RUN npm install
