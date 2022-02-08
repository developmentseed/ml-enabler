<template>
    <div class='col col--12'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <IterationHeader
                :iteration='iteration'
            />
        </div>
        <template v-if='!iteration'>
            <Loading/>
        </template>
        <template v-else-if='meta.environment !== "aws"'>
            <div class='flex-parent flex-parent--center-main pt36'>
                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default align-center'>
                    Task creation can only occur when MLEnabler is running in an "aws" environment
                </h1>
            </div>
        </template>
        <template v-else-if='!create'>
            <Tasks
                @create='create = $event'
                :iteration='iteration'
            />
        </template>
        <template v-else-if='create === "retrain" && !iteration.tfrecord_link'>
            <button @click='create = false' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <div class='flex-parent flex-parent--center-main pt36'>
                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default align-center'>
                    A TFRecords file must be created before retraining occurs
                </h1>
            </div>
        </template>
        <template v-else-if='create === "retrain" && !iteration.model_link'>
            <button @click='create = false' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <div class='flex-parent flex-parent--center-main pt36'>
                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default align-center'>
                    A model must be uploaded before retraining occurs
                </h1>
            </div>
            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <button @click='$router.push({ name: "assets" })' class='flex-child btn btn--stroke round'>
                    Upload Model
                </button>
            </div>
        </template>
        <template v-else-if='create === "vectorize"'>
            <TaskVectorize @close='create = false'/>
        </template>
        <template v-else-if='!tilejson'>
            <button @click='create = false' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <div class='flex-parent flex-parent--center-main pt36'>
                <svg class='flex-child icon w60 h60 color-gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default'>No Inferences Uploaded</h1>
            </div>

            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <button @click='$router.push({ name: "stack" })' class='flex-child btn btn--stroke round'>
                    Create Inference Stack
                </button>
            </div>
        </template>
        <template v-else-if='create === "retrain" && !iteration.checkpoint_link'>
            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default align-center'>
                    Checkpoint Upload
                </h1>

                <button @click='create = false' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-close'/></svg>
                </button>
            </div>

            <UploadPrediction
                type='checkpoint'
                :iteration='iteration'
                v-on:close='$emit("refresh")'
            />
        </template>
        <template v-else-if='create === "retrain"'>
            <div class='col col--12'>
                <h2 class='w-full align-center txt-h4 py12'>New Model Retraining</h2>
                <button @click='create = false' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-close'/></svg>
                </button>

                <template v-if='!advanced'>
                    <div class='col col--12'>
                        <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-else>
                    <div class='col col--12 border-b border--gray-light mb12'>
                        <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-if='advanced'>
                    <!-- <div class='w-full align-center py12'>No Advanced Options Yet</div> -->
                    <form>
                     <input ref='fileInput' type='file' id='file' name='file' accept='*' @change='createImport($event)' />
                     </form>
                    <pre class='pre' v-text='config'></pre>

                </template>
                <div class='col col--12 clearfix py12'>
                    <button @click='createRetrain' class='fr btn btn--stroke color-gray color-green-on-hover round'>Retrain</button>
                </div>
            </div>
        </template>
        <template v-else-if='create === "tfrecords"'>
            <div class='col col--12'>
                <h2 class='w-full align-center txt-h4 py12'>TFRecord Creation</h2>

                <button @click='create = false' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-close'/></svg>
                </button>

                <template v-if='!advanced'>
                    <div class='col col--12'>
                        <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-else>
                    <div class='col col--12 border-b border--gray-light mb12'>
                        <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-if='advanced'>
                    <div class='w-full align-center py12'>No Advanced Options Yet</div>
                </template>
                <div class='col col--12 clearfix py12'>
                    <button @click='createTfrecords' class='fr btn btn--stroke color-gray color-green-on-hover round'>Generate TFRecords</button>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Tasks from './Tasks.vue';
import IterationHeader from './IterationHeader.vue';
import UploadPrediction from './UploadPrediction.vue';

import TaskVectorize from './tasks/Vectorize.vue';
import Loading from './../util/Loading.vue';

export default {
    name: 'PredTasks',
    props: ['meta', 'iteration', 'tilejson'],
    data: function() {
        return {
            advanced: false,
            create: false,
            looping: false,
            retrainparams: {
                image: false,
            },
            tfrecordsparams: {
                image: false,
            },
            loading: {
                retrain: true
            },
            config: '',
        }
    },
    components: {
        Tasks,
        TaskVectorize,
        UploadPrediction,
        IterationHeader
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: function() {
        },
        external: function(url) {
            if (!url) return;

            window.open(url, "_blank")
        },
        createVectorize: async function() {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task`, {
                    method: 'POST',
                    body: {
                        type: 'vectorize'
                    }
                });

                this.create = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        createRetrain: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/prediction/${this.$route.params.predid}/retrain`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(JSON.parse(this.config))
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message)
                this.create = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        createTfrecords: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/prediction/${this.$route.params.predid}/tfrecords`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message)
                this.create = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        createImport: function(event) {
            const file = event.target.files[0];
              const fr = new FileReader();

            fr.onload = e => {
                const result = JSON.parse(e.target.result);
                const formatted = JSON.stringify(result, null, 2);
                this.config = formatted;
            }
            fr.readAsText(file);
        }

    }
}
</script>
