"""Example AWS Lambda function for chip-n-scale"""

import os
from typing import Dict, Any
from download_and_predict.base import DownloadAndPredict, SuperTileDownloader
from download_and_predict.custom_types import SQSEvent

def handler(event: SQSEvent, context: Dict[str, Any]) -> bool:
    # read all our environment variables to throw errors early
    prediction_endpoint = os.getenv('PREDICTION_ENDPOINT')
    mlenabler_endpoint = os.getenv('MLENABLER_ENDPOINT')
    stream = os.getenv('StackName')

    super_tile = os.getenv('INF_SUPERTILE')
    model_type = os.getenv('MODEL_TYPE')

    assert(stream)
    assert(model_type)
    assert(prediction_endpoint)
    assert(mlenabler_endpoint)

    # instantiate our DownloadAndPredict class
    dap = DownloadAndPredict(
        mlenabler_endpoint=mlenabler_endpoint,
        prediction_endpoint=prediction_endpoint
    )

    # get tiles from our SQS event
    chips = dap.get_chips(event)

    # Get meta about model to determine model type (Classification vs Object Detection)
    model_type = dap.get_meta()

    # construct a payload for our prediction endpoint

    if super_tile == 'True':
        dap = SuperTileDownloader(mlenabler_endpoint=mlenabler_endpoint, prediction_endpoint=prediction_endpoint)
        payload = dap.get_prediction_payload(chips)
    else:
        payload = dap.get_prediction_payload(chips)

    if model_type == ModelType.OBJECT_DETECT:
        print("TYPE: Object Detection")

        # send prediction request
        preds = dap.od_post_prediction(payload, chips)

        if len(preds["predictions"]) == 0:
            print('RESULT: No Predictions')
        else:
            print('RESULT: ' + str(len(preds["predictions"])) + ' Predictions')

            # Save the prediction to ML-Enabler
            dap.save_prediction(preds, stream)
    elif model_type == ModelType.CLASSIFICATION:
        print("TYPE: Classification")

        inferences = os.getenv('INFERENCES')
        assert(inferences)
        inferences = inferences.split(',')

        # send prediction request
        preds = dap.cl_post_prediction(payload, chips, inferences)

        # Save the prediction to ML-Enabler
        dap.save_prediction(preds, stream)
    else:
        print("Unknown Model")

    return True

