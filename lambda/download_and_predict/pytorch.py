"""
Lambda for downloading images, packaging them for prediction, sending them
to a remote ML serving image, and saving them
@author:Development Seed
"""
import json
import base64
import affine
import geojson
import requests
import rasterio
import shapely
import boto3

from shapely.geometry import box
from requests.auth import HTTPBasicAuth
from shapely import affinity, geometry
from enum import Enum
from functools import reduce
from io import BytesIO
from base64 import b64encode
from urllib.parse import urlparse
from typing import Dict, List, NamedTuple, Callable, Optional, Tuple, Any, Iterator
from rasterio.io import MemoryFile
from rasterio.windows import Window
from PIL import Image
import io

import mercantile
from mercantile import children
import numpy as np

from download_and_predict.custom_types import SQSEvent

firehose = boto3.client('firehose')

class PTModelMeta:
    def __init__(self, inf_type):
        self.inf_type = inf_type
        self.size = { 'x': 256, 'y': 256 }


class PTDownloadAndPredict(object):
    """
    base object DownloadAndPredict implementing all necessary methods to
    make machine learning predictions
    """

    def __init__(self, mlenabler_endpoint: str, prediction_endpoint: str):
        super(DownloadAndPredict, self).__init__()

        self.mlenabler_endpoint = mlenabler_endpoint
        self.prediction_endpoint = prediction_endpoint
        self.meta = False

    def get_meta(self, inf_type: str):
        self.meta = ModelMeta(inf_type)

    def cl_post_prediction(self, payload: Dict[str, Any], chips: List[dict], inferences: List[str]) -> Dict[str, Any]:
        print("UNSUPPORTED")

    def seg_post_prediction(self, payload: Dict[str, Any], chips: List[dict]) -> Dict[str, Any]:
        try:
            r = requests.post(self.prediction_endpoint + ":predict", data=json.dumps(payload))
            r.raise_for_status()

            res = [];
            preds = np.argmax(np.array(r.json()['predictions']), axis=-1).astype('uint8')

            for i in range(len(preds)):
                img_bytes = BytesIO()
                # TODO don't assume input image size starts at 256^2 - and that the desired end state is 256^2
                Image.fromarray(preds[i]).resize((256, 256)).save(img_bytes, 'PNG')

                res.append({
                    "type": "Image",
                    "name": chips[i].get("name"),
                    "bounds": chips[i].get("bounds"),
                    "x": chips[i].get("x"),
                    "y": chips[i].get("y"),
                    "z": chips[i].get("z"),
                    "submission_id": chips[i].get('submission'),
                    "image": self.b64encode_image(img_bytes.getvalue())
                })

            return res

        except requests.exceptions.HTTPError as e:
            print (e.response.text)

    def od_post_prediction(self, payload: str, chips: List[dict]) -> Dict[str, Any]:
        print("UNSUPPORTED")

