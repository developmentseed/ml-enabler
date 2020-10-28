import random
import string

from ml_enabler.models.ml_model import User
from ml_enabler.models.dtos.dtos import UserDTO


class UserService:
    @staticmethod
    def list(user_filter: str, limit: int, page: int):
        return User.list(user_filter, limit, page)

    @staticmethod
    def create(payload):
        if payload.get("password") is None:
            payload["password"] = UserService.random_password(16)

        dto = UserDTO(payload)
        dto.validate()

        user = User()
        user.create(dto)

        dto.id = user.id

        return dto.to_primitive()

    @staticmethod
    def random_password(length):
        letters = string.ascii_lowercase
        return "".join(random.choice(letters) for i in range(length))
