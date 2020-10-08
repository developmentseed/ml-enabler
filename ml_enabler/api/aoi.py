from flask import Blueprint, session
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.aoi_service import AOIService
import ml_enabler.config as CONFIG
from ml_enabler.api.auth import has_project_read, has_project_write, has_project_admin
from flask_login import login_required
from flask import jsonify

aoi_bp = Blueprint(
    'aoi_bp', __name__
)

@login_required
@has_project_read
@aoi_bp.route('/v1/model/<int:model_id>/aoi', methods=['GET'])
def list(model_id):
    """
    Return a list of AOIs for a given model_id
    ---
    produces:
        - application/json
    responses:
        200:
            description: AOI List
    """

    try:
        pred_id = request.args.get('pred_id')
        aoi = AOIService.list(model_id, pred_id)
        return jsonify(aoi), 200
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500

@login_required
@has_project_write
@aoi_bp.route('/v1/model/<int:model_id>/aoi', methods=['POST'])
def post(model_id):
    """
    Create a new AOI for a given model
    ---
    produces:
        - application/json
    responses:
        200:
            description: AOI
    """
    try:
        payload = request.get_json()

        payload['model_id'] = model_id;
        aoi = AOIService.create(payload)

        return aoi, 200
    except Exception as e:
        error_msg = f'AOI Post: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, "Failed to save aoi source to DB"), 500

