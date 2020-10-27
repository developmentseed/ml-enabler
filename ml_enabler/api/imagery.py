from flask import Blueprint
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.imagery_service import ImageryService
from ml_enabler.models.utils import ImageryNotFound
from ml_enabler.api.auth import has_project_read, has_project_write
from flask_login import login_required
from flask import jsonify

imagery_bp = Blueprint(
    'imagery_bp', __name__
)


@login_required
@has_project_read
@imagery_bp.route('/v1/model/<int:project_id>/imagery', methods=['GET'])
def list(project_id):
    """
    List imagery sources for a given model
    ---
    produces:
        - application/json
    responses:
        200:
            description: Imagery List
    """

    try:
        imagery = ImageryService.list(project_id)
        return jsonify(imagery), 200
    except ImageryNotFound:
        return err(404, "Imagery not found"), 404
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500


@login_required
@has_project_read
@imagery_bp.route('/v1/model/<int:project_id>/imagery/<int:imagery_id>', methods=['GET'])
def get(project_id, imagery_id):
    """
    Get a specific imagery source
    ---
    produces:
        - application/json
    responses:
        200:
            description: Imagery Source
    """
    try:
        imagery = ImageryService.get(imagery_id)
        return imagery, 200
    except ImageryNotFound:
        return err(404, "Imagery not found"), 404
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500


@login_required
@has_project_write
@imagery_bp.route('/v1/model/<int:project_id>/imagery/<int:imagery_id>', methods=['PATCH'])
def patch(project_id, imagery_id):
    """
    Patch a specific imagery source
    ---
    produces:
        - application/json
    responses:
        200:
            description: Imagery Source
    """
    imagery = request.get_json();
    imagery_id = ImageryService.patch(project_id, imagery_id, imagery)

    return {
        "project_id": project_id,
        "imagery_id": imagery_id
    }, 200


@login_required
@has_project_write
@imagery_bp.route('/v1/model/<int:project_id>/imagery/<int:imagery_id>', methods=['DELETE'])
def delete(project_id, imagery_id):
    """
    Delete a specific imagery source
    ---
    produces:
        - application/json
    responses:
        200:
            description: Imagery Source
    """
    ImageryService.delete(project_id, imagery_id)

    return "deleted", 200


@login_required
@has_project_write
@imagery_bp.route('/v1/model/<int:project_id>/imagery', methods=['POST'])
def post(project_id):
    """
    Create a new imagery source
    ---
    produces:
        - application/json
    responses:
        200:
            description: Imagery Source
    """
    try:
        imagery = request.get_json()
        imagery_id = ImageryService.create(project_id, imagery)

        return {
            "project_id": project_id,
            "imagery_id": imagery_id
        }, 200
    except Exception as e:
        error_msg = f'Imagery Post: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, "Failed to save imagery source to DB"), 500

