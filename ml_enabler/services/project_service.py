from flask import current_app
from ml_enabler.models.ml_model import Project, ProjectAccess
from ml_enabler.models.dtos.dtos import ProjectDTO
from ml_enabler.models.utils import NotFound
from ml_enabler.utils import version_to_array
from sqlalchemy.orm.exc import NoResultFound


class ProjectServiceError(Exception):
    """ Custom Exception to notify callers an error occurred when validating an ML Model """

    def __init__(self, message):
        if current_app:
            current_app.logger.error(message)


class ProjectService():
    @staticmethod
    def subscribe_ml_model(ml_model_dto: ProjectDTO) -> int:
        """
        Subscribes an ML Model by saving it in the database
        :params ml_model_dto

        :raises DataError
        :returns ID of the ml model
        """

        new_ml_model = Projet()
        new_ml_model.create(ml_model_dto)
        current_app.logger.info(new_ml_model)
        return new_ml_model.id

    @staticmethod
    def delete_ml_model(model_id: int):
        """
        Deletes ML model and associated predictions
        :params model_id
        """
        ml_model = Projet.get(model_id)
        if ml_model:
            ml_model.delete()
        else:
            raise NotFound('Model does not exist')

    @staticmethod
    def get_ml_model_by_id(model_id: int):
        """
        Get an ML Model for a given ID
        :params model_id

        :raises NotFound
        :returns ML Model
        """

        ml_model = Project.get(model_id)
        users = ProjectAccess.list(model_id)

        if ml_model:
            model = ml_model.as_dto(users=users)
            return model
        else:
            raise NotFound('Model does not exist')

    @staticmethod
    def get_all(uid: int, model_filter: str, model_archived: bool):
        """
        Get all ML Models

        :raises NotFound
        :returns array of ML Models
        """

        ml_models = Project.get_all(uid, model_filter, model_archived)
        if (ml_models):
            model_collection = []
            for model in ml_models:
                model_collection.append(model.as_dto().to_primitive())
            return model_collection
        else:
            raise NotFound('No models exist')

    @staticmethod
    def update_ml_model(updated_ml_model_dto: ProjectDTO) -> int:
        """
        Update an existing ML Model
        :params model_id

        :raises NotFound
        :returns model_id
        """

        ml_model = Project.get(updated_ml_model_dto.model_id)

        if (ml_model):
            ml_model.update(updated_ml_model_dto)

            if updated_ml_model_dto.users:
                users = ProjectAccess.list(updated_ml_model_dto.model_id)
                ProjectAccess.list_update(updated_ml_model_dto.model_id, users, updated_ml_model_dto.users)

            return updated_ml_model_dto.model_id
        else:
            raise NotFound('Model does not exist')
