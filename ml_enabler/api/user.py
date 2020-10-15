from flask import Blueprint
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.user_service import UserService
from flask_login import login_required
from flask import jsonify

user_bp = Blueprint(
    'user_bp', __name__
)


@login_required
@user_bp.route('/v1/user', methods=['GET'])
def list():
    """
    Return a list of users
    ---
    produces:
        - application/json
    responses:
        200:
            description: User List
    """

    try:
        users = UserService.list(request.args.get('filter', ''))
        return jsonify(users), 200
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500
