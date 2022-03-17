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
from base64 import b64encode

from download_and_predict.custom_types import SQSEvent

firehose = boto3.client('firehose')

class Chips:
    @staticmethod
    def save(payload, stream):
        firehose.put_record_batch(
            DeliveryStreamName=stream,
            Records=[{
                "Data": json.dumps(p)
            } for p in payload]
        )

        return True


    @staticmethod
    def b64encode_image(image_binary: bytes) -> str:
        return b64encode(image_binary).decode('utf-8')

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
    def get_images(chips: List[dict]) -> Iterator[Tuple[dict, bytes]]:
        for chip in chips:
            print("IMAGE: " + chip.get('url'))
            r = requests.get(chip.get('url'))
            yield (chip, r.content)

    @staticmethod
    def get_supert_images(chips: List[dict]) -> Iterator[Tuple[dict, bytes]]:
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
