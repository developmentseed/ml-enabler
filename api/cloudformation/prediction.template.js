const cf = require('@mapbox/cloudfriend');

module.exports = {
    AWSTemplateFormatVersion : '2010-09-09',
    Parameters: {
        GitSha: {
            Type: 'String',
            Description: 'GitSha to Deploy'
        },
        StackName: {
            Type: 'String',
            Description: 'Name of parent stack'
        },
        ImageTag: {
            Type: 'String',
            Description: 'ECR Image tag to deploy'
        },
        Inferences: {
            Type: 'String',
            Description: 'Ordered, CSV Delimited list of name for prediction values'
        },
        ProjectId: {
            Type: 'Number',
            Description: 'MLEnabler Project ID'
        },
        IterationId: {
            Type: 'Number',
            Description: 'MLEnabler Iteration ID'
        },
        ImageryId: {
            Type: 'Number',
            Description: 'ImageryId source to use'
        },
        MaxConcurrency: {
            Type: 'Number',
            Default: 50,
            Description: 'Max number of concurrent lambdas'
        },
        MaxSize: {
            Type: 'Number',
            Default: 10,
            Description: 'Max number of TFServing Images'
        },
        InfSupertile: {
            Type: 'String',
            Description: 'Model was trained and should inference on supertiles'
        },
        ModelType: {
            Type: 'String',
            Description: 'What type of model is being inferenced'
        },
    },
    Resources: {
        PredSQSAlarn: {
            Type: 'AWS::CloudWatch::Alarm',
            Properties: {
                AlarmName: cf.join([cf.stackName, '-sqs-empty']),
                AlarmDescription: 'Set an alarm to breach when SQS list is at 0',
                ActionsEnabled: true,
                OKActions: [],
                AlarmActions: [],
                InsufficientDataActions: [],
                Dimensions: [],
                EvaluationPeriods: 10,
                DatapointsToAlarm: 10,
                Threshold: 0,
                ComparisonOperator: 'LessThanOrEqualToThreshold',
                TreatMissingData: 'missing',
                Metrics: [{
                    Id: 'total',
                    Label: 'TotalSQS',
                    ReturnData: true,
                    Expression: 'SUM(METRICS())'
                },{
                    Id: 'm1',
                    ReturnData: false,
                    MetricStat: {
                        Metric: {
                            Namespace: 'AWS/SQS',
                            MetricName: 'ApproximateNumberOfMessagesNotVisible',
                            Dimensions: [{
                                Name: 'QueueName',
                                Value: cf.join([cf.stackName, '-queue'])
                            }]
                        },
                        Period: 60,
                        Stat: 'Maximum'
                    }
                },{
                    Id: 'm2',
                    ReturnData: false,
                    MetricStat: {
                        Metric: {
                            Namespace: 'AWS/SQS',
                            MetricName: 'ApproximateNumberOfMessagesVisible',
                            Dimensions: [{
                                Name: 'QueueName',
                                Value: cf.join([cf.stackName, '-queue'])
                            }]
                        },
                        Period: 60,
                        Stat: 'Maximum'
                    }
                },{
                    Id: 'm3',
                    ReturnData: false,
                    MetricStat: {
                        Metric: {
                            Namespace: 'AWS/SQS',
                            MetricName: 'ApproximateNumberOfMessagesDelayed',
                            Dimensions: [{
                                    Name: 'QueueName',
                                    Value: cf.join([cf.stackName, '-queue'])
                                }]
                        },
                        Period: 60,
                        Stat: 'Maximum'
                    }
                }]
            }
        },
        PredLambdaLogs: {
            Type: 'AWS::Logs::LogGroup',
            Properties: {
                LogGroupName: cf.join([
                    '/aws/lambda/', cf.ref('StackName'),
                    '-project-', cf.ref('ProjectId'),
                    '-iteration-', cf.ref('IterationId'),
                    '-queue'
                ]),
                RetentionInDays: 7
            }
        },
        PredLogs: {
            Type: 'AWS::Logs::LogGroup',
            Properties: {
                LogGroupName: cf.join('-', [
                    cf.ref('StackName'),
                    cf.ref('IterationId')
                ]),
                RetentionInDays: 7
            }
        },
        PredLambdaSource: {
            Type: 'AWS::Lambda::EventSourceMapping',
            Properties: {
                Enabled: 'True',
                EventSourceArn:  cf.getAtt('PredTileQueue', 'Arn'),
                FunctionName: cf.ref('PredLambdaFunction')
            }
        },
        PredLambdaFunction: {
            Type: 'AWS::Lambda::Function',
            DependsOn: ['PredLambdaLogs'],
            Properties: {
                Code: {
                    S3Bucket: 'devseed-artifacts',
                    S3Key: cf.join(['ml-enabler/lambda-', cf.ref('GitSha'), '.zip' ])
                },
                FunctionName: cf.join([ cf.stackName, '-queue']),
                Role: cf.importValue(cf.join([cf.ref('StackName'), '-lambda-role'])),
                Handler: 'download_and_predict.handler.handler',
                MemorySize: 512,
                Runtime: 'python3.8',
                ReservedConcurrentExecutions: cf.ref('MaxConcurrency'),
                Timeout: 240,
                Environment: {
                    Variables: {
                        GDAL_DATA: '/opt/share/gdal',
                        PROJ_LIB: '/opt/share/proj',
                        StackName: cf.stackName,
                        INFERENCES: cf.ref('Inferences'),
                        MODEL_TYPE: cf.ref('ModelType'),
                        INF_SUPERTILE: cf.ref('InfSupertile'),
                        IMAGERY_ID: cf.ref('ImageryId'),
                        PREDICTION_ENDPOINT: cf.join([
                            'http://', cf.getAtt('PredELB', 'DNSName'), '/v1/models/default/versions/001'
                        ]),
                        MLENABLER_ENDPOINT: cf.importValue(cf.join([cf.ref('StackName'), '-api']))
                    }
                }
            }
        },
        PredInstanceProfile: {
            Type: 'AWS::IAM::InstanceProfile',
            Properties: {
                Path: '/',
                Roles: [ cf.importValue(cf.join([cf.ref('StackName'), '-exec-role-name'])) ]
            }
        },
        PredTargetGroup: {
            Type: 'AWS::ElasticLoadBalancingV2::TargetGroup',
            DependsOn: 'PredELB',
            Properties: {
                Port: 8501,
                Protocol: 'HTTP',
                VpcId: cf.importValue(cf.join([cf.ref('StackName'), '-vpc'])),
                HealthCheckPath: '/v1/models/default',
                Matcher: {
                    HttpCode: '200,202,302,304'
                }
            }
        },
        PredHTTPListener: {
            Type: 'AWS::ElasticLoadBalancingV2::Listener',
            Properties: {
                DefaultActions: [{
                    Type: 'forward',
                    TargetGroupArn: cf.ref('PredTargetGroup')
                }],
                LoadBalancerArn: cf.ref('PredELB'),
                Port: 80,
                Protocol: 'HTTP'
            }
        },
        PredELB: {
            Type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
            Properties: {
                Type: 'application',
                SecurityGroups: [cf.ref('PredELBSecurityGroup')],
                LoadBalancerAttributes: [{
                    Key: 'idle_timeout.timeout_seconds',
                    Value: 240
                }],
                Subnets: [
                    cf.importValue(cf.join([cf.ref('StackName'), '-suba'])),
                    cf.importValue(cf.join([cf.ref('StackName'), '-subb'])),
                ]
            }
        },
        PredELBSecurityGroup: {
            Type : 'AWS::EC2::SecurityGroup',
            Properties: {
                GroupDescription: cf.join([cf.ref('StackName'), '-pred-elb-sg']),
                SecurityGroupIngress: [{
                    CidrIp: '0.0.0.0/0',
                    IpProtocol: 'tcp',
                    FromPort: 80,
                    ToPort: 80
                }],
                VpcId: cf.importValue(cf.join([ cf.ref('StackName'), '-vpc']))
            }
        },
        PredTileQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-queue' ]),
                VisibilityTimeout: 2880,
                RedrivePolicy: {
                    deadLetterTargetArn: cf.getAtt('PredDeadQueue', 'Arn'),
                    maxReceiveCount: 3
                }
            }
        },
        PredDeadQueue: {
            Type: 'AWS::SQS::Queue',
            Properties: {
                QueueName: cf.join([cf.stackName, '-dead-queue'])
            }
        },
        PredContainerInstanceLaunch: {
            Type: 'AWS::AutoScaling::LaunchConfiguration',
            DependsOn: 'PredECSHostSecurityGroup',
            Metadata: {
                'AWS::CloudFormation::Init': {
                    config : {
                        commands: {
                            '01_add_instance_to_cluster': {
                                command: cf.join([
                                    "echo ECS_CLUSTER=", cf.importValue(cf.join([cf.ref('StackName'), "-cluster" ])), " >> /etc/ecs/ecs.config\n"
                                ])
                            }
                        },
                        "files": {
                            "/etc/cfn/cfn-hup.conf": {
                                "content": cf.join([
                                    "[main]\n",
                                    "stack=", cf.stackId, "\n",
                                    "region=", cf.region, "\n"
                                ]),
                                mode: "000400",
                                owner: "root",
                                group: "root"
                            },
                            "/etc/cfn/hooks.d/cfn-auto-reloader.conf": {
                                "content": cf.join([
                                    "[cfn-auto-reloader-hook]\n",
                                    "triggers=post.update\n",
                                    "path=Resources.PredContainerInstanceLaunch.Metadata.AWS::CloudFormation::Init\n",
                                    "action=/opt/aws/bin/cfn-init -v --stack ", cf.stackName, " --resource PredContainerInstanceLaunch --region ", cf.region, "\n",
                                    "runas=root\n"
                                ])
                            }
                        },
                        "services": {
                            "sysvinit": {
                                "cfn-hup": {
                                    "enabled": "true",
                                    "ensureRunning": "true",
                                    "files": [
                                        "/etc/cfn/cfn-hup.conf",
                                        "/etc/cfn/hooks.d/cfn-auto-reloader.conf"
                                    ]
                                }
                            }
                        }
                    }
                }
            },
            Properties: {
                SecurityGroups: [ cf.ref('PredECSHostSecurityGroup') ],
                ImageId: { "Fn::FindInMap": [ "AWSRegionToAMI", cf.region, "AMIID" ] },
                InstanceType: "p3.2xlarge",
                IamInstanceProfile: cf.ref('PredInstanceProfile'),
                BlockDeviceMappings: [{
                    DeviceName: '/dev/xvdcz',
                    Ebs: {
                        DeleteOnTermination: true,
                        VolumeSize: 100,
                        VolumeType: 'gp2'
                    }
                }],
                UserData: cf.base64(cf.join([
                    "#!/bin/bash -xe\n",
                    "yum install -y aws-cfn-bootstrap\n",
                    "/opt/aws/bin/cfn-init -v --region ", cf.region, " --stack ", cf.stackName, " --resource PredContainerInstanceLaunch\n",
                    "/opt/aws/bin/cfn-signal -e $? --region ", cf.region, " --stack ", cf.stackName, " --resource PredECSAutoScalingGroup\n"
                ]))
            }
        },
        PredECSAutoScalingGroup: {
            Type: 'AWS::AutoScaling::AutoScalingGroup',
            CreationPolicy : {
                ResourceSignal: {
                    Timeout: 'PT10M',
                    Count: '1'
                }
            },
            UpdatePolicy: {
                AutoScalingRollingUpdate: {
                    MinInstancesInService: 0
                }
            },
            Properties: {
                AvailabilityZones: [
                    cf.findInMap('AWSRegion2AZ', cf.region, '1'),
                    cf.findInMap('AWSRegion2AZ', cf.region, '2')
                ],
                LaunchConfigurationName: cf.ref('PredContainerInstanceLaunch'),
                MinSize: 1,
                MaxSize: cf.ref('MaxSize'),
                DesiredCapacity: cf.ref('MaxSize'),
                VPCZoneIdentifier: [
                    cf.importValue(cf.join([cf.ref('StackName'), '-suba'])),
                    cf.importValue(cf.join([cf.ref('StackName'), '-subb'])),
                ]
            }
        },
        PredECSHostSecurityGroup: {
            Type: 'AWS::EC2::SecurityGroup',
            Properties: {
                VpcId: cf.importValue(cf.join([ cf.ref('StackName'), '-vpc'])),
                GroupDescription: "Access to the ECS hosts and the tasks/containers that run on them",
                SecurityGroupIngress: [{
                    SourceSecurityGroupId: cf.ref('PredELBSecurityGroup'),
                    IpProtocol: -1
                }]
            }
        },
        PredService: {
            Type: 'AWS::ECS::Service',
            DependsOn: [
                'PredECSAutoScalingGroup',
                'PredHTTPListener',
                'PredTargetGroup'
            ],
            "Properties": {
                ServiceName: cf.ref('ImageTag'),
                Cluster: cf.importValue(cf.join([ cf.ref('StackName'), '-cluster' ])),
                TaskDefinition: cf.ref('PredTaskDefinition'),
                DesiredCount: 1,
                DeploymentConfiguration: {
                    MaximumPercent: 100,
                    MinimumHealthyPercent: 0
                },
                LoadBalancers: [{
                    ContainerName: 'pred-app',
                    ContainerPort: 8501,
                    TargetGroupArn: cf.ref('PredTargetGroup')
                }]
            }
        },
        PredTaskDefinition: {
            Type: 'AWS::ECS::TaskDefinition',
            Properties: {
                Family: cf.ref('ImageTag'),
                Cpu: 8192,
                Memory: 61401,
                TaskRoleArn: cf.importValue(cf.join([
                    cf.ref('StackName'), '-task-role'
                ])),
                ContainerDefinitions: [{
                    Name: 'pred-app',
                    Essential: true,
                    Image: cf.join([
                        cf.accountId,
                        '.dkr.ecr.',
                        cf.region,
                        '.amazonaws.com/',
                        cf.ref('StackName'),
                        '-ecr:',
                        cf.ref('ImageTag'),
                    ]),
                    PortMappings: [{
                        ContainerPort: 8501
                    }],
                    Environment: [],
                    LogConfiguration: {
                        LogDriver: 'awslogs',
                        Options: {
                            'awslogs-group': cf.join('-', [
                                cf.ref('StackName'),
                                cf.ref('IterationId')
                            ]),
                            'awslogs-region': cf.region
                        }
                    }
                }]
            }
        },
        PredFirehose: {
            Type: 'AWS::KinesisFirehose::DeliveryStream',
            Properties: {
                DeliveryStreamName: cf.join([
                    cf.ref('StackName'),
                    '-project-', cf.ref('ProjectId'),
                    '-iteration-', cf.ref('IterationId')
                ]),
                DeliveryStreamType: 'DirectPut',
                ExtendedS3DestinationConfiguration: {
                    BucketARN: cf.join(['arn:aws:s3:::', cf.ref('StackName'), '-', cf.accountId, '-', cf.region]),
                    Prefix: cf.join([
                        'project/', cf.ref('ProjectId'),
                        '/iteration/', cf.ref('IterationId'),
                        '/prediction/submission-!{partitionKeyFromQuery:submission}/'
                    ]),
                    ErrorOutputPrefix: cf.join([
                        'project/', cf.ref('ProjectId'),
                        '/iteration/', cf.ref('IterationId'),
                        '/prediction-errors/!{firehose:error-output-type}/'
                    ]),
                    BufferingHints: {
                        IntervalInSeconds: 60,
                        SizeInMBs: 100
                    },
                    CompressionFormat: 'GZIP',
                    RoleARN: cf.importValue(cf.join([ cf.ref('StackName'), '-firehose-role' ])),
                    DynamicPartitioningConfiguration: {
                        Enabled: true,
                        RetryOptions: {
                            DurationInSeconds: 300
                        }
                    },
                    ProcessingConfiguration: {
                        Enabled: true,
                        Processors: [{
                            Type: 'MetadataExtraction',
                            Parameters: [{
                                ParameterName: 'MetadataExtractionQuery',
                                ParameterValue: '{submission:.submission_id}'
                            },{
                                ParameterName: 'JsonParsingEngine',
                                ParameterValue: 'JQ-1.6'
                            }]
                        },{
                            Type: 'AppendDelimiterToRecord',
                            Parameters: [{
                                ParameterName: 'Delimiter',
                                ParameterValue: '\\n'
                            }]
                        }]
                    }
                }
            },
        }
    },
    Mappings: {
        AWSRegionToAMI: {
            DOCS: { LIST: 'http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html' },
            'us-east-1': { AMIID: 'ami-07eb64b216d4d3522' }
        },
        AWSRegion2AZ: {
            'us-east-1': {
                1: 'us-east-1b',
                2: 'us-east-1c',
                3: 'us-east-1d',
                4: 'us-east-1e'
            },
            'us-west-1': {
                1: 'us-west-1b',
                2: 'us-west-1c'
            },
            'us-west-2': {
                1: 'us-west-2a',
                2: 'us-west-2b',
                3: 'us-west-2c'
            }
        }
    },
    Outputs : {
        API: {
            Description: 'API',
            Value: cf.join(['http://', cf.getAtt('PredELB', 'DNSName')])
        }
    }
}
