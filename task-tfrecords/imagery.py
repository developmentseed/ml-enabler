import requests, shapely, mercantile
from requests.auth import HTTPBasicAuth
from tiletanic import tilecover, tileschemes

def chiplist(api, auth, imagery, pred):

    if imagery['fmt'] == 'wms':
        tilejson = get_pred_tilejson(api, auth, pred['modelId'], pred['predictionsId'])

        tiler = tileschemes.WebMercator()

        poly = shapely.geometry.box(tilejson['bounds'][0], tilejson['bounds'][1], tilejson['bounds'][2], tilejson['bounds'][3])
        tiles = tilecover.cover_geometry(tiler, poly, pred['tileZoom'])

        for tile in tiles:
            bounds = mercantile.bounds(tile)
            print(bounds, tile)
    else:
        return get_list(imagery['url'])

def get_pred_tilejson(api, auth, model_id, prediction_id):
    r = requests.get(api + '/v1/model/' + str(model_id) + '/prediction/' + str(prediction_id) + '/tiles', auth=HTTPBasicAuth('machine', auth))
    r.raise_for_status()

    return r.json()

def get_list(imagery_url):
    r = requests.get(imagery_url)
    r.raise_for_status()

    print(r)

