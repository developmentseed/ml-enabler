from flask import Blueprint, session
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.aoi_service import AOIService
import ml_enabler.config as CONFIG
from flask_login import login_required
from flask import jsonify

aoi_bp = Blueprint(
    'aoi_bp', __name__
)

@login_required
@aoi_bp.route('/v1/model/<int:model_id>/aoi', methods=['GET'])
def list(model_id):
    try:
        aoi = AOIService.list(model_id)
        return jsonify(aoi), 200
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500

@login_required
@aoi_bp.route('/v1/model/<int:model_id>/aoi', methods=['POST'])
def post(model_id):
    try:
        payload = request.get_json()

        payload['model_id'] = model_id;
        aoi = AOIService.create(payload)

        return aoi, 200
    except Exception as e:
        error_msg = f'AOI Post: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, "Failed to save aoi source to DB"), 500

