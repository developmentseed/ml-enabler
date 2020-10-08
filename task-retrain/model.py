"""
Script specifying TF estimator object for training/serving
@author: DevelopmentSeed
"""
import os
import os.path as op
import json
import tensorflow as tf
import numpy as np
import pandas as pd
import tensorflow as tf
import zipfile

from functools import partial
from absl import app, logging
from tqdm import tqdm

from tensorflow.keras.models import Model
from tensorflow.keras.applications import ResNet50, Xception
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.estimator import model_to_estimator
from tensorflow.keras.optimizers import Adam, SGD, RMSprop

from sklearn.metrics import precision_score, recall_score, fbeta_score

from utils_metrics import FBetaScore, precision_m, recall_m, fbeta_m
from utils_readtfrecords import parse_and_augment_fn, parse_fn, get_dataset_feeder
from utils_loss import sigmoid_focal_crossentropy
from utils_train import zip_model_export, zip_chekpoint, model_estimator, get_optimizer



################
# Modeling Code
###############
def train(config: RetrainConfig):

    """
    Function to run TF Estimator
    Note: set the `TF_CONFIG` environment variable according to:
    https://www.tensorflow.org/api_docs/python/tf/estimator/train_and_evaluate
    """

    ###################################
    # Set parameters/config
    ###################################

    # Set logging info so it'll be written the command line
    logging.set_verbosity(logging.INFO)

    os.environ['TF_CONFIG'] = '{}'
    os.environ['_TF_CONFIG_ENV'] = '{}'

    # Set a bunch of TF config params
    tf_config = os.environ.get('TF_CONFIG', '{}')
    logging.info("TF_CONFIG %s", tf_config)
    tf_config_json = json.loads(tf_config)
    cluster = tf_config_json.get('cluster')
    job_name = tf_config_json.get('task', {}).get('type')
    task_index = tf_config_json.get('task', {}).get('index')
    logging.info("cluster=%s job_name=%s task_index=%s", cluster, job_name,
                task_index)

    is_chief = False
    if not job_name or job_name.lower() in ["chief", "master"]:
        is_chief = True
        logging.info("Will export model.")
    else:
        logging.info("Won't export model.")

    print('TF_CONFIG: {}'.format(os.environ['TF_CONFIG']))
    print('_TF_CONFIG_ENV: {}'.format(os.environ['_TF_CONFIG_ENV']))

    run_config = tf.estimator.RunConfig(model_dir=config.tf_model_dir + config.model_id,
                                    save_summary_steps=config.tf_steps_per_summary,
                                    save_checkpoints_steps=config.tf_steps_per_checkpoint,
                                    log_step_count_steps=config.tf_steps_per_summary)

    model_params = {"n_classes": config.n_classes,
                "input_shape": config.x_feature_shape[1:4],
                "train_steps": config.tf_train_steps,
                "dense_size_a": config.tf_dense_size_a,
                "dense_size": congig.tf_dense_size,
                "dense_activation": config.tf_dense_activation,
                "dense_dropout_rate_a": config.tf_dense_dropout_rate_a,
                "dense_dropout_rate": config.tf_dense_dropout_rate,
                "optimizer": config.tf_optimizer,
                "metrics": [tf.keras.metrics.Precision(), tf.keras.metrics.Recall(),
                            FBetaScore(num_classes=2, beta=2.0, average='weighted')],
                "learning_rate": config.tf_learning_rate,
                "loss": tf.keras.losses.BinaryCrossentropy(), # to-do figure out how to accomidate loss in config
                "class_names": config.class_names,
                "n_train_samps": config.n_train_samps,
                "n_val_samps": config.n_val_samps}


    classifier = model_estimator(model_params, config.tf_model_dir, run_config, config.retraining_weights, config.model_id)
    classifier = tf.estimator.add_metrics(classifier, fbeta_m)
    classifier = tf.estimator.add_metrics(classifier, precision_m)
    classifier = tf.estimator.add_metrics(classifier, recall_m)

    def resnet_serving_input_receiver_fn():
        """Convert b64 string encoded images into a tensor for production"""
        def decode_and_resize(image_str_tensor):
            """Decodes image string, resizes it and returns a uint8 tensor."""
            image = tf.image.decode_image(image_str_tensor,
                                            channels=3,
                                            dtype=tf.uint8)
            image = tf.reshape(image, [config.x_feature_shape[1], config.x_feature_shape[1], 3])
            return image
    # Run processing for batch prediction.
        input_ph = tf.compat.v1.placeholder(tf.string, shape=[None], name='image_binary')
        with tf.device("/cpu:0"):
            images_tensor = tf.map_fn(decode_and_resize, input_ph, back_prop=False, dtype=tf.uint8)
        # Cast to float
        images_tensor = tf.cast(images_tensor, dtype=tf.float32)
        # re-scale pixel values between 0 and 1
        images_tensor = tf.divide(images_tensor, 255)

        return tf.estimator.export.ServingInputReceiver(
            {'input_1': images_tensor},
            {'image_bytes': input_ph})

    ###############################
    # Create data feeder functions
    ##############################


    # Create training dataset function
    fpath_train = op.join(tf_dir, 'train*.tfrecords')
    print(fpath_train)
    map_func = partial(parse_and_augment_fn, n_chan=3,
                       n_classes=model_params['n_classes'],
                       shp=config.x_feature_shape[1:])

    dataset_train_fn = partial(get_dataset_feeder,
                               fpath=fpath_train,
                               data_map_func=map_func,
                               shuffle_buffer_size=config.shuffle_buffer_size,
                               repeat=True,
                               n_map_threads=config.n_map_threads,
                               batch_size=config.tf_batch_size,
                               cycle_length=config.cycle_length,
                               prefetch_buffer_size=config.prefetch_buffer_size)

    # Create validation dataset function
    fpath_validate = op.join(config.tf_dir, 'val*.tfrecords')
    print(fpath_validate)
    map_func = partial(parse_and_augment_fn, n_chan=3,
                       n_classes=model_params['n_classes'],
                       shp=config.x_feature_shape[1:])

    dataset_validate_fn = partial(get_dataset_feeder,
                                  fpath=fpath_validate,
                                  data_map_func=map_func,
                                  shuffle_buffer_size=config.shuffle_buffer_size,
                                  repeat=True,
                                  n_map_threads=config.n_map_threads,
                                  batch_size=config.tf_batch_size,
                                  cycle_length=config.cycle_length,
                                  prefetch_buffer_size=config.prefetch_buffer_size)
    ###################################
    # Run train/val w/ estimator object
    ###################################

    # Set up train and evaluation specifications
    train_spec = tf.estimator.TrainSpec(input_fn=dataset_train_fn,
                                        max_steps=config.tf_train_steps)

    logging.info("export final pre")
    export_final = tf.estimator.FinalExporter(config.model_id,
                                              serving_input_receiver_fn=resnet_serving_input_receiver_fn)
    logging.info("export final post")

    eval_spec = tf.estimator.EvalSpec(input_fn=config.dataset_validate_fn,
                                      steps=config.n_val_samps,  # Evaluate until complete
                                      exporters=export_final,
                                      throttle_secs=1,
                                      start_delay_secs=1)
    logging.info("eval spec")

    ##############################
    # Run training, save if needed
    ##############################
    logging.info("train and evaluate")
    tf.estimator.train_and_evaluate(classifier, train_spec, eval_spec)
    logging.info("training done.")

    # Zip key exports
    zip_model_export(model_id=config.model_id, zip_dir='/ml/models')
    zip_chekpoint(model_id=config.model_id, zip_dir='/ml/checkpoint')