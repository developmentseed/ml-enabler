from ml_enabler.models.ml_model import User

class UserService():

    @staticmethod
    def list(user_filter: str, limit: int, page: int):
        return User.list(user_filter, limit, page)

    @staticmethod
    def create(user):
        user = User()
        return user.create(user)
