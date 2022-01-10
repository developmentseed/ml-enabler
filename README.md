<h1 align=center>ML Enabler v3</h1>

<p align=center>Frictonless TF based model storage, inferencing & discovery</p>

## Background

Machine Learning has proven to be very successful to make mapping fast with high quality. With a diverse set of models and tools, it is hard to integrate them to existing tools like Tasking Manager and iD. ML Enabler is a service that provides better integration during model development as well integrating model inferences to mapping tools.

ML Enabler was initially developed by Development Seed in partnership with Humanitarian OpenStreetMap Team.

The API uses the following terms:
* **Model** --
A model is a machine learning model. With ml-enabler, we use the [TFService](https://www.tensorflow.org/tfx/tutorials/serving/rest_simple) convention of publishing models. This allows to spin up containers of the model for prediction and query the data for storage. For an example of a complete implementation, see Development Seed's [looking-glass](https://github.com/developmentseed/looking-glass-pub/). ml-enabler-api can store data from several versions of the same model.

* **Prediction** --
A prediction is a set of results from an ML Model for a bounding box (region) and at a specific tile level.

* **Prediction tiles** --
Prediction tiles are the results of the prediction. The tiles are indexed using quadkeys for easy spatial search.

## Deploying

The CloudFormation template is designed to be AWS Account agnostic and will create all necessary resources with
the exception of an SSL certificate (leave blank to disable https) and initial ECS images.

### Deploy Tools

The cloudformation template is designed to be deployed with [cfn-config](https://github.com/mapbox/cfn-config),
or a cfn-config compatible client.  [OpenAddresses/Deploy](https://github.com/openaddresses/deploy) is a compatible
client with a bunch of extra nice features.

### Paramaters

The following parameters have special considerations you should be aware of.

#### ContainerCpu & Container Memory

These values must be compatible with Fargate. See [Task CPU Limitations](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html)
for compatible values.

#### SSLCertificateIdentifier

The name of the SSL Cert as managed by AWS to use with the HTTPS ELB.
This value can be left blank to disable all HTTPS Load Balancing

## Using this API

See [API.md](/API.md)

## Development Setup

TODO: Update
### Using Docker
1. Copy `example.env` to `ml_enabler.env`
1. Run `docker-compose build`
2. Run `docker-compose up`

### Manual

1. Prerequisite
  - Install @openaddresses/deploy & yarn. This will make `deploy` & `yarn` command available globally
    ```npm install -g @openaddresses/deploy yarn```
  - [Install aws-cli](https://aws.amazon.com/cli/) & create user-access keys
  - Add `$(MAPBOX_TOKEN)` environment variable from your [mapbox account](https://account.mapbox.com/)
  - Install `jq` from [here](https://stedolan.github.io/jq/download/)

2. Clone ml-enabler & install node-modules (*TODO: Replace these with scripts in the future*)  
  ```
    gh repo clone developmentseed/ml-enabler
    cd ml-enabler/api && npm install && npx knex migrate:latest
    cd web && yarn install
    cd ../..
  ```
3. Clone a stacks database into local database for development
  ```
    ./clone prod
  ```
4. Authenticate the `deploy` cli to make any changes to the underlying AWS Infrastructure
  > Note: `profile name` should match with the AWS credentials file located at ~/.aws/credentials
  ```
    deploy init
    $(deploy env)
  ```
5. Run the API & web UI
  ```
    cd api && npm run dev
    cd web && npm run dev
  ```

TODO: Update
### Tests

1. Create a database for your tests:
  * `createdb ml_enabler_test`
  * Enabler postgis `echo 'CREATE EXTENSION postgis' | psql -d ml_enabler_test`
2. Run tests with `python3 -m unittest discover ml_enabler/tests/`

