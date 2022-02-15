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
                <InfImagery
                    :_zoom='iteration.tile_zoom'
                    :_supertile='iteration.inf_supertile'
                    :_imagery='iteration.imagery_id'
                    :disabled='true'
                />
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
import InfImagery from './../util/InfImagery.vue';

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
        InfImagery,
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

