from ml_enabler.models.token import Token
from ml_enabler import db

class TokenService():
    @staticmethod
    def create(payload: dict) -> int:
        """
        Validate and add a token to the database

        :params payload
        :returns token

        :raises DataError
        :returns ID of the prediction
        """

        return Token().create(payload)

    @staticmethod
    def delete(uid: int, token: str):
        """
        Delete an token

        :params token
        """

        token = token.get(uid, token)
        if (token):
            token.delete()
        else:
            raise NotFound('Token Not Found')

    @staticmethod
    def list(uid: int):
        """
        Fetch tokens for a given uidj
        :params uid

        :returns tokens
        """

        return Token.list(uid)

    @staticmethod
    def get(uid: int, token: str):
        """
        Fetch information about a given token
        :params token

        :raises NotFound
        :returns imagery
        """

        token = Token.get(uid, token).as_dto()

        if (token):
            return token.to_primitive()
        else:
            raise NotFound('Token Not Found')

