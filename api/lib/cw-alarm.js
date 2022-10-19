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
     * @param {String} alarm Alarm Name
     *
     * @param {Object} actions
     * @param {Boolean} actions.terminate
     * @param {Boolean} actions.vectorize
     */
    async update(alarm, actions = {}) {
        const alarms = await CW.describeAlarms({
            AlarmNamePrefix: alarm
        }).promise();

        const new_alarms = [];
        if (actions.terminate) new_alarms.push(`arn:aws:sns:${this.config.region}:${this.config.account}:${this.config.StackName}-delete`);
        if (actions.vectorize) new_alarms.push(`arn:aws:sns:${this.config.region}:${this.config.account}:${this.config.StackName}-vectorize`);

        for (const a of alarms.MetricAlarms) {
            await CW.setAlarmState({
                AlarmName: a.AlarmName,
                StateReason: 'Pending Queue Population',
                StateValue: 'OK'
            }).promise();

            await CW.putMetricAlarm({
                AlarmName: a.AlarmName,
                ComparisonOperator: a.ComparisonOperator,
                EvaluationPeriods: a.EvaluationPeriods,
                // The API sets up desired alarm actions - but the populate task
                // enables them once the queue is populated
                ActionsEnabled: false,
                AlarmDescription: a.AlarmDescription,
                DatapointsToAlarm: a.DatapointsToAlarm,
                Metrics: a.Metrics,
                Threshold: a.Threshold,
                TreatMissingData: a.TreatMissingData,
                AlarmActions: new_alarms,
                InsufficientDataActions: [],
                OKActions: []
            }).promise();
        }
    }
}

module.exports = CWAlarm;
