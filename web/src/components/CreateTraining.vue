<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>Create Training Data</h2>

            <button @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <div class='grid grid--gut12'>
                <div class='col col--6 py6'>
                    <label>Data Version</label>
                    <input v-model='prediction.version' class='input' placeholder='0.0.0'/>
                </div>

                <div class='col col--6 py6'>
                    <label>Data Zoom Level</label>
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
                <div class='col col--4'>
                    <label class='switch-container px6 fr'>
                        <span class='mr6'>Supertile</span>
                        <input :disabled='prediction.infType == "detection"' v-model='prediction.infSupertile' type='checkbox' />
                        <div class='switch'></div>
                    </label>
                </div>
                <div class='col col--8'></div>
                <div class='col col--12 py12'>
                    <button @click='postPrediction' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Next</button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'CreateTraining',
    data: function() {
        return {
            prediction: {
                version: '',
                tileZoom: '18',
                infList: '',
                infType: 'classification',
                infBinary: false,
                infSupertile: false
            }
        };
    },
    watch: {
        'prediction.infList': function() {
            if (this.prediction.infList.split(",").length !== 2) {
                this.prediction.infBinary = false;
            }
        }
    },
    methods: {
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
