const AWS = require('aws-sdk');

const CW = new AWS.CloudWatch({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

/**
 * @class
 * @param {Config} config
 */
class CWAlarm {
    constructor(config) {
        this.config = config;
    }

    /**
     * @param {String} prefix Stack Prefix
     *
     * @param {Object} actions
     * @param {Boolean} actions.terminate
     * @param {Boolean} actions.vectorize
     */
    async update(prefix, actions = {}) {
        const alarms = await CW.describeAlarms({
            AlarmNamePrefix: `${prefix}-sqs-empty`
        }).promise();

        const oks = [];
        if (actions.terminate) oks.push(`arn:aws:sns:${this.config.region}:${this.config.account}:${this.config.StackName}-delete`);
        if (actions.vectorize) oks.push(`arn:aws:sns:${this.config.region}:${this.config.account}:${this.config.StackName}-vectorize`);

        for (const a of alarms.MetricAlarms) {
            CW.putMetricAlarm({
                AlarmName: a.AlarmName,
                ComparisonOperator: a.ComparisonOperator,
                EvaluationPeriods: a.EvaluationPeriods,
                ActionsEnabled: true,
                AlarmDescription: a.AlarmDescription,
                DatapointsToAlarm: a.DatapointsToAlarm,
                Metrics: a.Metrics,
                Threshold: a.Threshold,
                TreatMissingData: a.TreatMissingData,
                AlarmActions: [],
                InsufficientDataActions: [],
                OKActions: oks,
            }).promise();
        }
    }
}

module.exports = CWAlarm;
