from fastapi import FastAPI
from sqlalchemy import create_engine
import ml_enabler.config as CONFIG

db =  create_engine(
    CONFIG.EnvironmentConfig.SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False}
)

# import apis
from ml_enabler.api.ml import StatusCheckAPI, MLModelAPI, GetAllModels, \
    PredictionAPI, PredictionUploadAPI, PredictionTileAPI, MLModelTilesAPI, \
    MLModelTilesGeojsonAPI, GetAllPredictions, PredictionTileMVT, ImageryAPI, \
    PredictionStackAPI, PredictionInfAPI, MapboxAPI, MetaAPI, PredictionExport

# import models
from ml_enabler.models import * # noqa

app = FastAPI(app)

@app.get("/")
def get_status():
    StatusCheckAPI.get()

@app.get("/v1")
def get_meta():
    MetaAPI.get()

@app.get("/v1/mapbox")
def get_mapbox():
    MapboxAPI.get()

@app.get("/v1/model/all")
def get_models():
    GetAllModels.get()

@app.post("/v1/model")
def post_model():
    MLModelAPI.post()

@app.get("/v1/model/{model_id}")
def get_model():
    MLModelAPI.get()

@app.put("/v1/model/{model_id}")
def put_model():
    MLModelAPI.put()

@app.delete("/v1/model/{model_id}")
def delete_model():
    MLModelAPI.delete()

@app.get("/v1/model/{model_id}/tiles")
def get_model_tiles():
    MLModelTilesAPI.get()

@app.post("/v1/model/{model_id}/tiles/geojson")
def post_model_geojson():
    MLModelTilesGeojsonAPI.post()

@app.post("/v1/model/{model_id}/imagery")
def post_model_imagery():
    ImageryAPI.post()

@app.get("/v1/model/{model_id}/imagery")
def get_model_imagery():
    ImageryAPI.get()

@app.patch("/v1/model/{model_id}/imagery/{imagery_id}")
def patch_model_imagery():
    ImageryAPI.patch()

@app.delete("/v1/model/{model_id}/imagery/{imagery_id}")
def delete_model_imagery():
    ImageryAPI.delete()

@app.post("/v1/model/{model_id}/prediction")
def post_prediction():
    PredictionAPI.post()

@app.get("/v1/model/{model_id}/prediction")
def get_prediction():
    PredictionAPI.get()

@app.get("/v1/model/{model_id}/prediction/all")
def get_all_predictions():
    GetAllPredictions.get()

@app.patch("/v1/model/{model_id}/prediction/{prediction_id}")
def patch_prediction():
    PredictionAPI.patch()

@app.post("/v1/model/{model_id}/prediction/{prediction_id}/upload")
def post_prediction_upload():
    PredictionUploadAPI.post()

@app.get("/v1/model/{model_id}/prediction/{prediction_id}/stack")
def get_prediction_stack():
    PredictionStackAPI.get()

@app.post("/v1/model/{model_id}/prediction/{prediction_id}/stack")
def post_prediction_stack():
    PredictionStackAPI.post()

@app.delete("/v1/model/{model_id}/prediction/{prediction_id}/stack")
def delete_prediction_stack():
    PredictionStackAPI.delete()

@app.post("/v1/model/{model_id}/prediction/{prediction_id}/stack/tiles")
def post_prediction_inf():
    PredictionInfAPI.post()

@app.get("/v1/model/{model_id}/prediction/{prediction_id}/stack/tiles")
def get_prediction_inf():
    PredictionInfAPI.get()

@app.delete("/v1/model/{model_id}/prediction/{prediction_id}/stack/tiles")
def delete_prediction_inf():
    PredictionInfAPI.delete()

@app.get("/v1/model/{model_id}/prediction/{prediction_id}/export")
def get_prediction_export():
    PredictionExport.get()

@app.get("/v1/model/{model_id}/prediction/{prediction_id}/tiles")
def get_prediction_tilejson():
    PredictionTileAPI.get()

@app.get("/v1/model/{model_id}/prediction/{prediction_id}/tiles/{z}/{x}/{y}.mvt")
def get_prediction_tile():
    PredictionTileMVT.get()

@app.post("/v1/model/prediction/{prediction_id}/tiles")
def post_prediction_tile():
    PredictionTileAPI.post()

