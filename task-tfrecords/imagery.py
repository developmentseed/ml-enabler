import requests, shapely, mercantile, pyproj
from requests.auth import HTTPBasicAuth
from tiletanic import tilecover, tileschemes
from functools import partial
from shapely.ops import transform

def chiplist(api, auth, imagery, pred):

    if imagery['fmt'] == 'wms':
        tilejson = get_pred_tilejson(api, auth, pred['modelId'], pred['predictionsId'])

        poly = shapely.geometry.box(tilejson['bounds'][0], tilejson['bounds'][1], tilejson['bounds'][2], tilejson['bounds'][3])

        project = partial(
            pyproj.transform,
            pyproj.Proj('epsg:4326'),
            pyproj.Proj('epsg:3857')
        )

        poly = transform(project, poly)
        tiles = tilecover.cover_geometry(tileschemes.WebMercator(), poly, pred['tileZoom'])

        imglist = []

        for tile in tiles:
            bounds = mercantile.bounds(tile)

            imglist.append({
                'name': '{}-{}-{}'.format(str(tile.x), str(tile.y), str(tile.z)),
                'url': imagery['url']
                    .replace('{x}', str(tile.x))
                    .replace('{y}', str(tile.y))
                    .replace('{z}', str(tile.z)),
                'bounds': [ bounds[0], bounds[1], bounds[2], bounds[3] ]
            })

        return imglist
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

