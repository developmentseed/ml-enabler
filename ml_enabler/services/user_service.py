from ml_enabler.models.ml_model import User

class UserService():

    @staticmethod
    def list(user_filter: str):
        users = list(map(lambda user: {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'access': user.access
        }, User.list(user_filter)))

        return {
            'users': users
        }

