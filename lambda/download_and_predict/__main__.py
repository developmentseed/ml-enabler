import json
from download_and_predict.handler import handler

handler(event={
    'Records': [{
        'body': json.dumps({
            'name': '18-52269-100179',
            'x': 52269,
            'y': 100179,
            'z': 18,
            'url': 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/18/52269/100179?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXFhYTA2bTMyeW44ZG0ybXBkMHkifQ.gUGbDOPUN1v1fTs5SeOR4A'
        })
    }]
}, context={})
