"""Example AWS Lambda function for chip-n-scale"""

import os
from typing import Dict, Any
from download_and_predict.tensorflow import TFDownloadAndPredict
from download_and_predict.pytorch import PTDownloadAndPredict
from download_and_predict.chips import Chips
from download_and_predict.custom_types import SQSEvent

def handler(event: SQSEvent, context: Dict[str, Any]) -> bool:
    # read all our environment variables to throw errors early
    prediction_endpoint = os.getenv('PREDICTION_ENDPOINT')
    stream = os.getenv('StackName')

    super_tile = os.getenv('INF_SUPERTILE')
    inf_type = os.getenv('INF_TYPE')
    model_type = os.getenv('MODEL_TYPE')

    assert(stream)
    assert(inf_type)
    assert(prediction_endpoint)
    assert(model_type)

    # instantiate our DownloadAndPredict class
    if model_type == "tensorflow":
        dap = TFDownloadAndPredict(
            prediction_endpoint=prediction_endpoint
        )
    elif model_type == "pytorch":
        dap = PTDownloadAndPredict(
            prediction_endpoint=prediction_endpoint
        )

    dap.get_meta(inf_type)


    # get tiles from our SQS event
    chips = Chips.get_chips(event)

    # tiles & images zipped
    if super_tile == 'True':
        t_i = Chips.get_super_images(chips)
    else:
        t_i = Chips.get_images(chips)

    if model_type == "tensorflow":
        payload = dap.get_prediction_payload(t_i)

        if inf_type == "detection":
            print("TYPE: Object Detection")

            # send prediction request
            preds = dap.od_post_prediction(payload, chips)
        elif inf_type == "classification":
            print("TYPE: Classification")

            inferences = os.getenv('INFERENCES')
            assert(inferences)
            inferences = inferences.split(',')

            # send prediction request
            preds = dap.cl_post_prediction(payload, chips, inferences)
        elif inf_type == "segmentation":
            print("TYPE: Segmentation")

            # send prediction request
            preds = dap.seg_post_prediction(payload, chips)
        else:
            print("Unknown Model")
    elif model_type == "pytorch":
        preds = []

        for payload in dap.get_prediction_payloads(t_i):
            if inf_type == "segmentation":
                print("TYPE: Segmentation")

                # send prediction request
                preds.append(dap.segmentation(payload, chips))

    print('Saving:', len(preds), ' predictions')
    Chips.save(preds, stream)

    return True

