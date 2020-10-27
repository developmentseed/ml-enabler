import traceback
from flask import Blueprint
from flask_login import current_user
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.models.dtos.dtos import ProjectDTO
from ml_enabler.services.project_service import ProjectService
from ml_enabler.models.utils import NotFound
from ml_enabler.api.auth import has_project_read, has_project_admin
from sqlalchemy.exc import IntegrityError
from flask_login import login_required
from schematics.exceptions import DataError
from flask import jsonify

projects_bp = Blueprint(
    'projects_bp', __name__
)


@login_required
@projects_bp.route('/v1/model', methods=['POST'])
def post():
    """
    Create a new Project
    ---
    produces:
        - application/json
    parameters:
        - in: body
          name: body
          required: true
          type: string
          description: JSON object of model information
          schema:
            properties:
                name:
                    type: string
                    description: name of the ML model
                source:
                    type: string
                    description: source of the ML model
                project_url:
                    type: string
                    description: URL to project page
    responses:
        200:
            description: ML Model subscribed
        400:
            description: Invalid Request
        500:
            description: Internal Server Error
    """
    try:
        dto = ProjectDTO(request.get_json())
        dto.validate()
        model_id = ProjectService.subscribe_ml_model(dto)
        return {"model_id": model_id}, 200
    except DataError as e:
        current_app.logger.error(traceback.format_exc())
        return str(e), 400
    except IntegrityError as e:
        current_app.logger.error(traceback.format_exc())
        return str(e), 400


@login_required
@has_project_admin
@projects_bp.route('/v1/model/<int:project_id>', methods=['DELETE'])
def delete(model_id):
    """
    Deletes an existing model and it's predictions
    ---
    produces:
        - application/json
    parameters:
        - in: path
          name: model_id
          description: ID of the Model to be deleted
          required: true
          type: integer
    responses:
        200:
            description: ML Model deleted
        404:
            description: Model doesn't exist
        500:
            description: Internal Server Error
    """
    try:
        ProjectService.delete_ml_model(model_id)
        return {"success": "model deleted"}, 200
    except NotFound:
        return err(404, "model not found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f'Unhandled error: {str(e)}'
        return err(500, error_msg), 500


@login_required
@has_project_read
@projects_bp.route('/v1/model/<int:model_id>', methods=['GET'])
def get(model_id):
    """
    Get model information with the ID
    ---
    produces:
        - application/json
    parameters:
        - in: path
          name: model_id
          description: ID of the Model to be fetched
          required: true
          type: integer
    responses:
        200:
            description: ML Model information
        404:
            description: Model doesn't exist
        500:
            description: Internal Server Error
    """
    try:
        dto = ProjectService.get_ml_model_by_id(model_id)
        return dto.to_primitive(), 200
    except NotFound:
        return err(404, "model not found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f'Unhandled error: {str(e)}'
        return err(500, error_msg), 500


@login_required
@has_project_admin
@projects_bp.route('/v1/model/<int:model_id>', methods=['PUT'])
def put(model_id):
    """
    Update an existing model
    ---
    produces:
        - application/json
    parameters:
        - in: path
          name: model_id
          description: ID of the Model to update
          required: true
          type: integer
        - in: body
          name: body
          required: true
          type: string
          description: JSON object of model information
          schema:
            properties:
                name:
                    type: string
                    description: name of the ML model
                source:
                    type: string
                    description: source of the ML model
                project_url:
                    type: string
                    description: URL to project page
    responses:
        200:
            description: Updated model information
        404:
            description: Model doesn't exist
        500:
            description: Internal Server Error
    """
    try:
        dto = ProjectDTO(request.get_json())
        dto.validate()

        model_id = ProjectService.update_ml_model(dto)
        return {"model_id": model_id}, 200
    except NotFound:
        return err(404, "model not found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f'Unhandled error: {str(e)}'
        return err(500, error_msg), 500


@login_required
@projects_bp.route('/v1/model', methods=['GET'])
def list():
    """
    Get all ML models
    ---
    produces:
        - application/json
    responses:
        200:
            description: List of ML models
        404:
            description: No models found
        500:
            description: Internal Server Error
    """
    model_filter = request.args.get('filter', '')
    model_archived = request.args.get('archived', 'false')

    if model_archived == 'false':
        model_archived = False
    elif model_archived == 'true':
        model_archived = True
    else:
        return err(400, "archived param must be 'true' or 'false'"), 400

    try:
        ml_models = ProjectService.get_all(current_user.id, model_filter, model_archived)
        return jsonify(ml_models), 200
    except NotFound:
        return err(404, "no models found"), 404
    except Exception as e:
        current_app.logger.error(traceback.format_exc())

        error_msg = f'Unhandled error: {str(e)}'
        return err(500, error_msg), 500
