"""
Lambda for downloading images, packaging them for prediction, sending them
to a remote ML serving image, and saving them
@author:Development Seed
"""
import json
import affine
import geojson
import requests
import rasterio
import boto3

from download_and_predict.chips import Chips
from requests.auth import HTTPBasicAuth
from io import BytesIO
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

    def __init__(self, prediction_endpoint: str):
        super(PTDownloadAndPredict, self).__init__()

        self.prediction_endpoint = prediction_endpoint
        self.meta = False

    def get_meta(self, inf_type: str):
        self.meta = PTModelMeta(inf_type)

    def get_prediction_payloads(self, t_i):
        """
        chps: list image tilesk
        imagery: str an imagery API endpoint with three variables {z}/{x}/{y} to replace
        Return:
        - an array of b64 encoded images to send to our prediction endpoint
        These arrays are returned together because they are parallel operations: we
        need to match up the tile indicies with their corresponding images
        """

        tile_indices, images = zip(*t_i)

        return images

    def classification(self, payload, chips):
        print("UNSUPPORTED")

    def segmentation(self, payload, chip):
        try:
            r = requests.post(self.prediction_endpoint + ":predict", data=payload)
            r.raise_for_status()

            lst = r.json()

            img = np.ndarray((len(lst), len(lst[0])), dtype=np.uint8)

            for x in range(len(lst)):
                for y in range(len(lst[x])):
                    img[x][y] = int(lst[x][y][0])


            img_bytes = BytesIO()
            Image.fromarray(img).resize((256, 256)).save(img_bytes, 'PNG')

            return {
                "type": "Image",
                "name": chip.get("name"),
                "bounds": chip.get("bounds"),
                "x": chip.get("x"),
                "y": chip.get("y"),
                "z": chip.get("z"),
                "submission_id": chip.get('submission'),
                "image": Chips.b64encode_image(img_bytes.getvalue())
            }

        except requests.exceptions.HTTPError as e:
            print (e.response.text)

    def detection(self, payload, chips):
        print("UNSUPPORTED")

