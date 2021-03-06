import os
import numpy as np
import requests
import boto3
import semver
import json

from requests.auth import HTTPBasicAuth
from requests_toolbelt.multipart.encoder import MultipartEncoder
from requests_toolbelt.utils import dump
from zipfile import ZipFile
from imagery import chiplist

from generate_datanpz import download_img_match_labels, make_datanpz
from generate_tfrecords import create_tfr

s3 = boto3.client('s3')

auth = os.getenv('MACHINE_AUTH')
stack = os.getenv('StackName')
model_id = os.getenv('MODEL_ID')
prediction_id = os.getenv('PREDICTION_ID')
bucket = os.getenv('ASSET_BUCKET')
api = os.getenv('API_URL')

assert(stack)
assert(auth)
assert(model_id)
assert(prediction_id)
assert(api)

def get_pred(model_id, prediction_id):
    r = requests.get(api + '/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id), auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()

    return r.json()

def get_imagery(model_id, imagery_id):
    r = requests.get(api + '/v1/model/' + str(model_id) + '/imagery/' + str(imagery_id), auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()

    return r.json()

def get_asset(bucket, key):
    print('ok - downloading: ' + bucket + '/' + key)
    parsed = key.split('/')
    obj = s3.download_file(
        Filename='/tmp/' + parsed[len(parsed) - 1],
        Bucket=bucket,
        Key=key
    )

    dirr =  parsed[len(parsed) - 1].replace('.zip', '')
    with ZipFile('/tmp/' + parsed[len(parsed) - 1], 'r') as zipObj:
       # Extract all the contents of zip file in different directory
          zipObj.extractall('/tmp/' + dirr)

    return '/tmp/' + dirr

def get_label_npz(model_id, prediction_id):
    payload = {'format':'npz', 'inferences':'all', 'threshold': 0.5}
    r = requests.get(api + '/v1/model/' + model_id + '/prediction/' + prediction_id + '/export', params=payload,
                    auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()
    with open('/tmp/labels.npz', 'wb') as f:
        f.write(r.content)
    return f

def update_link(pred, link_type, zip_path):
    payload = {'type': link_type}
    model_id = pred['modelId']
    prediction_id = pred['predictionsId']
    encoder = MultipartEncoder(fields={'file': ('filename', open(zip_path, 'rb'), 'application/zip')})
    print('ok - /v1/model/' + str(model_id) + '/prediction/' + str(prediction_id) + '/asset')

    r = requests.post(
        api + '/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id) + '/asset',
        params = payload,
        data = encoder,
        headers = {'Content-Type': encoder.content_type},
        auth=HTTPBasicAuth('machine', auth)
    )

    r.raise_for_status()

def get_versions(model_id):
    r = requests.get(api + '/v1/model/' + model_id + '/prediction/all', auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()
    preds = r.json()
    version_lst = []
    for pred_dict in preds:
        version_lst.append(pred_dict['version'])
    version_highest = str(max(map(semver.VersionInfo.parse, version_lst)))
    return version_highest

pred = get_pred(model_id, prediction_id)

if pred['imagery_id'] is None:
    raise Exception("Cannot retrain without imagery_id")

imagery = get_imagery(model_id, pred['imagery_id'])
chiplist(api, auth, imagery, pred)

zoom = pred['tileZoom']
supertile = pred['infSupertile']
version = pred['version']
inflist = pred['infList'].split(',')

v = get_versions(model_id)

get_label_npz(model_id, prediction_id)

# download image tiles that match validated labels.npz file
download_img_match_labels(
    labels_folder='/tmp',
    imagery=imagery,
    folder='/tmp/tiles',
    zoom=zoom,
    supertile=supertile
)

# create data.npz file that matchs up images and labels
make_datanpz(dest_folder='/tmp', imagery=imagery, supertile=supertile)


#convert data.npz into tf-records
create_tfr(npz_path='/tmp/data.npz')

update_link(pred, link_type='tfrecord', zip_path = '/tmp/tfrecords.zip')
print("ok - tfrecords link updated")
