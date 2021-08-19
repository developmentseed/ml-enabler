    if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
        return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

    try:
        getList()

        res = {"models": [], "predictions": [], "stacks": []}

        for stack in stacks:
            name = stack.get("StackName")
            if (
                name.startswith(CONFIG.EnvironmentConfig.STACK + "-models-")
                and name not in res["stacks"]
            ):
                res["stacks"].append(stack.get("StackName"))

                split = name.split("-")
                model = int(split[len(split) - 3])
                prediction = int(split[len(split) - 1])

                if model not in res["models"]:
                    res["models"].append(model)
                if prediction not in res["predictions"]:
                    res["predictions"].append(prediction)

        return res, 200

    except Exception:
        current_app.logger.error(traceback.format_exc())

        return err(500, "Failed to get stack list"), 500


@login_required
@has_project_write
@stacks_bp.route(
    "/v1/model/<int:project_id>/prediction/<int:prediction_id>/stack", methods=["POST"]
)
def post(project_id, prediction_id):
    if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
        return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

    payload = request.get_json()

    pred = PredictionService.get_prediction_by_id(prediction_id)
    image = "models-{model}-prediction-{prediction}".format(
        model=project_id, prediction=prediction_id
    )

    stack = "{stack}-{image}".format(stack=CONFIG.EnvironmentConfig.STACK, image=image)

    template = ""
    with open("cloudformation/prediction.template.json", "r") as file:
        template = file.read()

    try:
        boto3.client("cloudformation").create_stack(
            StackName=stack,
            TemplateBody=template,
            Tags=payload.get("tags", []),
            Parameters=[
                {
                    "ParameterKey": "GitSha",
                    "ParameterValue": CONFIG.EnvironmentConfig.GitSha,
                },
                {
                    "ParameterKey": "MachineAuth",
                    "ParameterValue": CONFIG.EnvironmentConfig.MACHINE_AUTH,
                },
                {
                    "ParameterKey": "StackName",
                    "ParameterValue": CONFIG.EnvironmentConfig.STACK,
                },
                {
                    "ParameterKey": "ImageTag",
                    "ParameterValue": image,
                },
                {
                    "ParameterKey": "Inferences",
                    "ParameterValue": pred.inf_list,
                },
                {"ParameterKey": "ModelId", "ParameterValue": str(project_id)},
                {"ParameterKey": "PredictionId", "ParameterValue": str(prediction_id)},
                {
                    "ParameterKey": "ImageryId",
                    "ParameterValue": str(pred.imagery_id),
                },
                {
                    "ParameterKey": "MaxSize",
                    "ParameterValue": payload.get("maxSize", "1"),
                },
                {
                    "ParameterKey": "MaxConcurrency",
                    "ParameterValue": payload.get("maxConcurrency", "50"),
                },
                {
                    "ParameterKey": "InfSupertile",
                    "ParameterValue": str(pred.inf_supertile),
                },
            ],
            Capabilities=["CAPABILITY_NAMED_IAM"],
            OnFailure="ROLLBACK",
        )

        return {"status": "Stack Creation Initiated"}
    except Exception:
        current_app.logger.error(traceback.format_exc())

        return err(500, "Failed to create stack info"), 500


@login_required
@has_project_write
@stacks_bp.route(
    "/v1/model/<int:project_id>/prediction/<int:prediction_id>/stack",
    methods=["DELETE"],
)
def delete(project_id, prediction_id):
    if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
        return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

    try:
        stack = "{stack}-models-{model}-prediction-{prediction}".format(
            stack=CONFIG.EnvironmentConfig.STACK,
            model=project_id,
            prediction=prediction_id,
        )

        boto3.client("cloudformation").delete_stack(StackName=stack)

        return {
            "status": "Stack Deletion Initiated",
        }
    except Exception as e:
        if str(e).find("does not exist") != -1:
            return {"name": stack, "status": "None"}, 200
        else:
            current_app.logger.error(traceback.format_exc())

            return err(500, "Failed to get stack info"), 500


@login_required
@has_project_read
@stacks_bp.route(
    "/v1/model/<int:project_id>/prediction/<int:prediction_id>/stack", methods=["GET"]
)
def get(project_id, prediction_id):
    """
    Return status of a prediction stack
    ---
    produces:
        - application/json
    responses:
        200:
            description: ID of the prediction
        400:
            description: Invalid Request
        500:
            description: Internal Server Error
    """

    if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
        return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

    try:
        stack = "{stack}-models-{model}-prediction-{prediction}".format(
            stack=CONFIG.EnvironmentConfig.STACK,
            model=project_id,
            prediction=prediction_id,
        )

        res = boto3.client("cloudformation").describe_stacks(StackName=stack)

        stack = {
            "id": res.get("Stacks")[0].get("StackId"),
            "name": stack,
            "status": res.get("Stacks")[0].get("StackStatus"),
        }

        return stack, 200
    except Exception as e:
        if str(e).find("does not exist") != -1:
            return {"name": stack, "status": "None"}, 200
        else:
            current_app.logger.error(traceback.format_exc())

            return err(500, "Failed to get stack info"), 500
