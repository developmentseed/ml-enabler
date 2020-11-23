"""Example AWS Lambda function for chip-n-scale"""

from io import StringIO
import os, boto3, requests, csv, json
from typing import Dict, Any
from pop.custom_types import SQSEvent
from contextlib import closing

def handler(event: SQSEvent) -> bool:
    queue_name = event['queue']
    url = event['url']
    assert(queue_name)
    assert(url)

    queue = boto3.resource("sqs").get_queue_by_name(QueueName=queue_name)

    with closing(requests.get(url, stream=True)) as r:
        r.raise_for_status()

        r.encoding = 'utf-8'
        reader = csv.reader(r.iter_lines(decode_unicode=True), delimiter=',', quotechar='"')

        cache = []
        total = -1;
        for row in reader:
            if total == -1:
                total += 1
                continue

            cache.append({
                "Id": row[0],
                "MessageBody": json.dumps({
                    "name": row[0],
                    "url": row[1],
                    "bounds": list(map(lambda x: float(x), row[2].split(",")))
                }),
            })
            total += 1

            if len(cache) == 10:
                queue.send_messages(Entries=cache)
                cache = []

        if len(cache) > 0:
            queue.send_messages(Entries=cache)

    print('ok - {} messages delivered', total)

    return True

if __name__ == '__main__':
    event = json.loads(os.getenv('TASK'))

    handler(event)

