'use strict';

const cf = require('@mapbox/cloudfriend');

const stack = {
    Resources: {
        BatchJobRole: {
            Type: 'AWS::IAM::Role',
            Properties: {
                AssumeRolePolicyDocument: {
                    Version: '2012-10-17',
                    Statement: [{
                        Effect: 'Allow',
                        Principal: {
                            Service: 'ecs-tasks.amazonaws.com'
                        },
                        Action: 'sts:AssumeRole'
                    }]
                },
                Policies: [{
                    PolicyName: 'batch-job-policy',
                    PolicyDocument: {
                        Statement: [{
                            Effect: 'Allow',
                            Action: [
                                'ecr:GetAuthorizationToken',
                                'ecr:TagResource',
                                'ecr:GetDownloadUrlForLayer',
                                'ecr:BatchGetImage',
                                'ecr:BatchCheckLayerAvailability',
                                'ecr:PutImage',
                                'ecr:InitiateLayerUpload',
                                'ecr:UploadLayerPart',
                                'ecr:CompleteLayerUpload'
                            ],
                            Resource: [ '*' ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                'batch:DescribeJobs'
                            ],
                            Resource: ['*']
                        },{
                            Effect: 'Allow',
                            Action: [
                                's3:ListBucket',
                                's3:GetObject',
                                's3:DeleteObject',
                                's3:AbortMultipartUpload',
                                's3:GetObjectAcl',
                                's3:ListMultipartUploadParts',
                                's3:PutObject',
                                's3:PutObjectAcl'
                            ],
                            Resource: [
                                cf.join(['arn:aws:s3:::', cf.ref('MLEnablerBucket') ]),
                                cf.join(['arn:aws:s3:::', cf.ref('MLEnablerBucket'), '/*'])
                            ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                'cloudwatch:DescribeAlarms',
                                'cloudwatch:SetAlarmState',
                                'cloudwatch:PutMetricAlarm',
                                'cloudwatch:EnableAlarmActions'
                            ],
                            Resource: [
                                cf.join(['arn:aws:cloudwatch:', cf.region, ':', cf.accountId, ':alarm:', cf.stackName, '-*'])
                            ]
                        },{
                            Effect: 'Allow',
                            Action: [
                                'sqs:SendMessage',
                                'sqs:ReceiveMessage',
                                'sqs:ChangeMessageVisibility',
                                'sqs:DeleteMessage',
                                'sqs:GetQueueUrl',
                                'sqs:GetQueueAttributes'
                            ],
                            Resource: [
                                cf.join(['arn:aws:sqs:', cf.region, ':', cf.accountId, ':', cf.stackName, '-*'])
                            ]
                        }]
                    }
                }],
                Path: '/'
            }
        },
        BatchPopJobDefinition: {
            Type: 'AWS::Batch::JobDefinition',
            Properties: {
                Type: 'container',
                JobDefinitionName: cf.join('-', [cf.stackName, 'pop-job']),
                RetryStrategy: {
                    Attempts: 1
                },
                Parameters: { },
                Timeout: {
                    AttemptDurationSeconds: 2 * 60 * 60 // 2hr timeout
                },
                ContainerProperties: {
                    Environment: [
                        { Name: 'StackName' , Value: cf.stackName },
                        { Name: 'AWS_ACCOUNT_ID', Value: cf.accountId },
                        { Name: 'AWS_REGION', Value: cf.region },
                        { Name: 'AWS_DEFAULT_REGION' , Value: cf.region },
                        { Name: 'API_URL', Value: cf.join(['http://', cf.getAtt('MLEnablerELB', 'DNSName')]) }
                    ],
                    Memory: 512,
                    Privileged: true,
                    JobRoleArn: cf.getAtt('BatchJobRole', 'Arn'),
                    ReadonlyRootFilesystem: false,
                    Vcpus: 1,
                    Image: cf.join([cf.ref('AWS::AccountId'), '.dkr.ecr.', cf.ref('AWS::Region'), '.amazonaws.com/ml-enabler:task-pop-', cf.ref('GitSha')])
                }
            }
        },
        BatchBuildJobDefinition: {
            Type: 'AWS::Batch::JobDefinition',
            Properties: {
                Type: 'container',
                JobDefinitionName: cf.join('-', [cf.stackName, 'build-job']),
                RetryStrategy: {
                    Attempts: 1
                },
                Timeout: {
                    AttemptDurationSeconds: 2 * 60 * 60 // 2hr timeout
                },
                Parameters: { },
                ContainerProperties: {
                    Command: ['./task.js'],
                    Environment: [
                        { Name: 'StackName' , Value: cf.stackName },
                        { Name: 'BATCH_ECR' , Value: cf.join([cf.accountId, '.dkr.ecr.', cf.region, '.amazonaws.com/', cf.ref('BatchECR')]) },
                        { Name: 'AWS_ACCOUNT_ID', Value: cf.accountId },
                        { Name: 'AWS_REGION', Value: cf.region },
                        { Name: 'API_URL', Value: cf.join(['http://', cf.getAtt('MLEnablerELB', 'DNSName')]) }
                    ],
                    Memory: 4000,
                    Privileged: true,
                    JobRoleArn: cf.getAtt('BatchJobRole', 'Arn'),
                    ReadonlyRootFilesystem: false,
                    Vcpus: 2,
                    Image: cf.join([cf.ref('AWS::AccountId'), '.dkr.ecr.', cf.ref('AWS::Region'), '.amazonaws.com/ml-enabler:task-build-', cf.ref('GitSha')])
                }
            }
        },
        BatchTfRecordJobDefinition: {
            Type: 'AWS::Batch::JobDefinition',
            Properties: {
                Type: 'container',
                JobDefinitionName: cf.join('-', [cf.stackName, 'tfrecords-job']),
                RetryStrategy: {
                    Attempts: 1
                },
                Parameters: { },
                Timeout: {
                    AttemptDurationSeconds: 2 * 60 * 60 // 2hr timeout
                },
                ContainerProperties: {
                    Command: ['python', './task.py'],
                    Environment: [
                        { Name: 'StackName' , Value: cf.stackName },
                        { Name: 'BATCH_ECR' , Value: cf.ref('BatchECR') },
                        { Name: 'AWS_ACCOUNT_ID', Value: cf.accountId },
                        { Name: 'AWS_REGION', Value: cf.region },
                        { Name: 'API_URL', Value: cf.join(['http://', cf.getAtt('MLEnablerELB', 'DNSName')]) }
                    ],
                    Memory: 4000,
                    Privileged: true,
                    JobRoleArn: cf.getAtt('BatchJobRole', 'Arn'),
                    ReadonlyRootFilesystem: false,
                    Vcpus: 2,
                    Image: cf.join([cf.ref('AWS::AccountId'), '.dkr.ecr.', cf.ref('AWS::Region'), '.amazonaws.com/ml-enabler:task-tfrecords-', cf.ref('GitSha')])
                }
            }
        },
        BatchVectorizeJobDefinition: {
            Type: 'AWS::Batch::JobDefinition',
            Properties: {
                Type: 'container',
                JobDefinitionName: cf.join('-', [cf.stackName, 'vectorize-job']),
                RetryStrategy: {
                    Attempts: 1
                },
                Timeout: {
                    AttemptDurationSeconds: 12 * 60 * 60 // 12hr timeout
                },
                Parameters: { },
                ContainerProperties: {
                    Command: ['./task'],
                    Environment: [
                        { Name: 'StackName' , Value: cf.stackName },
                        { Name: 'BATCH_ECR' , Value: cf.ref('BatchECR') },
                        { Name: 'AWS_ACCOUNT_ID', Value: cf.accountId },
                        { Name: 'AWS_REGION', Value: cf.region },
                        { Name: 'API_URL', Value: cf.join(['http://', cf.getAtt('MLEnablerELB', 'DNSName')]) },
                        { Name: 'ASSET_BUCKET', Value: cf.ref('MLEnablerBucket') }
                    ],
                    Memory: 4000,
                    Privileged: true,
                    JobRoleArn: cf.getAtt('BatchJobRole', 'Arn'),
                    ReadonlyRootFilesystem: false,
                    Vcpus: 2,
                    Image: cf.join([cf.ref('AWS::AccountId'), '.dkr.ecr.', cf.ref('AWS::Region'), '.amazonaws.com/ml-enabler:task-vectorize-', cf.ref('GitSha')])
                }
            }
        },
    }
};

module.exports = stack;
