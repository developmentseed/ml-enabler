""" convert an H5 Model to .PB"""
import tensorflow as tf
import sys

args = sys.argv[1:]

pre_model = tf.keras.models.load_model(args[0])
pre_model.save(args[1])
