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
import shapely
import boto3

from download_and_predict.chips import Chips
from shapely.geometry import box
from requests.auth import HTTPBasicAuth
from shapely import affinity, geometry
from enum import Enum
from functools import reduce
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

class TFModelMeta:
    def __init__(self, meta, inf_type):
        self.raw = meta

        self.inputs = self.raw["metadata"]["signature_def"]["signature_def"]["serving_default"]["inputs"]
        self.outputs = self.raw["metadata"]["signature_def"]["signature_def"]["serving_default"]["outputs"]

        self.inf_type = inf_type

        # As far as I know there can be only a single named i/o key
        self.input_name = list(self.inputs.keys())[0]
        self.output_name = list(self.outputs.keys())[0]

        # We assume B64 encoded images are 256,256 as we have no other way of determining their inputs
        if self.inputs[self.input_name].get('dtype') == 'DT_FLOAT':
            dims = self.inputs[self.input_name]['tensor_shape']['dim']

            # For now pick the dimension that is duplicated twice as most models use square inputs
            dimlist = []
            for dim in dims:
                dimlist.append(int(dim.get('size')))

            cmn = max(set(dimlist), key=dimlist.count)

            self.size = { 'x': cmn, 'y': cmn }
        else:
            self.size = { 'x': 256, 'y': 256 }


class TFDownloadAndPredict(object):
    """
    base object DownloadAndPredict implementing all necessary methods to
    make machine learning predictions
    """

    def __init__(self, prediction_endpoint: str):
        super(TFDownloadAndPredict, self).__init__()

        self.prediction_endpoint = prediction_endpoint
        self.meta = False

    def get_meta(self, inf_type: str):
        r = requests.get(self.prediction_endpoint + "/metadata")
        r.raise_for_status()

        self.meta = TFModelMeta(r.json(), inf_type)

    def listencode_image(self, image: bytes):
        img = Image.open(io.BytesIO(image))

        # Resize input to be happy with model expectations
        # TODO don't assume input image size starts at 256^2
        if self.meta.size['x'] != 256 or self.meta.size['y'] != 256:
            img = img.resize((self.meta.size['x'], self.meta.size['y']))

        img = np.array(img, dtype=np.uint8)

        try:
            img = img.reshape((self.meta.size['x'], self.meta.size['y'], 3))
        except ValueError:
            img = img.reshape((self.meta.size['x'], self.meta.size['y'], 4))

        # TODO: Eventually check channel size from model metadata
        img = img[:, :, :3]

        # Custom
        img = img * (1/255)

        return img

    def get_prediction_payload(self, t_i) -> Tuple[List[dict], Dict[str, Any]]:
        """
        chps: list image tilesk
        imagery: str an imagery API endpoint with three variables {z}/{x}/{y} to replace
        Return:
        - an array of b64 encoded images to send to our prediction endpoint
        These arrays are returned together because they are parallel operations: we
        need to match up the tile indicies with their corresponding images
        """

        tile_indices, images = zip(*t_i)

        if self.meta.inf_type == "segmentation":
            # Hack submit as list for seg - b64 for others - eventually detemine & support both for any inf
            img_l = [];
            for img in images:
                img_l.append(self.listencode_image(img))

            instances = np.stack(img_l, axis=0).tolist()
        else:
            instances = [{
                self.meta.input_name: dict(b64=Chips.b64encode_image(img))
            } for img in images]

        payload = {
            "instances": instances
        }

        return payload

    def cl_post_prediction(self, payload: Dict[str, Any], chips: List[dict], inferences: List[str]) -> Dict[str, Any]:
        try:
            r = requests.post(self.prediction_endpoint + ":predict", data=json.dumps(payload))
            r.raise_for_status()

            preds = r.json()["predictions"]
            pred_list = [];

            for i in range(len(chips)):
                pred_dict = {}

                for j in range(len(preds[i])):
                    pred_dict[inferences[j]] = preds[i][j]

                print('BOUNDS', chips[i].get('bounds'))
                body = {
                    "type": "Feature",
                    "submission_id": chips[i].get('submission'),
                    "geometry": shapely.geometry.mapping(box(*chips[i].get('bounds'))),
                    "properties": pred_dict,
                }

                if chips[i].get('x') is not None and chips[i].get('y') is not None and chips[i].get('z') is not None:
                    body['quadkey'] = mercantile.quadkey(chips[i].get('x'), chips[i].get('y'), chips[i].get('z'))

                pred_list.append(body)

            return pred_list
        except requests.exceptions.HTTPError as e:
            print (e.response.text)

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
                    "image": Chips.b64encode_image(img_bytes.getvalue())
                })

            return res

        except requests.exceptions.HTTPError as e:
            print (e.response.text)

    def od_post_prediction(self, payload: str, chips: List[dict]) -> Dict[str, Any]:
        pred_list = [];

        for i in range(len(chips)):
            r = requests.post(self.prediction_endpoint + ":predict", data=json.dumps({
                "instances": [ payload["instances"][i] ]
            }))

            r.raise_for_status()

            # We only post a single chip for od detection
            preds = r.json()["predictions"][0]

            if preds["num_detections"] == 0.0:
                continue

            # Create lists of num_detections length
            scores = preds['detection_scores'][:int(preds["num_detections"])]
            bboxes = preds['detection_boxes'][:int(preds["num_detections"])]

            bboxes_256 = []
            for bbox in bboxes:
                bboxes_256.append([c * 256 for c in bbox])

            for j in range(len(bboxes_256)):
                bbox = geojson.Feature(
                    geometry=self.tf_bbox_geo(bboxes_256[j], chips[i].get('bounds')),
                    properties={}
                ).geometry

                score = preds["detection_scores"][j]

                body = {
                    "type": "Feature",
                    "submission_id": chips[i].get('submission'),
                    "properties": {
                        "default": score
                    },
                    "geometry": bbox,
                }

                if chips[i].get('x') is not None and chips[i].get('y') is not None and chips[i].get('z') is not None:
                    body['quadkey'] = mercantile.quadkey(chips[i].get('x'), chips[i].get('y'), chips[i].get('z'))

                pred_list.append(body)

        return pred_list

    def tf_bbox_geo(self, bbox, chip_bounds):
        pred = [bbox[1], bbox[0], bbox[3], bbox[2]]
        # Affine Transform
        width = chip_bounds[2] - chip_bounds[0]
        height = chip_bounds[3] - chip_bounds[1]
        a = affine.Affine(width / 256, 0.0, chip_bounds[0], 0.0, (0 - height / 256), chip_bounds[3])
        a_lst = [a.a, a.b, a.d, a.e, a.xoff, a.yoff]
        geographic_bbox = affinity.affine_transform(geometry.box(*pred), a_lst)

        return geographic_bbox
