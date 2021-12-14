const cf = require('@mapbox/cloudfriend');

module.exports = [{
    Effect: 'Allow',
    Action: [
        'cloudformation:CreateStack',
        'cloudformation:DeleteStack',
        'cloudformation:ListStacks',
        'cloudformation:DescribeStacks',
        'cloudformation:DescribeStackEvents',
        'cloudformation:DescribeStackResources'
    ],
    Resource: [
        cf.join(['arn:aws:cloudformation:', cf.region, ':', cf.accountId,':stack/', cf.stackName, '-*' ])
    ]
},{
    Effect: 'Allow',
    Action: [
        'cloudformation:ListStacks'
    ],
    Resource: [
        '*'
    ]
},{
    Effect: 'Allow',
    Action: [
        's3:GetObject'
    ],
    Resource: [
        'arn:aws:s3:::devseed-artifacts/ml-enabler/*'
    ]
},{
    Effect: 'Allow',
    Action: [
        'sns:*'
    ],
    Resource: [
        cf.join(['arn:aws:sns:', cf.region, ':', cf.accountId, ':', cf.stackName, '-*'])
    ]
},{
    Effect: 'Allow', // These are all required to spin up a prediction stack
    Action: [
        'deliverystream:*',
        'firehose:*',
        'iam:PassRole',
        'logs:DescribeLogGroups',
        'ecs:CreateService',
        'ecs:DescribeServices',
        'iam:CreateInstanceProfile',
        'lambda:GetLayerVersion',
        'iam:AddRoleToInstanceProfile',
        'ec2:DescribeInstances',
        'elasticloadbalancing:AddTags',
        'autoscaling:CreateLaunchConfiguration',
        'autoscaling:CreateAutoScalingGroup',
        'autoscaling:DescribeAutoScalingInstances',
        'logs:CreateLogGroup',
        'logs:PutRetentionPolicy',
        'autoscaling:UpdateAutoScalingGroup',
        'elasticloadbalancing:DescribeListeners',
        'elasticloadbalancing:ModifyLoadBalancerAttributes',
        'autoscaling:DescribeLaunchConfigurations',
        'lambda:CreateEventSourceMapping',
        'elasticloadbalancingv2:CreateListener',
        'elasticloadbalancing:CreateListener',
        'lambda:GetEventSourceMapping',
        'ec2:AuthorizeSecurityGroupIngress',
        'lambda:PutFunctionConcurrency',
        'sqs:GetQueueAttributes',
        'elasticloadbalancingv2:CreateTargetGroup',
        'elasticloadbalancingv2:DescribeTargetGroups',
        'elasticloadbalancingv2:DescribeLoadBalancers',
        'elasticloadbalancing:DescribeTargetGroups',
        'elasticloadbalancing:CreateTargetGroup',
        'elasticloadbalancing:CreateLoadBalancer',
        'application-autoscaling:RegisterScalableTarget',
        'application-autoscaling:PutScalingPolicy',
        'elasticloadbalancing:DescribeLoadBalancers',
        'ec2:DescribeAccountAttributes',
        'ec2:DescribeAddresses',
        'ec2:DescribeInternetGateways',
        'ec2:DescribeSecurityGroups',
        'ec2:DescribeSubnets',
        'ec2:DescribeVpcs',
        'iam:CreateServiceLinkedRole',
        'ec2:CreateSecurityGroup',
        'sqs:CreateQueue',
        'sqs:GetQueueAttributes',
        'lambda:GetFunction',
        'elasticloadbalancingv2:CreateTargetGroup',
        'ecs:RegisterTaskDefinition',
        'lambda:CreateFunction',
        'lambda:InvokeFunction',
        'ec2:DescribeSecurityGroups'
    ],
    Resource: [
        '*'
    ]
},{
    Effect: 'Allow', // And these are required to delete it
    Action: [
        'ec2:createTags',
        'ecs:DeleteService',
        'ec2:DeleteSecurityGroup',
        'logs:DeleteLogGroup',
        'autoscaling:DeleteAutoScalingGroup',
        'autoscaling:DescribeAutoScalingGroup',
        'autoscaling:DescribeAutoScalingGroups',
        'autoscaling:DeleteLaunchConfiguration',
        'autoscaling:DescribeScalingActivities',
        'iam:RemoveRoleFromInstanceProfile',
        'iam:DeleteInstanceProfile',
        'elasticloadbalancingv2:DeleteLoadBalancer',
        'elasticloadbalancingv2:DeleteListener',
        'elasticloadbalancingv2:DeleteTargetGroup',
        'elasticloadbalancing:DeleteTargetGroup',
        'elasticloadbalancing:DeleteListener',
        'elasticloadbalancing:DeleteLoadBalancer',
        'ec2:DeleteSecurityGroup',
        'sqs:DeleteQueue',
        'ecs:DeregisterTaskDefinition',
        'ecs:UpdateService',
        'lambda:DeleteFunction',
        'lambda:DeleteEventSourceMapping',
        'application-autoscaling:DeregisterScalableTarget',
        'application-autoscaling:DescribeScalingPolicies',
        'application-autoscaling:DescribeScalableTargets'
    ],
    Resource: [
        '*'
    ]
},{
    Effect: 'Allow',
    Action: [
        'cloudwatch:DescribeAlarms',
    ],
    Resource: [
        cf.join(['arn:aws:cloudwatch:', cf.region, ':', cf.accountId, ':alarm:*'])
    ]
},{
    Effect: 'Allow',
    Action: [
        'cloudwatch:DeleteAlarms',
        'cloudwatch:PutMetricAlarm',
        'cloudwatch:SetAlarmState'
    ],
    Resource: [
        cf.join(['arn:aws:cloudwatch:', cf.region, ':', cf.accountId, ':alarm:', cf.stackName, '-*'])
    ]
},{
    Effect: 'Allow',
    Action: [
        'sqs:PurgeQueue',
        'sqs:SendMessage',
        'sqs:ChangeMessageVisibility',
        'sqs:ListQueues',
        'sqs:GetQueueUrl',
        'sqs:GetQueueAttributes',
    ],
    Resource: [
        cf.join(['arn:aws:sqs:', cf.region, ':', cf.accountId, ':*'])
    ]
},{
    Effect: 'Allow',
    Action: [
        'batch:SubmitJob',
        'batch:ListJobs',
        'batch:DescribeJobs'
    ],
    Resource: [
        cf.join(['arn:aws:batch:', cf.region, ':', cf.accountId, ':*'])
    ]

},{
    Effect: 'Allow',
    Action: [
        'logs:GetLogEvents',
        'batch:CancelJob',
        'batch:DescribeJobs'
    ],
    Resource: [
        '*'
    ]
},{
    Effect: 'Allow',
    Action: [
        's3:GetObject',
        's3:DeleteObject',
        's3:AbortMultipartUpload',
        's3:GetObjectAcl',
        's3:ListMultipartUploadParts',
        's3:PutObject',
        's3:PutObjectAcl'
    ],
    Resource: [
        cf.join(['arn:aws:s3:::', cf.ref('MLEnablerBucket'), '/*'])
    ]
}];
