from ml_enabler import db
from ml_enabler.models.dtos.ml_model_dto import AOIDTO
from geoalchemy2 import Geometry
import shapely

class AOI(db.Model):
    __tablename__ = 'model_aoi'

    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(
        db.BigInteger,
        db.ForeignKey('ml_models.id', name='fk_models'),
        nullable=False
    )
    pred_id = db.Column(
        db.BigInteger,
        db.ForeignKey('predictions.id', name='fk_predictions'),
        nullable=False
    )

    bounds = db.Column(Geometry('POLYGON', srid=4326), nullable=False)

    def create(self, payload: dict):
        self.model_id = payload['model_id']
        self.pred_id = payload['pred_id']

        bounds = payload['bounds'].split(',')
        self.bounds = "SRID=4326;POLYGON(({0} {1},{0} {3},{2} {3},{2} {1},{0} {1}))".format(
            bounds[0],
            bounds[1],
            bounds[2],
            bounds[3]
        )

        db.session.add(self)
        db.session.commit()

        return self

    def list(model_id: int, pred_id: int):
        filters = [
            AOI.model_id == model_id
        ]

        if pred_id is not None:
            filters.append(AOI.pred_id == pred_id)

        return AOI.query.filter(*filters)

    def as_dto(self):
        dto = AOIDTO()
        dto.id = self.id
        dto.pred_id = self.pred_id
        dto.model_id = self.model_id

        dto.bounds = ','.join(map(str, shapely.wkb.loads(self.bounds.desc, hex=True).bounds))

        return dto
