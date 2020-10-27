from ml_enabler.models.token import Token
from ml_enabler.models.utils import NotFound


class TokenService:
    @staticmethod
    def create(payload: dict) -> int:
        """
        Validate and add a token to the database

        :params payload
        :returns token

        :raises DataError
        :returns ID of the prediction
        """
        return Token().create(payload).as_dto().to_primitive()

    @staticmethod
    def delete(uid: int, token_id: int):
        """
        Delete an token

        :params token
        """

        token = Token.get(uid, token_id)
        if token:
            token.delete()

            return {"status": "deleted"}
        else:
            raise NotFound("Token Not Found")

    @staticmethod
    def list(uid: int):
        """
        Fetch tokens for a given uidj
        :params uid

        :returns tokens
        """

        return Token.list(uid)

    @staticmethod
    def get(uid: int, token_id: int):
        """
        Fetch information about a given token
        :params token

        :raises NotFound
        :returns imagery
        """

        token = Token.get(uid, token_id).as_dto().to_primitive()

        if token:
            return token.to_primitive()
        else:
            raise NotFound("Token Not Found")
