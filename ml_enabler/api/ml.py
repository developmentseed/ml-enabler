import ml_enabler.config as CONFIG
import io
import json
import csv
import geojson
import boto3
import traceback
import mercantile
from shapely.geometry import shape, box
from flask import make_response
from flask_restful import Resource, request, current_app
from flask import Response
from schematics.exceptions import DataError
from ml_enabler.services.project_service import ProjectService
from ml_enabler.services.prediction_service import (
    PredictionService,
    PredictionTileService,
)
from ml_enabler.services.task_service import TaskService
from ml_enabler.services.imagery_service import ImageryService
from ml_enabler.utils import err
from ml_enabler.models.utils import NotFound, VersionExists, PredictionsNotFound
from ml_enabler.utils import InvalidGeojson, NoValid
from ml_enabler.api.auth import has_project_read, has_project_write
from flask_login import login_required
import numpy as np
import pandas as pd
import geopandas as gpd
import requests

import logging
from flask import Flask

app = Flask(__name__)
gunicorn_logger = logging.getLogger("gunicorn.error")
app.logger.handlers = gunicorn_logger.handlers
app.logger.setLevel(gunicorn_logger.level)

class MapboxAPI(Resource):
    @login_required
    def get(self):
        return {"token": CONFIG.EnvironmentConfig.MAPBOX_TOKEN}, 200


class PredictionImport(Resource):
    @login_required
    @has_project_write
    def post(self, project_id, prediction_id):
        """
        Import a file of GeoJSON inferences into the prediction

        Typically used to seed TFRecord creation preceding model creation
        ---
        produces:
            - application/json
        responses:
            200:
                description: ID of the prediction
            400:
                description: Invalid Request
            500:
                description: Internal Server Error
        """

        files = list(request.files.keys())
        if len(files) == 0:
            return err(400, "File not found in request"), 400

        inferences = request.files[files[0]]

        try:
            pred = PredictionService.get_prediction_by_id(prediction_id)

            infstream = io.BytesIO()
            inferences.save(infstream)
            inferences = infstream.getvalue().decode("UTF-8").split("\n")

            data = []
            for inf in inferences:
                if len(inf) == 0:
                    continue

                data.append(geojson.loads(inf))

            PredictionTileService.create_geojson(pred, data)
        except InvalidGeojson as e:
            return err(400, str(e)), 400
        except PredictionsNotFound:
            return err(404, "Predictions not found"), 404
        except Exception as e:
            current_app.logger.error(traceback.format_exc())

            error_msg = f"Unhandled error: {str(e)}"
            return err(500, error_msg), 500


class PredictionExport(Resource):
    """ Export Prediction Inferences to common formats """

    @login_required
    @has_project_read
    def get(self, project_id, prediction_id):
        """
        Export Geospatial Predictions
        ---
        parameters:
            - name: project_id
              in: path
              schema:
                type: integer
                minimum: 0
              description: The ID of the Project

            - name: prediction_id
              in: path
              schema:
                type: integer
                minimum: 0
              description: The ID of the Project

            - name: format
              in: query
              schema:
                type: string
                default: geojson
                enum:
                  - geojson
                  - geojsonseq
                  - csv
              description: The format to provide records in

            - name: validity
              in: query
              schema:
                type: string
                default: validated,unvalidated
              description: Allow "validated", "unvalidated", or "both" when returning a single inference

            - name: inferences
              in: query
              schema:
                type: string
                default: all
              description: Return all inferences or only a single inference

            - name: threshold
              in: query
              schema:
                type: integer
                default: 0
                minimum: 0
                maximum: 1
              description: The confidence threshold to apply to exported inferences

        responses:
            200:
                description: Exported Data
        """
        req_format = request.args.get("format", "geojson")
        req_inferences = request.args.get("inferences", "all")
        req_threshold = request.args.get("threshold", "0")
        req_validity = request.args.get("validity", "both")

        if req_validity not in ["both", "validated", "unvalidated"]:
            return err(400, "validated param must be true or false"), 400
        if req_validity != "both" and req_inferences == "all":
            return (
                err(400, "validated param cannot be used with inferences=all param"),
                400,
            )

        req_threshold = float(req_threshold)

        stream = PredictionService.export(prediction_id)
        inferences = PredictionService.inferences(prediction_id)
        pred = PredictionService.get_prediction_by_id(prediction_id)
        hint = pred.hint
        z = pred.tile_zoom
        i_info = ImageryService.get(pred.imagery_id)
        c_list = ImageryService.get(pred.imagery_id)

        first = False

        if req_inferences != "all":
            inferences = [req_inferences]

        def generate_npz():
            nonlocal req_threshold
            nonlocal hint
            nonlocal z
            nonlocal i_info
            nonlocal c_list

            # get chip list csv as dataframe to match up chip-lst name + geometry with geometry in the predictions database

            labels_dict = {}
            for row in stream:
                if req_inferences != "all" and row[3].get(req_inferences) is None:
                    continue

                if (
                    req_validity == "unvalidated"
                    and row[4] is not None
                    and row[4].get(req_inferences) is not None
                ):
                    continue
                elif req_validity == "validated" and (
                    row[4] is None or row[4].get(req_inferences) is None
                ):
                    continue

                if (
                    req_inferences != "all"
                    and row[3].get(req_inferences) <= req_threshold
                ):
                    continue

                # set labels.npz key to be x-y-z tile either from quadkey or wkt geometry
                if i_info["fmt"] == "wms":
                    if row[1]:
                        t = "-".join(
                            [str(i) for i in mercantile.quadkey_to_tile(row[1])]
                        )
                    else:
                        s = shape(json.loads(row[2])).centroid
                        t = "-".join([str(i) for i in mercantile.tile(s.x, s.y, z)])
                if i_info["fmt"] == "list":
                    r = requests.get(c_list["url"])
                    df = pd.read_csv(io.StringIO(r.text))
                    df["c"] = df["bounds"].apply(
                        lambda x: box(*[float(n) for n in x.split(",")])
                    )
                    gdf = gpd.GeoDataFrame(df, crs="EPSG:4326", geometry=df["c"])
                    # get tile name that where chip-list geom and geom in prediction row match
                    gdf_2 = gpd.GeoDataFrame(
                        {"geometry": [shape(json.loads(row[2]))]}, crs="EPSG:4326"
                    )
                    # To-DO account for no overlap case
                    i = gpd.overlay(gdf, gdf_2, how="intersection")
                    tiles_intersection = i["name"].tolist()

                # convert raw predictions into 0 or 1 based on threshold
                raw_pred = []
                i_lst = pred.inf_list.split(",")
                for num, inference in enumerate(i_lst):
                    raw_pred.append(row[3][inference])
                if req_inferences == "all":
                    req_threshold = request.args.get("threshold", "0.5")
                    req_threshold = float(req_threshold)
                binary_pred_list = [
                    1 if score >= req_threshold else 0 for score in raw_pred
                ]

                # special case for training and not predictions
                if hint == "training":
                    if i_info["fmt"] == "list":
                        for chip_name in tiles_intersection:
                            labels_dict.update({chip_name: binary_pred_list})
                    else:
                        labels_dict.update({t: binary_pred_list})
                elif row[4]:
                    t = "-".join([str(i) for i in mercantile.quadkey_to_tile(row[1])])

                    # special case for binary
                    if pred.inf_binary and len(i_lst) != 2:
                        return err(400, "binary models must have two catagories"), 400
                    if len(i_lst) == 2 and pred.inf_binary:
                        if list(row[4].values())[
                            0
                        ]:  # validated and true, keep original
                            labels_dict.update({t: binary_pred_list})
                        else:
                            if binary_pred_list == [1, 0]:
                                binary_pred_list = [0, 1]
                            else:
                                binary_pred_list = [1, 0]
                            labels_dict.update({t: binary_pred_list})
                    else:
                        # for multi-label
                        for key in list(row[4].keys()):
                            i = i_lst.index(key)
                            if not row[4][key]:
                                if binary_pred_list[i] == 0:
                                    binary_pred_list[i] = 1
                                else:
                                    binary_pred_list[i] = 0
                            labels_dict.update({t: binary_pred_list})
            if not labels_dict:
                raise NoValid

            bytestream = io.BytesIO()
            np.savez(bytestream, **labels_dict)
            return bytestream.getvalue()

        def generate():
            nonlocal first
            if req_format == "geojson":
                yield '{ "type": "FeatureCollection", "features": ['
            elif req_format == "csv":
                output = io.StringIO()
                rowdata = ["ID", "QuadKey", "QuadKeyGeom"]
                rowdata.extend(inferences)
                csv.writer(output, quoting=csv.QUOTE_NONNUMERIC).writerow(rowdata)
                yield output.getvalue()
            for row in stream:
                if req_inferences != "all" and row[3].get(req_inferences) is None:
                    continue

                if (
                    req_validity == "unvalidated"
                    and row[4] is not None
                    and row[4].get(req_inferences) is not None
                ):
                    continue
                elif req_validity == "validated" and (
                    row[4] is None or row[4].get(req_inferences) is None
                ):
                    continue

                if (
                    req_inferences != "all"
                    and row[3].get(req_inferences) <= req_threshold
                ):
                    continue

                if req_format == "geojson" or req_format == "geojsonld":
                    properties_dict = {}
                    if row[4]:
                        properties_dict = row[3]
                        valid_dict = {}
                        valid_dict.update({"validity": row[4]})
                        properties_dict.update(valid_dict)
                    else:
                        properties_dict = row[3]
                    feat = {
                        "id": row[0],
                        "quadkey": row[1],
                        "type": "Feature",
                        "properties": properties_dict,
                        "geometry": json.loads(row[2]),
                    }
                    if req_format == "geojsonld":
                        yield json.dumps(feat) + "\n"
                    elif req_format == "geojson":
                        if first is False:
                            first = True
                            yield "\n" + json.dumps(feat)
                        else:
                            yield ",\n" + json.dumps(feat)
                elif req_format == "csv":
                    output = io.StringIO()
                    rowdata = [row[0], row[1], row[2]]
                    for inf in inferences:
                        rowdata.append(row[3].get(inf, 0.0))
                    csv.writer(output, quoting=csv.QUOTE_NONNUMERIC).writerow(rowdata)
                    yield output.getvalue()
                else:
                    return (
                        err(
                            501,
                            "not a valid export type, valid export types are: geojson, csv, and npz",
                        ),
                        501,
                    )

            if req_format == "geojson":
                yield "]}"

        if req_format == "csv":
            mime = "text/csv"
        elif req_format == "geojson":
            mime = "application/geo+json"
        elif req_format == "geojsonld":
            mime = "application/geo+json-seq"
        elif req_format == "npz":
            mime = "application/npz"
        if req_format == "npz":
            try:
                return Response(
                    response=generate_npz(),
                    mimetype=mime,
                    status=200,
                    headers={
                        "Content-Disposition": 'attachment; filename="export.'
                        + req_format
                        + '"'
                    },
                )
            except NoValid:
                return (
                    err(
                        400,
                        "Can only return npz if predictions are validated. Currently there are no valid predictions",
                    ),
                    400,
                )
        else:
            return Response(
                generate(),
                mimetype=mime,
                status=200,
                headers={
                    "Content-Disposition": 'attachment; filename="export.'
                    + req_format
                    + '"'
                },
            )


class PredictionInfAPI(Resource):
    """ Add GeoJSON to SQS Inference Queue """

    @login_required
    @has_project_write
    def post(self, project_id, prediction_id):
        """
        Given a GeoJSON, xyz list, or tile list, submit it to the SQS queue
        ---
        produces:
            - application/json
        responses:
            200:
                description: Status Update
        """

        if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
            return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

        try:
            prediction = PredictionService.get_prediction_by_id(prediction_id)
            imagery = ImageryService.get(prediction.imagery_id)

            batch = boto3.client(
                service_name="batch",
                region_name="us-east-1",
                endpoint_url="https://batch.us-east-1.amazonaws.com",
            )

            task = {
                "fmt": imagery["fmt"]
            }

            if imagery["fmt"] == "wms":
                task["payload"] = json.loads(request.data)
                task['zoom'] = prediction.tile_zoom
                task['imagery'] = imagery['url']
            elif imagery["fmt"] == "list":
                task["url"] = imagery["url"]
            else:
                return err(400, "Unknown imagery type"), 400

            task["queue"] = "{stack}-models-{model}-prediction-{prediction}-queue".format(
                stack=CONFIG.EnvironmentConfig.STACK,
                model=project_id,
                prediction=prediction_id,
            )

            # Submit to AWS Batch to convert to ECR image
            job = batch.submit_job(
                jobName=CONFIG.EnvironmentConfig.STACK + "-pop",
                jobQueue=CONFIG.EnvironmentConfig.STACK + "-queue",
                jobDefinition=CONFIG.EnvironmentConfig.STACK + "-pop-job",
                containerOverrides={
                    "environment": [{
                        "name": "TASK",
                        "value": str(json.dumps(task))
                    }]
                }
            )

            TaskService.create({
                "pred_id": prediction_id,
                "type": "populate",
                "batch_id": job.get("jobId"),
            })

            return {}, 200

        except Exception as e:
            current_app.logger.error(traceback.format_exc())

            error_msg = f"Prediction Tiler Error: {str(e)}"
            return err(500, error_msg), 500


class PredictionTfrecords(Resource):
    @login_required
    @has_project_write
    def post(self, project_id, prediction_id):
        """
        Create a TFRecords file with validated predictions
        ---
        produces:
            - application/json
        """

        if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
            return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

        if CONFIG.EnvironmentConfig.ASSET_BUCKET is None:
            return err(501, "Not Configured"), 501

        pred = PredictionService.get_prediction_by_id(prediction_id)

        try:
            batch = boto3.client(
                service_name="batch",
                region_name="us-east-1",
                endpoint_url="https://batch.us-east-1.amazonaws.com",
            )

            # Submit to AWS Batch to convert to ECR image
            job = batch.submit_job(
                jobName=CONFIG.EnvironmentConfig.STACK + "-tfrecords",
                jobQueue=CONFIG.EnvironmentConfig.STACK + "-queue",
                jobDefinition=CONFIG.EnvironmentConfig.STACK + "-tfrecords-job",
                containerOverrides={
                    "environment": [
                        {"name": "MODEL_ID", "value": str(project_id)},
                        {"name": "PREDICTION_ID", "value": str(prediction_id)},
                        {"name": "TILE_ENDPOINT", "value": str(pred.imagery_id)},
                    ]
                },
            )

            TaskService.create(
                {
                    "pred_id": prediction_id,
                    "type": "tfrecords",
                    "batch_id": job.get("jobId"),
                }
            )
        except Exception:
            current_app.logger.error(traceback.format_exc())

            return err(500, "Failed to start GPU Retrain"), 500


class PredictionRetrain(Resource):
    @login_required
    @has_project_write
    def post(self, project_id, prediction_id):
        """
        Retrain a model with validated predictions
        ---
        produces:
            - application/json
        """

        if CONFIG.EnvironmentConfig.ENVIRONMENT != "aws":
            return err(501, "stack must be in 'aws' mode to use this endpoint"), 501

        if CONFIG.EnvironmentConfig.ASSET_BUCKET is None:
            return err(501, "Not Configured"), 501

        payload = request.get_json()

        pred = PredictionService.get_prediction_by_id(prediction_id)

        try:
            batch = boto3.client(
                service_name="batch",
                region_name="us-east-1",
                endpoint_url="https://batch.us-east-1.amazonaws.com",
            )

            # Submit to AWS Batch to convert to ECR image
            job = batch.submit_job(
                jobName=CONFIG.EnvironmentConfig.STACK + "-retrain",
                jobQueue=CONFIG.EnvironmentConfig.STACK + "-gpu-queue",
                jobDefinition=CONFIG.EnvironmentConfig.STACK + "-retrain-job",
                containerOverrides={
                    "environment": [
                        {"name": "MODEL_ID", "value": str(project_id)},
                        {"name": "PREDICTION_ID", "value": str(prediction_id)},
                        {"name": "TILE_ENDPOINT", "value": str(pred.imagery_id)},
                        {"name": "CONFIG_RETRAIN", "value": str(json.dumps(payload))},
                    ]
                },
            )

            TaskService.create(
                {
                    "pred_id": prediction_id,
                    "type": "retrain",
                    "batch_id": job.get("jobId"),
                }
            )
        except Exception:
            current_app.logger.error(traceback.format_exc())

            return err(500, "Failed to start GPU Retrain"), 500


class PredictionValidity(Resource):
    @login_required
    @has_project_write
    def post(self, project_id, prediction_id):
        try:
            payload = request.get_json()

            inferences = PredictionService.inferences(prediction_id)

            if payload.get("id") is None or payload.get("validity") is None:
                return err(400, "id and validity keys must be present"), 400

            tile = PredictionTileService.get(payload["id"])
            if tile is None:
                return err(404, "prediction tile not found"), 404

            current = tile.validity
            if current is None:
                current = {}

            for inf in inferences:
                p = payload["validity"].get(inf)

                if p is None or type(p) is not bool:
                    continue

                current[inf] = p

            PredictionTileService.validity(payload["id"], current)

            return current, 200
        except Exception as e:
            current_app.logger.error(traceback.format_exc())

            error_msg = f"Unhandled error: {str(e)}"
            return (500, error_msg), 500


class PredictionTileMVT(Resource):
    """
    Methods to retrieve vector tiles
    """

    @login_required
    @has_project_read
    def get(self, project_id, prediction_id, z, x, y):
        """
        Mapbox Vector Tile Response
        ---
        produces:
            - application/x-protobuf
        parameters:
            - in: path
              name: project_id
              description: ID of the Model
              required: true
              type: integer
            - in: path
              name: prediction_id
              description: ID of the Prediction
              required: true
              type: integer
            - in: path
              name: z
              description: zoom of the tile to fetch
              required: true
              type: integer
            - in: path
              name: y
              description: y coord of the tile to fetch
              required: true
              type: integer
            - in: path
              name: x
              description: x coord of the tile to fetch
              required: true
              type: integer
        responses:
            200:
                description: ID of the prediction
            400:
                description: Invalid Request
            500:
                description: Internal Server Error
        """

        try:
            tile = PredictionTileService.mvt(project_id, prediction_id, z, x, y)

            response = make_response(tile)
            response.headers["content-type"] = "application/x-protobuf"

            return response
        except PredictionsNotFound:
            return err(404, "Prediction tile not found"), 404
        except Exception as e:
            current_app.logger.error(traceback.format_exc())

            error_msg = f"Unhandled error: {str(e)}"
            return err(500, error_msg), 500


class PredictionTileAPI(Resource):
    """
    Methods to manage tile predictions
    """

    @login_required
    @has_project_read
    def get(self, project_id, prediction_id):
        """
        TileJSON response for the predictions
        ---
        produces:
            - application/json
        parameters:
            - in: path
              name: project_id
              description: ID of the Model
              required: true
              type: integer
            - in: path
              name: prediction_id
              description: ID of the Prediction
              required: true
              type: integer
        responses:
            200:
                description: ID of the prediction
            400:
                description: Invalid Request
            500:
                description: Internal Server Error
        """

        try:
            return PredictionTileService.tilejson(project_id, prediction_id)
        except PredictionsNotFound:
            return err(404, "Prediction TileJSON not found"), 404
        except Exception as e:
            current_app.logger.error(traceback.format_exc())

            error_msg = f"Unhandled error: {str(e)}"
            return err(500, error_msg), 500

    @login_required
    @has_project_write
    def post(self, prediction_id):
        """
        Submit tile level predictions
        ---
        produces:
            - application/json
        parameters:
            - in: body
              name: body
              required: true
              type: string
              description: JSON object of predictions
              schema:
                properties:
                    predictionId:
                        type: integer
                        description: Prediction ID
                        required: true
                    predictions:
                        type: array
                        items:
                            type: object
                            schema:
                                properties:
                                    quadkey:
                                        type: string
                                        description: quadkey of the tile
                                        required: true
                                    centroid:
                                        type: array
                                        items:
                                            type: float
                                        required: true
                                    predictions:
                                        type: object
                                        schema:
                                            properties:
                                                ml_prediction:
                                                    type: float
        responses:
            200:
                description: ID of the prediction
            400:
                description: Invalid Request
            500:
                description: Internal Server Error
        """
        try:
            data = request.get_json()
            if len(data["predictions"]) == 0:
                return err(400, "Error validating request"), 400

            PredictionTileService.create(data)

            return {"prediction_id": prediction_id}, 200
        except PredictionsNotFound:
            return err(404, "Prediction not found"), 404
        except Exception as e:
            current_app.logger.error(traceback.format_exc())

            error_msg = f"Unhandled error: {str(e)}"
            return err(500, error_msg), 500
