import mercantile
from sqlalchemy.ext.mutable import MutableDict, MutableList
from ml_enabler.models.utils import timestamp
from geoalchemy2 import Geometry
from sqlalchemy import or_, and_
from geoalchemy2.functions import ST_AsGeoJSON
from sqlalchemy.dialects import postgresql
from sqlalchemy.sql import func, text
from sqlalchemy.sql.expression import cast
import sqlalchemy
from flask_login import UserMixin
from ml_enabler.models.dtos.dtos import (
    ProjectDTO,
    PredictionDTO,
    ProjectAccessDTO,
    UserDTO,
)
from ml_enabler import db


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    name = db.Column(db.String)
    access = db.Column(db.String)

    def create(self, dto: UserDTO):
        self.name = dto.name
        self.email = dto.email
        self.access = dto.access
        self.password = dto.password

        results = db.session.execute(
            text(
                """
            INSERT INTO users (name, email, access, password) VALUES (
                :name,
                :email,
                :access,
                crypt(:password, gen_salt('bf', 10))
            ) RETURNING id
        """
            ),
            {
                "name": self.name,
                "email": self.email,
                "access": self.access,
                "password": self.password,
            },
        ).fetchall()

        db.session.commit()

        self.id = results[0][0]

        return self

    def list(user_filter: str, limit: int, page: int):
        """
        Get all users in the database
        """

        results = db.session.execute(
            text(
                """
            SELECT
                count(*) OVER() AS count,
                id,
                name,
                access,
                email
            FROM
                users
            WHERE
                name iLIKE '%'||:filter||'%'
                OR email iLIKE '%'||:filter||'%'
            ORDER BY
                id ASC
            LIMIT
                :limit
            OFFSET
                :page
        """
            ),
            {"limit": limit, "page": page * limit, "filter": user_filter},
        ).fetchall()

        return {
            "total": results[0][0] if len(results) > 0 else 0,
            "users": [
                {"id": u[1], "name": u[2], "access": u[3], "email": u[4]}
                for u in results
            ],
        }

        return results

    def password_check(self, test):
        results = db.session.execute(
            text(
                """
             SELECT
                password = crypt(:test, password)
            FROM
                users
            WHERE
                id = :uid
        """
            ),
            {"test": test, "uid": self.id},
        ).fetchall()

        return results[0][0]


class Prediction(db.Model):
    """ Predictions from a model at a given time """

    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=timestamp, nullable=False)

    # One of 'prediction' or 'training' - On the backend these are essentially the same
    # but on the frontend, a training hint will not prompt for model upload
    hint = db.Column(db.String, nullable=False)

    imagery_id = db.Column(db.BigInteger, nullable=True)

    model_id = db.Column(
        db.BigInteger, db.ForeignKey("projects.id", name="fk_models"), nullable=False
    )

    version = db.Column(db.String, nullable=False)

    docker_url = db.Column(db.String)
    tile_zoom = db.Column(db.Integer, nullable=False)

    log_link = db.Column(db.String)
    model_link = db.Column(db.String)
    docker_link = db.Column(db.String)
    save_link = db.Column(db.String)
    tfrecord_link = db.Column(db.String)
    checkpoint_link = db.Column(db.String)
    inf_list = db.Column(db.String)
    inf_type = db.Column(db.String)
    inf_binary = db.Column(db.Boolean)
    inf_supertile = db.Column(db.Boolean)

    def create(self, prediction_dto: PredictionDTO):
        """ Creates and saves the current model to the DB """

        self.imagery_id = prediction_dto.imagery_id
        self.model_id = prediction_dto.model_id
        self.hint = prediction_dto.hint
        self.version = prediction_dto.version
        self.docker_url = prediction_dto.docker_url
        self.tile_zoom = prediction_dto.tile_zoom
        self.inf_list = prediction_dto.inf_list
        self.inf_type = prediction_dto.inf_type
        self.inf_binary = prediction_dto.inf_binary
        self.inf_supertile = prediction_dto.inf_supertile

        db.session.add(self)
        db.session.commit()

    def link(self, update: dict):
        """ Update prediction to include asset links """

        if update.get("logLink") is not None:
            self.log_link = update["logLink"]
        if update.get("modelLink") is not None:
            self.model_link = update["modelLink"]
        if update.get("dockerLink") is not None:
            self.docker_link = update["dockerLink"]
        if update.get("saveLink") is not None:
            self.save_link = update["saveLink"]
        if update.get("tfrecordLink") is not None:
            self.tfrecord_link = update["tfrecordLink"]
        if update.get("checkpointLink") is not None:
            self.checkpoint_link = update["checkpointLink"]

        db.session.commit()

    def save(self):
        """ Save changes to db"""
        db.session.commit()

    def export(self):
        return (
            db.session.query(
                PredictionTile.id,
                PredictionTile.quadkey,
                ST_AsGeoJSON(PredictionTile.geom).label("geometry"),
                PredictionTile.predictions,
                PredictionTile.validity,
            )
            .filter(PredictionTile.prediction_id == self.id)
            .yield_per(100)
        )

    @staticmethod
    def get(prediction_id: int):
        """
        Get prediction with the given ID
        :param prediction_id
        :return prediction if found otherwise None
        """
        query = db.session.query(
            Prediction.id,
            Prediction.hint,
            Prediction.created,
            Prediction.docker_url,
            Prediction.model_id,
            Prediction.tile_zoom,
            Prediction.version,
            Prediction.log_link,
            Prediction.model_link,
            Prediction.docker_link,
            Prediction.save_link,
            Prediction.tfrecord_link,
            Prediction.checkpoint_link,
            Prediction.inf_list,
            Prediction.inf_type,
            Prediction.inf_binary,
            Prediction.inf_supertile,
            Prediction.imagery_id,
        ).filter(Prediction.id == prediction_id)

        return Prediction.query.get(prediction_id)

    @staticmethod
    def get_predictions_by_model(model_id: int):
        """
        Gets predictions for a specified ML Model
        :param model_id: ml model ID in scope
        :return predictions if found otherwise None
        """
        query = db.session.query(
            Prediction.id,
            Prediction.hint,
            Prediction.created,
            Prediction.docker_url,
            Prediction.model_id,
            Prediction.tile_zoom,
            Prediction.version,
            Prediction.log_link,
            Prediction.model_link,
            Prediction.docker_link,
            Prediction.save_link,
            Prediction.tfrecord_link,
            Prediction.checkpoint_link,
            Prediction.inf_list,
            Prediction.inf_type,
            Prediction.inf_binary,
            Prediction.inf_supertile,
            Prediction.imagery_id,
        ).filter(Prediction.model_id == model_id)

        return query.all()

    def delete(self):
        """ Deletes the current model from the DB """
        db.session.delete(self)
        db.session.commit()

    @staticmethod
    def as_dto(prediction):
        """ Static method to convert the prediction result as a schematic """

        prediction_dto = PredictionDTO()

        prediction_dto.prediction_id = prediction[0]
        prediction_dto.hint = prediction[1]
        prediction_dto.created = prediction[2]
        prediction_dto.docker_url = prediction[3]
        prediction_dto.model_id = prediction[4]
        prediction_dto.tile_zoom = prediction[5]
        prediction_dto.version = prediction[6]
        prediction_dto.log_link = prediction[7]
        prediction_dto.model_link = prediction[8]
        prediction_dto.docker_link = prediction[9]
        prediction_dto.save_link = prediction[10]
        prediction_dto.tfrecord_link = prediction[11]
        prediction_dto.checkpoint_link = prediction[12]
        prediction_dto.inf_list = prediction[13]
        prediction_dto.inf_type = prediction[14]
        prediction_dto.inf_binary = prediction[15]
        prediction_dto.inf_supertile = prediction[16]
        prediction_dto.imagery_id = prediction[17]

        return prediction_dto


class PredictionTile(db.Model):
    """ Store individual tile predictions """

    __tablename__ = "prediction_tiles"

    id = db.Column(db.Integer, primary_key=True)

    prediction_id = db.Column(
        db.BigInteger,
        db.ForeignKey("predictions.id", name="fk_predictions"),
        nullable=False,
    )

    quadkey = db.Column(db.String, nullable=True)
    geom = db.Column(Geometry("POLYGON", srid=4326), nullable=False)
    predictions = db.Column(postgresql.JSONB, nullable=False)
    validity = db.Column(MutableDict.as_mutable(postgresql.JSONB), nullable=True)

    prediction_tiles_quadkey_idx = db.Index(
        "prediction_tiles_quadkey_idx",
        "prediction_tiles.quadkey",
        postgresql_ops={"quadkey": "text_pattern_ops"},
    )

    @staticmethod
    def get(predictiontile_id: int):

        query = db.session.query(
            PredictionTile.id,
            PredictionTile.prediction_id,
            PredictionTile.validity,
        ).filter(PredictionTile.id == predictiontile_id)

        return PredictionTile.query.get(predictiontile_id)

    def update(self, validity):
        self.validity = validity

        db.session.commit()

    @staticmethod
    def inferences(prediction_id: int):
        results = db.session.execute(
            text(
                """
             SELECT
                DISTINCT jsonb_object_keys(predictions)
            FROM
                prediction_tiles
            WHERE
                prediction_id = :pred
        """
            ),
            {"pred": prediction_id},
        ).fetchall()

        inferences = []
        for res in results:
            inferences.append(res[0])

        return inferences

    @staticmethod
    def count(prediction_id: int):
        return (
            db.session.query(func.count(PredictionTile.geom).label("count"))
            .filter(PredictionTile.prediction_id == prediction_id)
            .one()
        )

    @staticmethod
    def bbox(prediction_id: int):
        result = db.session.execute(
            text(
                """
            SELECT
                ST_Extent(geom)
            FROM
                prediction_tiles
            WHERE
                prediction_id = :pred
        """
            ),
            {"pred": prediction_id},
        ).fetchone()

        bbox = []
        for corners in result[0].replace("BOX(", "").replace(")", "").split(" "):
            for corner in corners.split(","):
                bbox.append(float(corner))

        return bbox

    def mvt(prediction_id: int, z: int, x: int, y: int):
        grid = mercantile.xy_bounds(x, y, z)

        result = db.session.execute(
            text(
                """
            SELECT
                ST_AsMVT(q, 'data', 4096, 'geom', 'id') AS mvt
            FROM (
                SELECT
                    p.id AS id,
                    quadkey AS quadkey,
                    predictions || COALESCE(v.validity, '{}'::JSONB) AS props,
                    ST_AsMVTGeom(geom, ST_Transform(ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, 3857), 4326), 4096, 256, false) AS geom
                FROM
                    prediction_tiles AS p
                    LEFT JOIN (
                        SELECT
                            id,
                            JSONB_Object_Agg('v_'||key, value) AS validity
                        FROM
                            prediction_tiles,
                            jsonb_each(validity)
                        GROUP BY
                            id
                    ) AS v ON p.id = v.id
                WHERE
                    p.prediction_id = :pred
                    AND ST_Intersects(p.geom, ST_Transform(ST_MakeEnvelope(:minx, :miny, :maxx, :maxy, 3857), 4326))
            ) q
        """
            ),
            {
                "pred": prediction_id,
                "minx": grid[0],
                "miny": grid[1],
                "maxx": grid[2],
                "maxy": grid[3],
            },
        ).fetchone()

        return bytes(result.values()[0])

    @staticmethod
    def get_tiles_by_quadkey(prediction_id: int, quadkeys: tuple, zoom: int):
        return (
            db.session.query(
                func.substr(PredictionTile.quadkey, 1, zoom).label("qaudkey"),
                func.avg(
                    cast(
                        cast(
                            PredictionTile.predictions["ml_prediction"],
                            sqlalchemy.String,
                        ),
                        sqlalchemy.Float,
                    )
                ).label("ml_prediction"),
                func.avg(
                    cast(
                        cast(
                            PredictionTile.predictions["osm_building_area"],
                            sqlalchemy.String,
                        ),
                        sqlalchemy.Float,
                    )
                ).label("osm_building_area"),
            )
            .filter(PredictionTile.prediction_id == prediction_id)
            .filter(func.substr(PredictionTile.quadkey, 1, zoom).in_(quadkeys))
            .group_by(func.substr(PredictionTile.quadkey, 1, zoom))
            .all()
        )


class ProjectAccess(db.Model):
    __tablename__ = "projects_access"

    id = db.Column(db.Integer, primary_key=True)

    model_id = db.Column(
        db.BigInteger, db.ForeignKey("projects.id", name="fk_projects"), nullable=False
    )

    uid = db.Column(
        db.BigInteger, db.ForeignKey("users.id", name="fk_users"), nullable=False
    )

    access = db.Column(db.String, nullable=False)

    @staticmethod
    def get(access_id: int):
        """
        Gets specified ML Model
        :param access_id: access object to get
        :return ML Model if found otherwise None
        """
        return ProjectAccess.query.get(access_id)

    @staticmethod
    def get_uid(model_id: int, access_id: int):
        """
        Gets specified ML Model
        :param access_id: access object to get
        :return ML Model if found otherwise None
        """

        return ProjectAccess.query.filter(
            ProjectAccess.id == access_id, ProjectAccess.model_id == model_id
        ).one_or_none()

    @staticmethod
    def list_update(model_id: int, current_users: list, new_users: list):
        uids = []

        for user in new_users:
            user["model_id"] = model_id

        # Update all new users
        for user in new_users:
            uids.append(int(user.get("uid")))
            user["model_id"] = model_id

            access = ProjectAccess.get_uid(model_id, user.get("id"))

            if not access:
                access = ProjectAccess()
                access.create(user)
            else:
                access.update(user)

        for user in current_users:
            if user.get("uid") not in uids:
                access = ProjectAccess.get_uid(model_id, user.get("id"))
                access.delete()

    @staticmethod
    def list(model_id: int):
        query = db.session.query(
            ProjectAccess.id,
            ProjectAccess.uid,
            User.name,
            ProjectAccess.model_id,
            ProjectAccess.access,
        ).filter(ProjectAccess.model_id == model_id, User.id == ProjectAccess.uid)

        users = []
        for access in query.all():
            users.append(
                {
                    "id": access[0],
                    "uid": access[1],
                    "name": access[2],
                    "model_id": access[3],
                    "access": access[4],
                }
            )

        return users

    def create(self, dto: ProjectAccessDTO):
        """ Creates and saves the current project access dto to the DB """

        self.model_id = dto.get("model_id")
        self.uid = dto.get("uid")
        self.access = dto.get("access")

        db.session.add(self)
        db.session.commit()
        return self

    def update(self, dto: ProjectAccessDTO):
        """ Updates an project access """
        self.access = dto["access"]
        db.session.commit()

    def delete(self):
        """ Deletes the current project access from the DB """
        db.session.delete(self)
        db.session.commit()


class Project(db.Model):
    """ Describes an ML model registered with the service """

    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=timestamp, nullable=False)
    tags = db.Column(MutableList.as_mutable(postgresql.JSONB), nullable=False)
    name = db.Column(db.String, unique=True)
    source = db.Column(db.String)
    archived = db.Column(db.Boolean)
    project_url = db.Column(db.String)
    access = db.Column(db.String)
    notes = db.Column(db.String)
    predictions = db.relationship(
        Prediction, backref="projects", cascade="all, delete-orphan", lazy="dynamic"
    )

    def create(self, dto: ProjectDTO):
        """ Creates and saves the current model to the DB """

        self.name = dto.name
        self.source = dto.source
        self.archived = False
        self.tags = dto.tags
        self.access = dto.access
        self.project_url = dto.project_url
        self.notes = dto.notes

        db.session.add(self)
        db.session.commit()
        return self

    def save(self):
        """ Save changes to db"""
        db.session.commit()

    @staticmethod
    def get(model_id: int):
        """
        Gets specified ML Model
        :param model_id: ml model ID in scope
        :return ML Model if found otherwise None
        """
        return Project.query.get(model_id)

    @staticmethod
    def get_all(uid: int, model_filter: str, model_archived: bool):
        """
        Get all models in the database
        """
        return Project.query.filter(
            Project.name.ilike(model_filter + "%"),
            Project.archived == model_archived,
            or_(
                Project.access == "public",
                and_(ProjectAccess.uid == uid, ProjectAccess.model_id == Project.id),
            ),
        ).all()

    def delete(self):
        """ Deletes the current model from the DB """
        db.session.delete(self)
        db.session.commit()

    def as_dto(self, users=None):
        """
        Convert the model to it's dto
        """

        dto = ProjectDTO()
        dto.model_id = self.id
        dto.name = self.name
        dto.tags = self.tags
        dto.created = self.created
        dto.source = self.source
        dto.archived = self.archived
        dto.project_url = self.project_url
        dto.access = self.access
        dto.notes = self.notes
        if users is not None:
            dto.users = users

        return dto

    def update(self, dto: ProjectDTO):
        """ Updates an ML model """
        self.id = dto.model_id
        self.name = dto.name
        self.source = dto.source
        self.project_url = dto.project_url
        self.archived = dto.archived
        self.tags = dto.tags
        self.access = dto.access
        self.notes = dto.notes

        db.session.commit()
