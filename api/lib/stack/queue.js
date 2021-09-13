'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const Err = require('./error');
const sqs = new AWS.SQS({
    region: process.env.AWS_DEFAULT_REGION
});

class StackQueue {
    static async from(stack_name) {
        try {
            const queues = await sqs.listQueues({
                QueueNamePrefix: `${stack}-models-${model}-prediction-${pred}-`
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to list queues');
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
                QueueUrl=active,
                AttributeNames=[
                    'ApproximateNumberOfMessages',
                    'ApproximateNumberOfMessagesNotVisible',
                ]
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to get active queue');
        }

        try {
            queue.dead = await sqs.getQueueAttributes({
                QueueUrl=dead,
                AttributeNames=[
                    'ApproximateNumberOfMessages',
                ]
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to get active queue');
        }

        return queue;
    }

    serialize() {
        return {
            queued: this.active["Attributes"]["ApproximateNumberOfMessages"],
            inflight: this.active["Attributes"]["ApproximateNumberOfMessagesNotVisible"],
            dead: this.dead["Attributes"]["ApproximateNumberOfMessages"]
        }
    }

    static async delete() {
        try {
            const queues = await sqs.listQueues({
                QueueNamePrefix: `${stack}-models-${model}-prediction-${pred}-`
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
