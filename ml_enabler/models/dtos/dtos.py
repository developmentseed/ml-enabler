from schematics import Model
from schematics.types import StringType, IntType, DateTimeType, ListType, BooleanType, DictType

class AOIDTO(Model):
    """ Describes JSON of an Integration Source """

    id = IntType()
    name = StringType(required=True)
    model_id = StringType(required=True)
    pred_id = IntType()
    bounds = StringType(required=True)

class TokenDTO(Model):
    """ Describes JSON of an Integration Source """

    id = IntType()
    uid = IntType(required=True)
    name = StringType(required=True)
    token = StringType()
    created = DateTimeType(required=True)

class IntegrationDTO(Model):
    """ Describes JSON of an Integration Source """

    id = IntType()
    model_id = IntType(required=True)
    integration = StringType(required=True)
    name = StringType(required=True)
    url = StringType(required=True)

class ImageryDTO(Model):
    """ Describes JSON of an Imagery Source """

    id = IntType()
    model_id = IntType(required=True)
    name = StringType(required=True)
    url = StringType(required=True)
    fmt = StringType(required=True)

class TaskDTO(Model):
    """ Describes JSON of an Task """

    id = IntType()
    pred_id = IntType(required=True)
    type = StringType(required=True)
    created = DateTimeType()
    batch_id = IntType()

class ProjectAccessDTO(Model):
    """ Describes JSON of a ProjectAccess """

    id = IntType()
    model_id = IntType(required=True)
    uid = StringType(required=True)
    access = StringType(required=True)

class ProjectDTO(Model):
    """ Describes JSON of an Project """

    model_id = IntType(serialized_name='modelId')
    created = DateTimeType()
    access = StringType(required=True)
    name = StringType(required=True)
    tags = ListType(DictType(StringType), required=True)
    source = StringType(required=True)
    archived = BooleanType()
    project_url = StringType(serialized_name='projectUrl')
    users = ListType(DictType(StringType), required=False)

class PredictionDTO(Model):
    """ Describes JSON of a set of predictions from a model """

    prediction_id = IntType(serialized_name='predictionsId')
    hint = StringType(required=True)
    created = DateTimeType()
    model_id = IntType(serialized_name='modelId', required=True)
    version = StringType(serialized_name='version', required=True)
    docker_url = StringType(serialized_name='dockerUrl')
    tile_zoom = IntType(serialized_name='tileZoom', required=True)
    inf_list = StringType(serialized_name='infList', required=True)
    inf_type = StringType(serialized_name='infType', required=True)
    inf_binary = BooleanType(serialized_name='infBinary', required=True)
    inf_supertile = BooleanType(serialized_name='infSupertile', required=True)
    imagery_id = IntType(serialized_name='imagery_id', required=True)

    """ Asset Status
        log_link - store a link to the AWS CloudWatch Console
        model_link - store a link to the S3 Location of the raw model
        docker_link - store a link to the container in ECR
        save_link - download the TFServing container
    """

    log_link = StringType(serialized_name='logLink')
    model_link = StringType(serialized_name='modelLink')
    docker_link = StringType(serialized_name='dockerLink')
    save_link = StringType(serialized_name='saveLink')
