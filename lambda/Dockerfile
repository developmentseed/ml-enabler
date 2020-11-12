FROM lambgeo/lambda:gdal3.1-py3.7

ENV PACKAGE_PREFIX=/var/task

################################################################################
#                            CREATE PACKAGE                                    #
################################################################################
COPY download_and_predict download_and_predict
COPY setup.py setup.py

RUN pip install numpy rasterio mercantile --no-binary :all: -t ${PACKAGE_PREFIX}/ \
    && pip install . -t $PACKAGE_PREFIX -U

RUN cd $PACKAGE_PREFIX && zip -r9q /tmp/package.zip *
