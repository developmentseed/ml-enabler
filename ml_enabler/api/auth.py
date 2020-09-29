from flask import Blueprint, session
from flask_login import current_user, login_required, logout_user, login_user
from flask_restful import request, current_app
from ml_enabler.models.ml_model import User
from ml_enabler.models.token import Token
from ml_enabler import login_manager
import base64

auth_bp = Blueprint(
    'auth_bp', __name__
)

@auth_bp.route('/v1/user/login', methods=['POST'])
def login():
    """
    Authenticate a session cookie given username & password
    ---
    produces:
        - application/json
    responses:
        200:
            description: Authenticated Cookie
    """

    payload = request.get_json()
    username = payload['username']
    password = payload['password']

    if username is None or username == "":
        return {
            "status": 400,
            "error": "No username provided"
        }, 400
    elif password is None or password == "":
        return {
            "status": 400,
            "error": "No password provided"
        }, 400

    try:
        user = User.query.filter_by(name=username).first()

        if user is None or not user.password_check(password):
            return { "status": 401, "error": "Invalid username or password" }, 401

        login_user(user)
        return { "status": 200, "message": "Logged In" }, 200
    except Exception as e:
        print(e)
        return { "status": 500, "error": "Internal Server Error" }, 500


@auth_bp.route('/v1/user/self', methods=['GET'])
def meta():
    """
    Return user information about an authenticated session
    ---
    produces:
        - application/json
    responses:
        200:
            description: User Metadata
    """

    if current_user.is_anonymous:
        return { "status": 401, "error": "Not Authenticated" }, 401

    return {
        "name": current_user.name
    }, 200

@auth_bp.route('/v1/user/logout', methods=['GET'])
def logout():
    """
    Remove authentication from a given session cookie
    ---
    produces:
        - application/json
    responses:
        200:
            description: User Metadata
    """
    logout_user()

    return {
        "status": 200,
        "message": "Logged Out"
    }, 200

@login_manager.user_loader
def user_load(user_id):
    if user_id is not None:
        return User.query.get(user_id)
    return None

@login_manager.request_loader
def load_user(request):
    header_val = request.headers.get('Authorization')
    if header_val is None:
        tokenstr = request.args.get('token')
        if tokenstr is None:
            return None

        token = Token.query.filter_by(token=tokenstr).first()
        if token is None:
            return None

        user = User.query.filter_by(id=token.uid).first()

        return user
    else:
        header_val = header_val.replace('Basic ', '', 1)

        try:
            header_val = base64.b64decode(header_val).decode("utf-8")
        except TypeError:
            pass

        if len(header_val.split(':')) != 2:
            return None

        username = header_val.split(':')[0]
        password = header_val.split(':')[1]

        user = User.query.filter_by(name=username).first()

        if user is None or not user.password_check(password):
            return None

    return user

