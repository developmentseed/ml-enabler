from cerberus import Validator

class RetrainConfig():
    #set from the database and are not user configuarable
    x_feature_shape=[-1, 256, 256, 3]
    n_classes=2

    # set in task.py not user configurable
    tf_dir='/tmp/tfrecord/'
    tf_model_dir = '/ml/models/'
    model_id ='b'
    retraining_weights = '/tmp/checkpoint.zip'
    n_train_samps=100
    n_val_samps=20


    def __init__(self, payload: dict):
        self.cycle_length = payload.get('cycle_length', 1)
        self.n_map_threads = payload.get('n_map_threads', 4)
        self.shuffle_buffer_size = payload.get('shuffle_buffer_size', 4)
        self.prefetch_buffer_size = payload.get('prefetch_buffer_size', 1)
        self.tf_steps_per_summary = payload.get('tf_steps_per_summary', 100)
        self.tf_steps_per_checkpoint = payload.get('tf_steps_per_checkpoint', 200)
        self.tf_batch_size = payload.get('tf_batch_size', 8)
        self.tf_train_steps = payload.get('tf_train_steps', 800)
        self.tf_dense_size_a = payload.get('tf_dense_size_a', 256)
        self.tf_dense_dropout_rate_a = payload.get('tf_dense_dropout_rate_a', 0.34)
        self.tf_dense_size = payload.get('tf_dense_size', 128)
        self.tf_dense_dropout_rate = payload.get('tf_dense_dropout_rate', 0.35)
        self.tf_dense_activation = payload.get('tf_dense_activation', 'relu')
        self.tf_learning_rate = payload.get('tf_learning_rate', 0.00001)
        self.tf_optimizer = payload.get('tf_optimizer', 'adam')


    def validate(self, payload:dict):
        schema  = {
        'cylce_length' : {'type': 'integer'},
        'n_map_threads': {'type': 'integer'},
        'shuffle_buffer_size': {'type': 'integer'},
        'prefetch_buffer_size': {'type': 'integer'},
        'tf_steps_per_summary': {'type': 'integer'},
        'tf_batch_size': {'type': 'integer', 'max': 16},
        'tf_steps_per_summary': {'type': 'integer'},
        'tf_steps_per_checkpoint': {'type': 'integer'},
        'tf_dense_size_a' : {'type': 'integer'},
        'tf_dense_dropout_rate_a': {'type': 'float', 'min': 0.1, 'max': 0.5},
        'tf_dense_size': {'type': 'integer'},
        'tf_dense_dropout_rate': {'type': 'float',  'min': 0.1, 'max': 0.5},
        'tf_dense_activation': {'type': 'string'},
        'tf_learning_rate':  {'type': 'float', 'min': 0.00001, 'max': 0.001},
        'tf_optimizer': {'type': 'string', 'allowed': ['sdg', 'rsmprop', 'adam']}
        }
        v = Validator(schema)
        valid = v.validate(payload) #should be the user input geojson
        if not valid:
            raise Exception(v.errors)
        else:
            print('valid re-training config')

