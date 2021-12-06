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
    },
    Resources: {
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
            Properties: {
                Layers: [ 'arn:aws:lambda:us-east-1:552188055668:layer:geolambda:2' ],
                Code: {
                    S3Bucket: 'devseed-artifacts',
                    S3Key: cf.join(['ml-enabler/lambda-', cf.ref('GitSha'), '.zip' ])
                },
                FunctionName: cf.join([ cf.stackName, '-queue']),
                Role: cf.importValue(cf.join([cf.ref('StackName'), '-lambda-role'])),
                Handler: 'download_and_predict.handler.handler',
                MemorySize: 512,
                Runtime: 'python3.7',
                ReservedConcurrentExecutions: cf.ref('MaxConcurrency'),
                Timeout: 240,
                Environment: {
                    Variables: {
                        'GDAL_DATA': "/opt/share/gdal",
                        'PROJ_LIB': "/opt/share/proj",
                        'StackName': cf.stackName,
                        'INFERENCES': cf.ref('Inferences'),
                        'INF_SUPERTILE': cf.ref('InfSupertile'),
                        'IMAGERY_ID': cf.ref('ImageryId'),
                        'PREDICTION_ENDPOINT': cf.join([
                            'http://', cf.getAtt('PredELB', 'DNSName'), '/v1/models/default/versions/001'
                        ]),
                        "MLENABLER_ENDPOINT": { "Fn::ImportValue": cf.join('-', [
                            cf.ref('StackName'), 'api'
                        ])}
                    }
                }
            }
        },
        PredInstanceProfile: {
            Type: 'AWS::IAM::InstanceProfile',
            Properties: {
                Path: '/',
                Roles: [{ "Fn::ImportValue": cf.join('-', [
                    cf.ref('StackName'), "exec-role-name"
                ])}]
            }
        },
        "PredTargetGroup": {
            "Type": "AWS::ElasticLoadBalancingV2::TargetGroup",
            "DependsOn": "PredELB",
            "Properties": {
                "Port": 8501,
                "Protocol": "HTTP",
                "VpcId": { "Fn::ImportValue": { "Fn::Join": [ "-", [
                    cf.ref('StackName'),
                    "vpc"
                ]]}},
                "HealthCheckPath": "/v1/models/default",
                "Matcher": {
                    "HttpCode": "200,202,302,304"
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
                "Type": "application",
                "SecurityGroups": [cf.ref('PredELBSecurityGroup')],
                "LoadBalancerAttributes": [{
                    "Key": "idle_timeout.timeout_seconds",
                    "Value": 240
                }],
                "Subnets": [
                    { "Fn::ImportValue": { "Fn::Join": [ "-", [ cf.ref('StackName'), "suba" ]]}},
                    { "Fn::ImportValue": { "Fn::Join": [ "-", [ cf.ref('StackName'), "subb" ]]}}
                ]
            }
        },
        PredELBSecurityGroup: {
            "Type" : "AWS::EC2::SecurityGroup",
            "Properties": {
                "GroupDescription": { "Fn::Join": [ "-", [
                    cf.ref('StackName'),
                    "pred-elb-sg"
                ]]},
                "SecurityGroupIngress": [{
                    "CidrIp": "0.0.0.0/0",
                    "IpProtocol": "tcp",
                    "FromPort": 80,
                    "ToPort": 80
                }],
                "VpcId": { "Fn::ImportValue": { "Fn::Join": [ "-", [
                    cf.ref('StackName'),
                    "vpc"
                ]]}}
            }
        },
        "PredTileQueue": {
            "Type": "AWS::SQS::Queue",
            "Properties": {
                "QueueName": { "Fn::Join": [ "-", [
                    cf.stackName,
                    "queue"
                ]]},
                "VisibilityTimeout": 2880,
                "RedrivePolicy": {
                    "deadLetterTargetArn": { "Fn::GetAtt": [ "PredDeadQueue", "Arn" ] },
                    "maxReceiveCount": 3
                }
            }
        },
        "PredDeadQueue": {
            "Type": "AWS::SQS::Queue",
            "Properties": {
                "QueueName": { "Fn::Join": [ "-", [
                    cf.stackName,
                    "dead-queue"
                ]]}
            }
        },
        "PredContainerInstanceLaunch": {
            "Type": "AWS::AutoScaling::LaunchConfiguration",
            "DependsOn": "PredECSHostSecurityGroup",
            "Metadata": {
                "AWS::CloudFormation::Init": {
                    "config" : {
                        "commands": {
                            "01_add_instance_to_cluster": {
                                "command": { "Fn::Join": [ "", ["echo ECS_CLUSTER=", { "Fn::ImportValue": { "Fn::Join": [ "-", [ cf.ref('StackName'), "cluster" ]]}}, " >> /etc/ecs/ecs.config\n" ]] }
                            }
                        },
                        "files": {
                            "/etc/cfn/cfn-hup.conf": {
                                "content": {
                                    "Fn::Join": [ "", [
                                        "[main]\n",
                                        "stack=", { "Ref": "AWS::StackId" }, "\n",
                                        "region=", { "Ref": "AWS::Region" }, "\n"
                                    ]]
                                },
                                "mode": "000400",
                                "owner": "root",
                                "group": "root"
                            },
                            "/etc/cfn/hooks.d/cfn-auto-reloader.conf": {
                                "content": {
                                    "Fn::Join": [ "", [
                                        "[cfn-auto-reloader-hook]\n",
                                        "triggers=post.update\n",
                                        "path=Resources.PredContainerInstanceLaunch.Metadata.AWS::CloudFormation::Init\n",
                                        "action=/opt/aws/bin/cfn-init -v --stack ", { "Ref": "AWS::StackName" }, " --resource PredContainerInstanceLaunch --region ", { "Ref": "AWS::Region" }, "\n",
                                        "runas=root\n"
                                    ]]
                                }
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
            "Properties": {
                "SecurityGroups": [{ "Ref": "PredECSHostSecurityGroup" }],
                "ImageId": { "Fn::FindInMap": [ "AWSRegionToAMI", { "Ref": "AWS::Region" }, "AMIID" ] },
                "InstanceType": "p3.2xlarge",
                "IamInstanceProfile": { "Ref": "PredInstanceProfile" },
                "BlockDeviceMappings": [{
                    "DeviceName": "/dev/xvdcz",
                    "Ebs": {
                        "DeleteOnTermination": true,
                        "VolumeSize": 100,
                        "VolumeType": "gp2"
                    }
                }],
                "UserData": {
                    "Fn::Base64": {
                        "Fn::Join": ["", [
                            "#!/bin/bash -xe\n",
                            "yum install -y aws-cfn-bootstrap\n",
                            "/opt/aws/bin/cfn-init -v --region ", { "Ref": "AWS::Region" }, " --stack ", { "Ref": "AWS::StackName" }, " --resource PredContainerInstanceLaunch\n",
                            "/opt/aws/bin/cfn-signal -e $? --region ", { "Ref": "AWS::Region" }, " --stack ", { "Ref": "AWS::StackName" }, " --resource PredECSAutoScalingGroup\n"
                        ]]
                    }
                }
            }
        },
        "PredECSAutoScalingGroup": {
            "Type": "AWS::AutoScaling::AutoScalingGroup",
            "CreationPolicy" : {
                "ResourceSignal" : {
                    "Timeout" : "PT10M",
                    "Count"   : "1"
                }
            },
            "UpdatePolicy": {
                "AutoScalingRollingUpdate": {
                    "MinInstancesInService": 0
                }
            },
            "Properties": {
                "AvailabilityZones": [
                    { "Fn::FindInMap": ["AWSRegion2AZ", { "Ref": "AWS::Region" }, "1"] },
                    { "Fn::FindInMap": ["AWSRegion2AZ", { "Ref": "AWS::Region" }, "2"] }
                ],
                "LaunchConfigurationName": { "Ref": "PredContainerInstanceLaunch" },
                "MinSize": 1,
                "MaxSize": { "Ref": "MaxSize" },
                "DesiredCapacity": { "Ref": "MaxSize" },
                "VPCZoneIdentifier": [
                    { "Fn::ImportValue": { "Fn::Join": [ "-", [ { "Ref": "StackName" }, "suba" ]]}},
                    { "Fn::ImportValue": { "Fn::Join": [ "-", [ { "Ref": "StackName" }, "subb" ]]}}
                ]
            }
        },
        "PredECSHostSecurityGroup": {
            "Type": "AWS::EC2::SecurityGroup",
            "Properties": {
                "VpcId": { "Fn::ImportValue": { "Fn::Join": [ "-", [
                    { "Ref": "StackName" },
                    "vpc"
                ]]}},
                "GroupDescription": "Access to the ECS hosts and the tasks/containers that run on them",
                "SecurityGroupIngress": [{
                    "SourceSecurityGroupId": { "Ref": "PredELBSecurityGroup" },
                    "IpProtocol": -1
                }]
            }
        },
        "PredService": {
            "Type": "AWS::ECS::Service",
            "DependsOn": [
                "PredECSAutoScalingGroup",
                "PredHTTPListener",
                "PredTargetGroup"
            ],
            "Properties": {
                "ServiceName": { "Ref": "ImageTag" },
                "Cluster": { "Fn::ImportValue": { "Fn::Join": [ "-", [ { "Ref": "StackName" }, "cluster" ]]}},
                "TaskDefinition": { "Ref": "PredTaskDefinition" },
                "DesiredCount": 1,
                "DeploymentConfiguration": {
                    "MaximumPercent": 100,
                    "MinimumHealthyPercent": 0
                },
                "LoadBalancers": [{
                    "ContainerName": "pred-app",
                    "ContainerPort": 8501,
                    "TargetGroupArn": { "Ref": "PredTargetGroup" }
                }]
            }
        },
        "PredTaskDefinition": {
            "Type": "AWS::ECS::TaskDefinition",
            "Properties": {
                "Family": { "Ref" : "ImageTag" },
                "Cpu": 8192,
                "Memory": 61401,
                "TaskRoleArn": { "Fn::ImportValue": { "Fn::Join": [ "-", [
                    { "Ref": "StackName" },
                    "task-role"
                ]]}},
                "ContainerDefinitions": [{
                    "Name": "pred-app",
                    "Essential": true,
                    "Image": { "Fn::Join" : [ "", [
                        { "Ref": "AWS::AccountId" },
                        ".dkr.ecr.",
                        { "Ref": "AWS::Region" },
                        ".amazonaws.com/",
                        { "Ref": "StackName" },
                        "-ecr:",
                        { "Ref": "ImageTag" }
                    ] ] },
                    "PortMappings": [{
                        "ContainerPort": 8501
                    }],
                    "Environment": [],
                    "LogConfiguration": {
                        "LogDriver": "awslogs",
                        "Options": {
                            "awslogs-group": { "Fn::Join": [ "-", [
                                { "Ref": "StackName" },
                                { "Ref": "IterationId" }
                            ]]},
                            "awslogs-region": { "Ref": "AWS::Region" }
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
                    "-project-", cf.ref('ProjectId'),
                    "-iteration-", cf.ref('IterationId')
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
                    RoleARN: cf.importValue(cf.join( '-', [ cf.ref('StackName'), "firehose-role" ])),
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
        "AWSRegionToAMI": {
            "DOCS": { "LIST": "http://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-optimized_AMI.html" },
            "us-east-1": { "AMIID": "ami-07eb64b216d4d3522" }
        },
        "AWSRegion2AZ": {
            "us-east-1": { "1": "us-east-1b", "2": "us-east-1c", "3": "us-east-1d", "4": "us-east-1e" },
            "us-west-1": { "1": "us-west-1b", "2": "us-west-1c" },
            "us-west-2": { "1": "us-west-2a", "2": "us-west-2b", "3": "us-west-2c" }
        }
    },
    "Outputs" : {
        "API": {
            "Description": "API",
            "Value": { "Fn::Join": ["", ["http://", { "Fn::GetAtt": ["PredELB", "DNSName"]}]]}
        }
    }
}