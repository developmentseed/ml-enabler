FROM lambgeo/lambda:gdal3.1-py3.7

ENV PYTHONUSERBASE=/var/task

################################################################################
#                            CREATE PACKAGE                                    #
################################################################################
COPY download_and_predict $PYTHONUSERBASE/download_and_predict
COPY requirements.txt $PYTHONUSERBASE/requirements.txt

RUN pip install -r requirements.txt --no-binary numpy,rasterio,gdal -t ${PACKAGE_PREFIX}/

RUN mv ${PYTHONUSERBASE}/lib/python3.7/site-packages/* ${PYTHONUSERBASE}/ \
    && rm -rf ${PYTHONUSERBASE}/lib \
    && cp $PYTHONUSERBASE && zip -r9q /tmp/package.zip *
