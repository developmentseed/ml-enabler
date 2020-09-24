from ml_enabler import db
from ml_enabler.models.utils import timestamp
from ml_enabler.models.dtos.ml_model_dto import TokenDTO
import random

class Token(db.Model):
    """ Store an api token for a given user """
    __tablename__ = 'users_tokens'

    id = db.Column(db.Integer, primary_key=True)

    uid = db.Column(
        db.BigInteger,
        db.ForeignKey('users.id', name='fk_uid'),
        nullable=False
    )

    name = db.Column(db.String, nullable=False)
    token = db.Column(db.String, nullable=False)
    created =  created = db.Column(db.DateTime, default=timestamp, nullable=False)

    def create(self, token: dict):
        """ Creates and saves the current token to the DB """

        self.uid = token.get("uid")
        self.name = token.get("name")
        self.token = '%030x' % random.randrange(16**60)

        db.session.add(self)
        db.session.commit()

        return self

    def as_dto(self):
        dto = TokenDTO()
        dto.uid = self.uid
        dto.name = self.name
        dto.created = self.created

        return dto

    def get(uid: int, token: str):
        query = db.session.query(
            Token.uid,
            Token.name,
            Token.created,
        ).filter(
            Token.token == token,
            Token.uid == uid
        )

        return Token.query.get(uid, token)

    def delete(self):
        """ Deletes the current model from the DB """
        db.session.delete(self)
        db.session.commit()

    def list(uid: int):
        query = db.session.query(
            Token.uid,
            Token.name,
            Token.created
        ).filter(Token.uid == uid)

        tokens = []
        for t in query.all():
            tokens.append({
                "uid": t[0],
                "name": t[1],
                "created": t[2]
            })

        return tokens
