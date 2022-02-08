""" convert an H5 Model to .PB"""
import tensorflow as tf

pre_model = tf.keras.models.load_model("final_model.h5")
pre_model.save("saved_model")
