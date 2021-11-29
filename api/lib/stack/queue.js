const AWS = require('aws-sdk');
const { Err } = require('@openaddresses/batch-schema');
const sqs = new AWS.SQS({
    region: process.env.AWS_DEFAULT_REGION
});

class StackQueue {
    static async from(pid, iterationid) {
        let queues;

        try {
            queues = await sqs.listQueues({
                QueueNamePrefix: `${process.env.StackName}-project-${pid}-iteration-${iterationid}-`
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to list queues');
        }

        if (!queues.QueueUrls) {
            throw new Err(400, null, 'No Queues Found');
        }

        let active, dead;
        for (const queue of queues.QueueUrls) {
            if (queue.includes('-dead-queue')) {
                dead = queue;
            } else if (queue.includes('-queue')) {
                active = queue;
            }
        }

        const queue = new StackQueue();
        try {
            queue.active = await sqs.getQueueAttributes({
                QueueUrl: active,
                AttributeNames: [
                    'ApproximateNumberOfMessages',
                    'ApproximateNumberOfMessagesNotVisible'
                ]
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to get active queue');
        }

        try {
            queue.dead = await sqs.getQueueAttributes({
                QueueUrl: dead,
                AttributeNames: [
                    'ApproximateNumberOfMessages'
                ]
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to get active queue');
        }

        return queue;
    }

    serialize() {
        return {
            queued: parseInt(this.active['Attributes']['ApproximateNumberOfMessages']),
            inflight: parseInt(this.active['Attributes']['ApproximateNumberOfMessagesNotVisible']),
            dead: parseInt(this.dead['Attributes']['ApproximateNumberOfMessages'])
        };
    }

    static async delete(pid, iterationid) {
        let queues;
        try {
            queues = await sqs.listQueues({
                QueueNamePrefix: `${process.env.StackName}-project-${pid}-iteration-${iterationid}-`
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to list queues');
        }

        for (const queue of queues.QueueUrls) {
            try {
                await sqs.purgeQueue({
                    QueueUrl: queue
                });
            } catch (err) {
                throw new Err(500, err, 'Failed to purge queue');
            }
        }

        return true;
    }
}

module.exports = StackQueue;
