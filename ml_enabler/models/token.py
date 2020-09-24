from ml_enabler import db
from ml_enabler.models.utils import timestamp
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
        self.name = imagery.get("name")
        self.token = '%030x' % random.randrange(16**60)

        db.session.add(self)
        db.session.commit()

        return self

    def as_dto(self):
        imagery_dto = ImageryDTO()
        imagery_dto.id = self.id
        imagery_dto.model_id = self.model_id
        imagery_dto.name = self.name
        imagery_dto.url = self.url
        imagery_dto.fmt = self.fmt

        return imagery_dto

    def get(token: str):
        query = db.session.query(
            Token.uid,
            Imagery.name,
            Imagery.created,
        ).filter(Token.token == token)

        return Token.query.get(token)

    def delete(self):
        """ Deletes the current model from the DB """
        db.session.delete(self)
        db.session.commit()

    def list(uid: int):
        query = db.session.query(
            Token.uid,
            Imagery.name,
            Imagery.created
        ).filter(Token.uid == uid)

        tokens = []
        for t in query.all():
            tokens.append({
                "uid": t[0],
                "name": t[1],
                "created": t[2]
            })

        return tokens
