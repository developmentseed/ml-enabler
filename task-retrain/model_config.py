class RetrainConfig():
    cycle_length=1
    n_map_threads=4
    shuffle_buffer_size=400
    prefetch_buffer_size=1
    tf_steps_per_summary=5
    tf_steps_per_checkpoint=10
    tf_batch_size=8
    tf_train_steps=200
    tf_dense_size_a=256
    tf_dense_dropout_rate_a=0.34
    tf_dense_size=128
    tf_dense_dropout_rate=.35
    tf_dense_activation='relu'
    tf_learning_rate=0.00001
    tf_optimizer='adam'


    #set from the database and are not user configuarable
    x_feature_shape=[-1, 256, 256, 3]
    n_classes=2

    # set in task.py not user configurable
    tf_dir='/ml/data'
    tf_model_dir = '/ml/models/'
    model_id ='b'
    retraining_weights=None
    n_train_samps=100
    n_val_samps=20


    def __init__(self, payload: dict):
        self.cycle_length = payload.get(cycle_length, 1)
        self.n_map_threads = payload.get(n_map_threads, 4)
        self.shuffle_buffer_size = payload.get(shuffle_buffer_size, 4)
        self.prefetch_buffer_size = payload.get(prefetch_buffer_size, 1)
        self.tf_steps_per_summary = payload.get(tf_steps_per_summary, 100)
        self.tf_steps_per_checkpoint = payload.get(tf_steps_per_checkpoint, 200)
        self.tf_batch_size = payload.get(tf_batch_size, 8)
        self.tf_train_steps = payload.get(tf_train_steps, 800)
        self.tf_dense_size_a = payload.get(tf_dense_size_a, 256)
        self.tf_dense_dropout_rate_a = payload.get(tf_dense_dropout_rate_a, 0.34)
        self.tf_dense_size = payload.get(tf_dense_size, 128)
        self.tf_dense_dropout_rate = payload.get(tf_dense_dropout_rate, 0.35)
        self.tf_dense_activation = payload.get(tf_dense_activation, 'relu')
        self.tf_learning_rate = payload.get(tf_learning_rate, 0.00001)
        self.tf_optimizer = payload.get(tf_optimizer, 'adam')


    def validate(self):

