from flask import Blueprint
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.user_service import UserService
from flask_login import login_required
from ml_enabler.api.auth import has_admin
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
    parameters:
        - name: filter
          in: query
          schema:
            type: string
            default: ''
          description: Username/Email fragment to filter by
        - name: limit
          in: query
          schema:
            type: integer
            default: 10
          description: Number of results to return
        - name: page
          in: query
          schema:
            type: integer
            default: 1
          description: If there are more results than the given limit, allow the user to page through them
    responses:
        200:
            description: User List
    """

    try:
        users = UserService.list(
            request.args.get('filter', ''),
            int(request.args.get('limit', 10)),
            int(request.args.get('page', 0)),
        )

        return users, 200
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500

@login_required
@has_admin
@user_bp.route('/v1/user', methods=['POST'])
def post():
    """
    Create a new user
    ---
    produces:
        - application/json
    responses:
        200:
            description: New User Created
    """
    try:
        user = request.get_json()
        return UserService.create(user)
    except Exception as e:
        error_msg = f'Unhandled error: {str(e)}'
        current_app.logger.error(error_msg)
        return err(500, error_msg), 500
