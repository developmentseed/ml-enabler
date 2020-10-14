import os
import glob
import numpy as np
import requests
import boto3
import semver
import json
import zipfile

import tensorflow as tf


from requests.auth import HTTPBasicAuth
from requests_toolbelt.multipart.encoder import MultipartEncoder
from requests_toolbelt.utils import dump
from zipfile import ZipFile

from model import train
from model_config import RetrainConfig

s3 = boto3.client('s3')

auth = os.getenv('MACHINE_AUTH')
stack = os.getenv('StackName')
model_id = os.getenv('MODEL_ID')
prediction_id = os.getenv('PREDICTION_ID')
bucket = os.getenv('ASSET_BUCKET')
api = os.getenv('API_URL')
imagery = os.getenv('TILE_ENDPOINT')
retrain_config = os.getenv('CONFIG_RETRAIN')

assert(stack)
assert(auth)
assert(model_id)
assert(prediction_id)
assert(api)
assert(imagery)
assert(retrain_config)

def get_pred(model_id, prediction_id):
    r = requests.get(api + '/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id), auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()

    pred = r.json()
    return pred

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

def increment_versions(version):
    v = semver.VersionInfo.parse(version)
    return v.bump_minor()

def get_versions(model_id):
    r = requests.get(api + '/v1/model/' + model_id + '/prediction/all', auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()
    preds = r.json()
    version_lst = []
    for pred_dict in preds:
        version_lst.append(pred_dict['version'])
    version_highest = str(max(map(semver.VersionInfo.parse, version_lst)))
    return version_highest

def post_pred(pred, version):
    data_pred = {
        'modelId': pred['modelId'],
        'version': version,
        'tileZoom': pred['tileZoom'],
        'infList': pred['infList'],
        'infType':  pred['infType'],
        'infBinary':  pred['infBinary'],
        'infSupertile': pred['infSupertile'],
        'imagery_id': pred['imagery_id']
    }

    r = requests.post(api + '/v1/model/' + model_id + '/prediction',  json=data_pred, auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()
    print(r.status_code)
    pred = r.json()
    return pred['prediction_id']

def update_link(pred, link_type, zip_path):
    payload = {'type': link_type}
    print(payload)
    model_id = pred['modelId']
    print(model_id)
    prediction_id = pred['predictionsId']
    print(prediction_id)
    encoder = MultipartEncoder(fields={'file': ('filename', open(zip_path, 'rb'), 'application/zip')})
    print('/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id) + '/upload')

    r = requests.post(api + '/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id) + '/upload', params=payload,
                        data = encoder, headers= {'Content-Type': encoder.content_type}, auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()

pred = get_pred(model_id, prediction_id)
if pred['modelLink'] is None:
    raise Exception("Cannot retrain without modelLink")
if pred['checkpointLink'] is None:
    raise Exception("Cannot retrain without checkpointLink")

zoom = pred['tileZoom']
version = pred['version']
supertile = pred['infSupertile']
inflist = pred['infList'].split(',')


v = get_versions(model_id)

model = get_asset(bucket, pred['modelLink'].replace(bucket + '/', ''))
checkpoint = get_asset(bucket, pred['checkpointLink'].replace(bucket + '/', ''))
tfrecord = get_asset(bucket, pred['tfrecordLink'].replace(bucket + '/', ''))

print(model)
print(checkpoint)
print(tfrecord)

def _parse_image_function(example_proto):
    image_feature_description = {
        'image': tf.io.FixedLenFeature([], tf.string),
        'label': tf.io.FixedLenFeature([], tf.string)
    }
    return tf.io.parse_single_example(example_proto, image_feature_description)


f_train = []
for name in glob.glob('/tmp/tfrecord/train*.tfrecords'):
    f_train.append(name)
n_train_samps = sum([tf.data.TFRecordDataset(f).reduce(np.int64(0), lambda x, _: x + 1).numpy() for f in f_train])
print(n_train_samps)


f_val = []
for name in glob.glob('/tmp/tfrecord/val*.tfrecords'):
    f_val.append(name)
n_val_samps = sum([tf.data.TFRecordDataset(f).reduce(np.int64(0), lambda x, _: x + 1).numpy() for f in f_val])
print(n_val_samps)

# conduct re-training,
sample_config = json.loads(retrain_config)
config = RetrainConfig(sample_config)
if supertile:
     config.x_feature_shape = [-1, 512, 512, 3]
else:
    config.x_feature_shape = [-1, 256, 256, 3]

config.n_classes=len(inflist)
config.class_names=inflist
config.n_train_samps=n_train_samps
config.n_val_samps=n_val_samps

#validate re-training config user uploaded
config.validate

# env variable dervied from json user uploads via UI
train(config)

# increment model version
updated_version = str(increment_versions(version=v))
print(updated_version)


# post new pred
newpred_id = post_pred(pred=pred, version=updated_version)
newpred = get_pred(model_id, newpred_id)

# update model link
update_link(newpred, link_type='model', zip_path ='/ml/models.zip')
print("models link updated")

# update checkpoint
update_link(newpred, link_type='checkpoint', zip_path = '/ml/checkpoint.zip')
print("checkpoint link updated")
