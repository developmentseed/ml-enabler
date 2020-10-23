from ml_enabler.models.ml_model import User

class UserService():

    @staticmethod
    def list(user_filter: str, limit: int, page: int):
        users = User.list(user_filter, limit, page)

        return users

