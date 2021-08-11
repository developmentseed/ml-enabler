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
