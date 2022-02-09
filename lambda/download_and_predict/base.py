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

class ModelMeta:
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


class DownloadAndPredict(object):
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
        r = requests.get(self.prediction_endpoint + "/metadata")
        r.raise_for_status()

        self.meta = ModelMeta(r.json(), inf_type)

    @staticmethod
    def get_chips(event: SQSEvent) -> List[str]:
        """
        Return the body of our incoming SQS messages as an array of dicts
        Expects events of the following format:

        { 'Records': [ { "body": '{ "url": "", "bounds": "" }' }] }

        """
        chips = []
        for record in event['Records']:
            chips.append(json.loads(record['body']))

        return chips

    @staticmethod
    def b64encode_image(image_binary:bytes) -> str:
        return b64encode(image_binary).decode('utf-8')

    @staticmethod
    def listencode_image(image):
        img = Image.open(io.BytesIO(image))

        # Resize input to be happy with model expectations
        # TODO don't assume input image size starts at 256^2
        if self.size['x'] != 256 or self.size['y'] != 256:
            img.resize((self.size['x'], self.size['y']))

        img = np.array(img, dtype=np.uint8)

        try:
            img = img.reshape((self.size['x'], self.size['y'], 3))
        except ValueError:
            img = img.reshape((self.size['x'], self.size['y'], 4))

        # TODO: Eventually check channel size from model metadata
        img = img[:, :, :3]

        # Custom
        img = img * (1/255)

        return img

    def get_images(self, chips: List[dict]) -> Iterator[Tuple[dict, bytes]]:
        for chip in chips:
            print("IMAGE: " + chip.get('url'))
            r = requests.get(chip.get('url'))
            yield (chip, r.content)

    def get_prediction_payload(self, chips: List[dict]) -> Tuple[List[dict], Dict[str, Any]]:
        """
        chps: list image tilesk
        imagery: str an imagery API endpoint with three variables {z}/{x}/{y} to replace
        Return:
        - an array of b64 encoded images to send to our prediction endpoint
        These arrays are returned together because they are parallel operations: we
        need to match up the tile indicies with their corresponding images
        """

        tiles_and_images = self.get_images(chips)
        tile_indices, images = zip(*tiles_and_images)

        if self.meta.inf_type == "segmentation":
            # Hack submit as list for seg - b64 for others - eventually detemine & support both for any inf
            img_l = [];
            for img in images:
                img_l.append(self.listencode_image(img))

            instances = np.stack(img_l, axis=0).tolist()
        else:
            instances = [{
                self.meta.input_name: dict(b64=self.b64encode_image(img))
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
                    "image": self.b64encode_image(img_bytes.getvalue())
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

    def save_prediction(self, payload, stream):
        firehose.put_record_batch(
            DeliveryStreamName=stream,
            Records=[{
                "Data": json.dumps(p)
            } for p in payload]
        )

        return True

    def tf_bbox_geo(self, bbox, chip_bounds):
        pred = [bbox[1], bbox[0], bbox[3], bbox[2]]
        # Affine Transform
        width = chip_bounds[2] - chip_bounds[0]
        height = chip_bounds[3] - chip_bounds[1]
        a = affine.Affine(width / 256, 0.0, chip_bounds[0], 0.0, (0 - height / 256), chip_bounds[3])
        a_lst = [a.a, a.b, a.d, a.e, a.xoff, a.yoff]
        geographic_bbox = affinity.affine_transform(geometry.box(*pred), a_lst)

        return geographic_bbox

class SuperTileDownloader(DownloadAndPredict):
    def __init__(self, mlenabler_endpoint: str, prediction_endpoint: str):
    # type annotatation error ignored, re: https://github.com/python/mypy/issues/5887
        super(DownloadAndPredict, self).__init__()
        self.mlenabler_endpoint = mlenabler_endpoint
        self.prediction_endpoint = prediction_endpoint

    def get_images(self, chips: List[dict]) -> Iterator[Tuple[dict, bytes]]:
        """return bounds of original tile filled with the 4 child chips 1 zoom level up in bytes"""
        for chip in chips:
            w_lst = []
            for i in range(2):
                for j in range(2):
                    window = Window(i * 256, j * 256, 256, 256)
                    w_lst.append(window)

            child_tiles = children(chip.get('x'), chip.get('y'), chip.get('z')) #get this from database (tile_zoom)
            child_tiles.sort()

            with MemoryFile() as memfile:
                with memfile.open(driver='jpeg', height=512, width=512, count=3, dtype=rasterio.uint8) as dataset:
                    for num, t in enumerate(child_tiles):
                        url = chip.get('url').replace(str(chip.get('x')), str(t.x), 1).replace(str(chip.get('y')), str(t.y), 1).replace(str(chip.get('z')), str(t.z), 1)

                        r = requests.get(url)
                        img = np.array(Image.open(io.BytesIO(r.content)), dtype=np.uint8)
                        try:
                            img = img.reshape((256, 256, 3)) # 4 channels returned from some endpoints, but not all
                        except ValueError:
                            img = img.reshape((256, 256, 4))
                        img = img[:, :, :3]
                        img = np.rollaxis(img, 2, 0)
                        dataset.write(img, window=w_lst[num])
                dataset_b = memfile.read() #but this fails
                yield(
                    chip,
                    dataset_b)

