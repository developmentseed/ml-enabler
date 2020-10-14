from flask import Blueprint, session
from functools import wraps
from flask import g, request, redirect, url_for
from flask_login import current_user, login_required, logout_user, login_user
from flask_restful import request, current_app
from ml_enabler.models.ml_model import User, Project, ProjectAccess
from ml_enabler.models.token import Token
from ml_enabler import login_manager
import base64

auth_bp = Blueprint(
    'auth_bp', __name__
)

from functools import wraps
from flask import g, request, redirect, url_for

def has_project_read(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        model_id = kwargs.get('model_id')

        if current_user.is_authenticated and current_user.name == "machine":
            return f(*args, **kwargs)

        project = Project.get(model_id)
        if project.access == "public":
            return f(*args, **kwargs)

        for user in ProjectAccess.list(model_id):
            if current_user.is_authenticated and current_user.id == user.get('uid'):
                return f(*args, **kwargs)

        return {
            "status": 403,
            "error": "Authentication Insufficient"
        }, 403

    return decorated_function

def has_project_write(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        model_id = kwargs.get('model_id')

        if current_user.is_authenticated and current_user.name == "machine":
            return f(*args, **kwargs)

        for user in ProjectAccess.list(model_id):
            if current_user.is_authenticated and current_user.id == user.get('uid') and (user.get('access') == 'write' or user.get('access') == 'admin'):
                return f(*args, **kwargs)

        return {
            "status": 403,
            "error": "Authentication Insufficient"
        }, 403

    return decorated_function

def has_project_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        model_id = kwargs.get('model_id')

        if current_user.is_authenticated and current_user.name == "machine":
            return f(*args, **kwargs)

        for user in ProjectAccess.list(model_id):
            if current_user.is_authenticated and current_user.id == user.get('uid') and user.get('access') == 'admin':
                return f(*args, **kwargs)

        return {
            "status": 403,
            "error": "Authentication Insufficient"
        }, 403

    return decorated_function

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
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
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

