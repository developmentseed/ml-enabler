import os
import os.path as op
import json
import numpy as np
import pandas as pd
import shutil
import glob
import zipfile

from functools import partial

from absl import app, flags, logging

from tqdm import tqdm

import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.applications import ResNet50, Xception
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.estimator import model_to_estimator
from tensorflow.keras.optimizers import Adam, SGD, RMSprop

from utils_metrics import FBetaScore
from utils_readtfrecords import parse_and_augment_fn, parse_fn, get_dataset_feeder
from utils_loss import binary_focal_loss

from sklearn.metrics import precision_score, recall_score, fbeta_score

#File Manipulation

def zip_model_export(model_id, zip_dir='/ml/models'):
    logging.info("zipping model export")
    d = '/ml/models/' + model_id + '/export/' + model_id + '/*'
    dir_name = glob.glob(d)[0]
    logging.info(dir_name)
    shutil.make_archive(zip_dir, 'zip', dir_name)
    logging.info('written export as zip file')

def zip_chekpoint(model_id, zip_dir='/ml/checkpoint'):
    logging.info("zipping up best model checkpoint")
    d = '/ml/models/' + model_id + '/keras/'
    shutil.make_archive(zip_dir, 'zip', d)
    logging.info('written checkpoint as zip file')


# Modeling Functions
def model_estimator(params, model_dir, run_config, retraining_weights, model_id):
    """Get a model as a tf.estimator object"""

    # Get the original resnet model pre-initialized weights
    base_model = Xception(weights='imagenet',
                          include_top=False,  # Peel off top layer
                          pooling='avg',
                          input_shape=params['input_shape'])
    # Get final layer of base Resnet50 model
    x = base_model.output
    # Add a fully-connected layer
    x = Dense(params['dense_size_a'],
              activation=params['dense_activation'],
              name='dense')(x)
    # Add (optional) dropout and output layer
    x = Dropout(rate=params['dense_dropout_rate_a'])(x)
    x = Dense(params['dense_size'],
              activation=params['dense_activation'],
              name='dense_preoutput')(x)
    x = Dropout(rate=params['dense_dropout_rate'])(x)
    output = Dense(params['n_classes'], name='output', activation='sigmoid')(x)

    model = Model(inputs=base_model.input, outputs=output)

    # Get (potentially decaying) learning rate
    optimizer = get_optimizer(params['optimizer'], params['learning_rate'])
    loss = get_loss(params['loss'])
    model.compile(optimizer=optimizer,
                  loss=loss, metrics=params['metrics'])

    if retraining_weights:
        print('in retraining weights')
        if os.path.isdir('/tmp/checkpoint/keras'): # for user initial round of user uploading
            retraining_weights_ckpt = '/tmp/checkpoint/keras/'  + 'keras_model.ckpt'
        else:
            # for subsequent re-training uploading
            retraining_weights_ckpt = '/tmp/checkpoint/'  + 'keras_model.ckpt'
        print(retraining_weights_ckpt)
        model.load_weights(retraining_weights_ckpt)

    model_id = model_id

    # Return estimator
    m_e = model_to_estimator(keras_model=model, model_dir=model_dir + model_id,
                             config=run_config)
    return m_e


def get_optimizer(opt_name, lr, momentum=0.9):
    """Helper to get optimizer from text params"""
    if opt_name == 'adam':
        return Adam(learning_rate=lr)
    if opt_name == 'sgd':
        return SGD(learning_rate=lr)
    if opt_name == 'rmsprop':
        return RMSprop(learning_rate=lr, momentum=momentum)
    raise ValueError('`opt_name`: {} not understood.'.format(opt_name))

def get_loss(name):
    if name == 'binary_crossentropy':
        return tf.keras.losses.BinaryCrossentropy()
    if name == 'focal_loss':
       return binary_focal_loss
    raise ValueError('`loss name`: {} not understood.'.format(name))