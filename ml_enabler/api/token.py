from flask import Blueprint, session
from flask_restful import request, current_app
from ml_enabler.utils import err
from ml_enabler.services.imagery_service import ImageryService
from ml_enabler.models.utils import NotFound, ImageryNotFound
import ml_enabler.config as CONFIG
from flask_login import login_required
from flask import jsonify

token_bp = Blueprint(
    'token_bp', __name__
)

@login_required
@token_bp.route('/v1/user/token', methods=['GET'])
def list():
    print("endpoint")

@login_required
@token_bp.route('/v1/user/token', methods=['POST'])
def post():
    print("endpoint")

@login_required
@token_bp.route('/v1/user/token/<int:token_id>', methods=['GET'])
def get(token_id):
    print("endpoint")

@login_required
@token_bp.route('/v1/user/token/<int:token_id>', methods=['PATCH'])
def patch(token_id):
    print("endpoint")

@login_required
@token_bp.route('/v1/user/token/<int:token_id>', methods=['DELETE'])
def delete(token_id):
    print("endpoint")
