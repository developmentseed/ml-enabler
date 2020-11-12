FROM lambgeo/lambda:gdal3.1-py3.7

ENV PYTHONUSERBASE=/var/task

COPY download_and_predict $PYTHONUSERBASE/download_and_predict
COPY requirements.txt $PYTHONUSERBASE/requirements.txt

RUN pip install -r requirements.txt --no-binary numpy,rasterio,gdal==3.1.0 --user

RUN mv ${PYTHONUSERBASE}/lib/python3.7/site-packages/* ${PYTHONUSERBASE}/ \
    && rm -rf ${PYTHONUSERBASE}/lib \
    && cd $PYTHONUSERBASE && zip -r9q /tmp/package.zip *
