import requests, shapely, mercantile, pyproj, csv
from requests.auth import HTTPBasicAuth
from tiletanic import tilecover, tileschemes
from functools import partial
from shapely.ops import transform
from io import StringIO

def chiplist(api, auth, imagery, pred):

    if imagery['fmt'] != 'wms':
        imagery['imglist'] = {}

        f = StringIO(get_list(imagery['url']))
        for row in csv.reader(f, delimiter=','):
            imagery['imglist']['test'] = {
                'url': row[0],
                'bounds': row[1]
            }

def get_pred_tilejson(api, auth, model_id, prediction_id):
    r = requests.get(api + '/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id) + '/tiles', auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()

    return r.json()

def get_list(imagery_url):
    r = requests.get(imagery_url)
    r.raise_for_status()

    return r.text

