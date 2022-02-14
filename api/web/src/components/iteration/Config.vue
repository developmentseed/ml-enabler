<template>
    <div class='col col--12'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <IterationHeader
                :iteration='iteration'
            />
        </div>

        <h2 class='w-full align-center txt-h4 py12'><span v-text='iteration.hint.charAt(0).toUpperCase() + iteration.hint.slice(1)'/> Config</h2>

        <div class='grid grid--gut12'>
            <div class='col col--4 py6'>
                <InfVersion
                    :disabled='true'
                    :_version='iteration.version'
                />
            </div>

            <div class='col col--4 py6'>
                <InfModel
                    :_model='model_type'
                    :disabled='true'
                />
            </div>

            <div class='col col--4 py6'>
                <InfType
                    :_type='iteration.inf_type'
                    :disabled='true'
                />
            </div>

            <div v-if='iteration.inf_type !== "detection"' class='col col--12 pr12 my12'>
                <InfList
                    :_binary='iteration.inf_binary'
                    :_list='iteration.inf_list'
                    :disabled='true'
                />
            </div>

            <div class='col col--12 pt6'>
                <label>Imagery Source:</label>
                <div class='border border--gray-light round'>
                    <template v-if='loading.imagery'>
                        <Loading/>
                    </template>
                    <template v-else>
                        <div :key='img.id' v-for='img in imagery' class='col col--12 bg-darken10-on-hover'>
                            <div class='w-full py6 px6' :class='{
                                "bg-gray-light": iteration.imagery_id === img.id
                            }'>
                                <span class='txt-h4 round' v-text='img.name'/>
                                <div v-text='img.fmt' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue px6 py3 round txt-xs txt-bold'></div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>

            <div v-if='isWMS' class='col col--12 py12'>
                <label><span v-text='iteration.type'/> Zoom Level</label>
                <label class='switch-container px6 fr'>
                    <span class='mr6'>Supertile</span>
                    <input disabled v-model='inf_supertile' type='checkbox' />
                    <div class='switch'></div>
                </label>
                <input disabled :value='iteration.tile_zoom' class='input' placeholder='18'/>
            </div>
        </div>
    </div>
</template>

<script>
import IterationHeader from './IterationHeader.vue';
import Loading from './../util/Loading.vue';
import InfModel from './../util/InfModel.vue';
import InfVersion from './../util/InfVersion.vue';
import InfType from './../util/InfType.vue';
import InfList from './../util/InfList.vue';

export default {
    name: 'Config',
    props: ['meta', 'iteration', 'tilejson'],
    data: function() {
        return {
            loading: {
                imagery: true
            },
            model_type: 'tensorflow',
            inf_supertile: false,
            inf_binary: false,
            imagery: []
        }
    },
    mounted: function() {
        this.getImagery();

        this.model_type = this.iteration.model_type;
        this.inf_supertile = this.iteration.inf_supertile;
        this.inf_binary = this.iteration.inf_binary;
    },
    components: {
        Loading,
        InfModel,
        InfVersion,
        InfType,
        InfList,
        IterationHeader,
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
            if (!this.iteration.imagery_id) return false;

            for (const img of this.imagery) {
                if (img.id === this.iteration.imagery_id && img.fmt === 'wms') {
                    return true;
                }
            }

            return false;
        }
    },
}
</script>

