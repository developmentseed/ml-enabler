<template>
    <div class='col col--12'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <PredictionHeader
                :prediction='prediction'
            />
        </div>

        <h2 class='w-full align-center txt-h4 py12'><span v-text='prediction.hint.charAt(0).toUpperCase() + prediction.hint.slice(1)'/> Config</h2>

        <div class='grid grid--gut12'>
            <div class='col col--8 py6'>
                <label><span v-text='prediction.type'/> Version</label>
                <input disabled :value='prediction.version' class='input' placeholder='0.0.0'/>
            </div>

            <div class='col col--4 py6'>
                <label>Model Type:</label>
                <div class='select-container'>
                    <select disabled :value='prediction.inf_type' class='select'>
                        <option value='classification'>Classification</option>
                        <option value='detection'>Object Detection</option>
                    </select>
                    <div class='select-arrow'></div>
                </div>
            </div>

            <template v-if='prediction.inf_type === "classification"'>
                <div class='col col--12 pr12 my12'>
                    <label>Inferences List:</label>
                    <label class='switch-container px6 fr'>
                        <span class='mr6'>Binary Inference</span>
                        <input disabled :value='prediction.inf_binary' type='checkbox' />
                        <div class='switch'></div>
                    </label>
                    <input disabled :value='prediction.inf_list' type='text' class='input' placeholder='buildings,schools,roads,...'/>
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
                        <div :key='img.id' v-for='img in imagery' class='col col--12 bg-darken10-on-hover'>
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

            <div v-if='isWMS' class='col col--12 py12'>
                <label><span v-text='prediction.type'/> Zoom Level</label>
                <label class='switch-container px6 fr'>
                    <span class='mr6'>Supertile</span>
                    <input disabled :value='prediction.inf_supertile' type='checkbox' />
                    <div class='switch'></div>
                </label>
                <input disabled :value='prediction.tile_zoom' class='input' placeholder='18'/>
            </div>
        </div>
    </div>
</template>

<script>
import PredictionHeader from './PredictionHeader.vue';

export default {
    name: 'Config',
    props: ['meta', 'prediction', 'tilejson'],
    data: function() {
        return {
            loading: {
                imagery: true
            },
            imagery: []
        }
    },
    mounted: function() {
        this.getImagery();
    },
    components: {
        PredictionHeader,
    },
    methods: {
        getImagery: async function() {
            this.loading.imagery = true;
            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/imagery`);
                this.imagery = body.imagery;
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading.imagery = false;
        }
    },
    computed: {
        isWMS: function() {
            if (!this.prediction.imagery_id) return false;

            for (const img of this.imagery) {
                if (img.id === this.prediction.imagery_id && img.fmt === 'wms') {
                    return true;
                }
            }

            return false;
        }
    },
}
</script>

