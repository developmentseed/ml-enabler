<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>Create <span v-text='type'/></h2>

            <button @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <div class='grid grid--gut12'>
                <div class='col col--6 py6'>
                    <label><span v-text='type'/> Version</label>
                    <input v-model='prediction.version' class='input' placeholder='0.0.0'/>
                </div>

                <div class='col col--6 py6'>
                    <label><span v-text='type'/> Zoom Level</label>
                    <label class='switch-container px6 fr'>
                        <span class='mr6'>Supertile</span>
                        <input :disabled='prediction.infType == "detection"' v-model='prediction.infSupertile' type='checkbox' />
                        <div class='switch'></div>
                    </label>
                    <input v-model='prediction.tileZoom' class='input' placeholder='18'/>
                </div>
                <div class='col col--4'>
                    <label>Model Type:</label>
                    <div class='select-container'>
                        <select v-model='prediction.infType' class='select'>
                            <option value='classification'>Classification</option>
                            <option value='detection'>Object Detection</option>
                        </select>
                        <div class='select-arrow'></div>
                    </div>
                </div>

                <template v-if='prediction.infType === "classification"'>
                    <div class='col col--8'>
                        <label>Inferences List:</label>
                        <label class='switch-container px6 fr'>
                            <span class='mr6'>Binary Inference</span>
                            <input :disabled='prediction.infList.split(",").length !== 2' v-model='prediction.infBinary' type='checkbox' />
                            <div class='switch'></div>
                        </label>
                        <input v-model='prediction.infList' type='text' class='input' placeholder='buildings,schools,roads,...'/>
                    </div>
                    <div class='col col--8'>
                    </div>
                </template>
                <div class='col col--8'></div>

                <div class='col col--12 pt6'>
                    <label>Imagery Source:</label>
                    <div class='border border--gray-light round'>
                        <template v-if='loading.imagery'>
                            <div class='flex-parent flex-parent--center-main w-full py24'>
                                <div class='flex-child loading py24'></div>
                            </div>
                        </template>
                        <template v-else>
                            <div @click='prediction.imagery_id = img.id' :key='img.id' v-for='img in imagery' class='col col--12 cursor-pointer bg-darken10-on-hover'>
                                <div class='w-full py6 px6' :class='{
                                    "bg-gray-light": prediction.imagery_id === img.id
                                }'>
                                    <span class='txt-h4 round' v-text='img.name'/>
                                    <div v-text='img.fmt' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue px6 py3 round txt-xs txt-bold'></div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class='col col--12 py12'>
                    <button @click='postPrediction' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add <span v-text='type'/></button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'CreatePrediction',
    data: function() {
        return {
            type: this.$route.name === 'createTraining' ? 'Training' : 'Prediction',
            loading: {
                imagery: true
            },
            imagery: [],
            prediction: {
                imagery_id: false,
                version: '',
                tileZoom: '18',
                infList: '',
                infType: 'classification',
                infBinary: false,
                infSupertile: false
            }
        };
    },
    mounted: function() {
        this.refresh();
    },
    watch: {
        'prediction.infList': function() {
            if (this.prediction.infList.split(",").length !== 2) {
                this.prediction.infBinary = false;
            }
        }
    },
    methods: {
        refresh: function() {
            this.getImagery();
        },
        getImagery: async function() {
            this.loading.imagery = true;

            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/imagery`, {
                    method: 'GET'
                });

                const body = await res.json();

                if (!res.ok) throw new Error(body.message);
                this.imagery = body;

                this.loading.imagery = false;
                if (this.imagery.length === 1) {
                    this.params.image = this.imagery[0];
                }
            } catch (err) {
                this.$emit('err', err);
            }
        },
        postPrediction: async function() {
            if (!/^\d+\.\d+\.\d+$/.test(this.prediction.version)) {
                return this.$emit('err', new Error('Version must be valid semver'));
            } else if (this.prediction.infType === 'classification' && this.prediction.infList.trim().length === 0) {
                return this.$emit('err', new Error('Classification model must have inference list'));
            } else if (isNaN(parseInt(this.prediction.tileZoom))) {
                return this.$emit('err', new Error('Tile Zoom must be an integer'));
            }

            try {
                let res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/prediction`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        modelId: this.$route.params.modelid,
                        imagery_id: this.prediction.imagery_id,
                        hint: this.type.toLowerCase(),
                        version: this.prediction.version,
                        tileZoom: this.prediction.tileZoom,
                        infList: this.prediction.infList,
                        infType: this.prediction.infType,
                        infBinary: this.prediction.infBinary,
                        infSupertile: this.prediction.infSupertile
                    })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);

                this.$emit('refresh');
                this.$router.push({ path: `/model/${this.$route.params.modelid}/prediction/${body.prediction_id}` });
            } catch(err) {
                return this.$emit('err', err);
            }
        }
    }
}
</script>
