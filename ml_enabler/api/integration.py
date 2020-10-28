import traceback

from flask import Blueprint
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.integration_service import IntegrationService
from ml_enabler.models.utils import IntegrationNotFound
from ml_enabler.api.auth import has_project_read, has_project_write
from flask_login import login_required
from flask import jsonify

integration_bp = Blueprint("integration_bp", __name__)


@login_required
@has_project_read
@integration_bp.route("/v1/model/<int:project_id>/integration", methods=["GET"])
def list(project_id):
    """
    List integrations for a given model
    ---
    produces:
        - application/json
    responses:
        200:
            description: Integration List
    """
    try:
        integration = IntegrationService.list(project_id)
        return jsonify(integration), 200
    except IntegrationNotFound:
        return err(404, "Integration not found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f"Unhandled error: {str(e)}"
        return err(500, error_msg), 500


@login_required
@has_project_read
@integration_bp.route(
    "/v1/model/<int:project_id>/integration/<int:integration_id>", methods=["GET"]
)
def get(project_id, integration_id):
    """
    Get an single integration
    ---
    produces:
        - application/json
    responses:
        200:
            description: Integration
    """
    try:
        integration = IntegrationService.get(integration_id)
        return integration, 200
    except IntegrationNotFound:
        return err(404, "Integration not found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f"Unhandled error: {str(e)}"
        return err(500, error_msg), 500


@login_required
@has_project_write
@integration_bp.route(
    "/v1/model/<int:project_id>/integration/<int:integration_id>", methods=["PATCH"]
)
def patch(project_id, integration_id):
    """
    Patch an single integration
    ---
    produces:
        - application/json
    responses:
        200:
            description: Integration
    """
    integration = request.get_json()
    integration_id = IntegrationService.patch(project_id, integration_id, integration)

    return {"model_id": project_id, "integration_id": integration_id}, 200


@login_required
@has_project_write
@integration_bp.route(
    "/v1/model/<int:project_id>/integration/<int:integration_id>", methods=["DELETE"]
)
def delete(project_id, integration_id):
    """
    Delete an single integration
    ---
    produces:
        - application/json
    responses:
        200:
            description: Integration
    """
    IntegrationService.delete(project_id, integration_id)

    return {"status": "deleted"}, 200


@login_required
@has_project_write
@integration_bp.route("/v1/model/<int:project_id>/integration", methods=["POST"])
def post(project_id):
    """
    Create a new integration
    ---
    produces:
        - application/json
    responses:
        200:
            description: Integration
    """
    try:
        integration = request.get_json()
        integration_id = IntegrationService.create(project_id, integration)

        return {"model_id": project_id, "integration_id": integration_id}, 200
    except Exception:
        current_app.logger.error(traceback.format_exc())

        return err(500, "Failed to save integration source to DB"), 500


@login_required
@has_project_write
@integration_bp.route(
    "/v1/model/<int:project_id>/integration/<int:integration_id>", methods=["POST"]
)
def use(project_id, integration_id):
    """
    Pass data to a given integration
    ---
    produces:
        - application/json
    responses:
        200:
            description: Integration
    """
    try:
        integration_payload = request.get_json()

        IntegrationService.payload(integration_id, integration_payload)
    except IntegrationNotFound:
        return err(404, "Integration not found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f"Unhandled error: {str(e)}"
        return err(500, error_msg), 500

    return {"status": "created"}, 200
