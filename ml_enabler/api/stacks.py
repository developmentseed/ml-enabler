
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

