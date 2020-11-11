"""Example AWS Lambda function for chip-n-scale"""

import os, requests
from typing import Dict, Any
from pop.custom_types import SQSEvent

def handler(event: SQSEvent, context: Dict[str, Any]) -> bool:
    print(event)
    payload = event['Records'][0]['body']

    queue_name = payload['QUEUE_NAME']
    url = payload['TILE_URL']
    assert(queue_name)
    assert(url)

    queue = boto3.resource("sqs").get_queue_by_name(QueueName=queue_name)

    r = requests.get(url)
    r.raise_for_status()

    f = StringIO(r.text)
    cache = []
    for row in csv.reader(f, delimiter=","):
        cache.append({
            "Id": row[0],
            "MessageBody": json.dumps({
                "name": row[0],
                "url": row[1],
                "bounds": row[2].split(","),
            }),
        })

        if len(cache) == 10:
            queue.send_messages(Entries=cache)
            cache = []

    if len(cache) > 0:
        queue.send_messages(Entries=cache)

    return True

