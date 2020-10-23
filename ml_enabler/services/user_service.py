from ml_enabler.models.ml_model import User

class UserService():

    @staticmethod
    def list(user_filter: str):
        users = User.list(user_filter, 10, 1)

        return users

