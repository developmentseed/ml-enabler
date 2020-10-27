from ml_enabler.models.aoi import AOI


class AOIService:
    """
    Intermediate class to faciltate web-ready responses from an SQLAlchemy model
    """

    @staticmethod
    def create(payload: dict) -> int:
        aoi = AOI()

        return aoi.create(payload).as_dto().to_primitive()

    @staticmethod
    def list(model_id: int, pred_id=None):
        rawaois = AOI.list(model_id, pred_id)

        aois = []
        if rawaois:
            for aoi in rawaois:
                aois.append(aoi.as_dto().to_primitive())

            return {"model_id": model_id, "pred_id": pred_id, "aois": aois}

        return {"model_id": model_id, "pred_id": pred_id, "aois": []}
