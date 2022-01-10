FROM lambgeo/lambda-gdal:3.3-python3.8

ARG PACKAGE_PREFIX=/var/task
WORKDIR $PACKAGE_PREFIX

ADD requirements.txt requirements.txt
COPY download_and_predict ${PACKAGE_PREFIX}/download_and_predict

RUN pip install -r requirements.txt --no-binary :all: -t ${PACKAGE_PREFIX}/

# Reduce size of the C libs
RUN cd $PREFIX && find lib -name \*.so\* -exec strip {} \;

RUN cd ${PACKAGE_PREFIX} && find . -type f -name '*.pyc' | while read f; do n=$(echo $f | sed 's/__pycache__\///' | sed 's/.cpython-[2-3][0-9]//'); cp $f $n; done;
RUN cd ${PACKAGE_PREFIX} && find . -type d -a -name '__pycache__' -print0 | xargs -0 rm -rf
RUN cd ${PACKAGE_PREFIX} && find . -type f -a -name '*.py' -print0 | xargs -0 rm -f
RUN find ${PACKAGE_PREFIX} -type d -a -name 'tests' -print0 | xargs -0 rm -rf

RUN rm -rdf \
    ${PACKAGE_PREFIX}/numpy/doc/ \
    ${PACKAGE_PREFIX}/boto3* \
    ${PACKAGE_PREFIX}/botocore* \
    ${PACKAGE_PREFIX}/bin \
    ${PACKAGE_PREFIX}/geos_license \
    ${PACKAGE_PREFIX}/Misc

# Create package.zip
RUN cd $PACKAGE_PREFIX && zip -r9q /tmp/package.zip *
RUN cd $PREFIX && zip -r9q --symlinks /tmp/package.zip lib/*.so* share
