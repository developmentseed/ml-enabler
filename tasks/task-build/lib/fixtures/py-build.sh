torch-model-archiver \
    --model-name default \
    -v 1.0 \
    --serialized-file $(ls ./model-store/*.pt* | head -1)
    --model-file $(ls ./model-store/*.py | head -1)
    --handler $(grep "handler" model-store/MAR-INF/MANIFEST.json | sed 's/.*://' | sed 's/,//' | sed 's/"//g')

rm -rf ./model-store/*
mv default.mar ./model-store/

torchserve --start --ncs --model-store=/home/model-server/model-store/ --models=default.mar
