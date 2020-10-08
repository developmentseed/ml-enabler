from ml_enabler.models.ml_model import User
from ml_enabler import db
from ml_enabler.models.utils import NotFound
import boto3

class UserService():

    @staticmethod
    def list(user_filter: str):
        users = list(map(lambda user: { 'id': user.id, 'name': user.name }, User.list(user_filter)))

        return users

