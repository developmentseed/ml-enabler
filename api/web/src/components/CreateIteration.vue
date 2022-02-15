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
                <div class='col col--4 py6'>
                    <InfVersion
                        @version='iter.version = $event'
                    />
                </div>

                <div class='col col--4 py6'>
                    <InfModel
                        @model='iter.model_type = $event'
                    />
                </div>

                <div class='col col--4 py6'>
                    <InfType
                        @type='iter.inf_type = $event'
                    />
                </div>

                <div v-if='iter.inf_type !== "detection"' class='col col--12'>
                    <InfList
                        @binary='iter.inf_binary = $event'
                        @list='iter.inf_list = $event'
                    />
                </div>

                <div class='col col--12 pt6'>
                    <InfImagery
                        @supertile='iter.inf_supertile = $event'
                        @zoom='iter.tile_zoom = $event'
                        @imagery='iter.imagery_id = $event'
                        @err='$emit("err", $event)'
                    />
                </div>

                <div class='col col--12 py12'>
                    <button @click='postIteration' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add <span v-text='type'/></button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import InfType from './util/InfType.vue';
import InfList from './util/InfList.vue';
import InfVersion from './util/InfVersion.vue';
import InfModel from './util/InfModel.vue';
import InfImagery from './util/InfImagery.vue';

export default {
    name: 'CreateIteration',
    data: function() {
        return {
            type: this.$route.name === 'createTraining' ? 'Training' : 'Iteration',
            loading: {
                imagery: true
            },
            imagery: [],
            iter: {
                imagery_id: false,
                version: '',
                tile_zoom: '18',
                inf_list: [],
                model_type: 'tensorflow',
                inf_type: 'classification',
                inf_binary: false,
                inf_supertile: false
            }
        };
    },
    watch: {
        'iter.inf_list': function() {
            if (this.iter.inf_list.split(",").length !== 2) {
                this.iter.inf_binary = false;
            }
        }
    },
    methods: {
        postIteration: async function() {
            if (!/^\d+\.\d+\.\d+$/.test(this.iter.version)) {
                return this.$emit('err', new Error('Version must be valid semver'));
            } else if (this.iter.inf_type === 'classification' && this.iter.inf_list.trim().length === 0) {
                return this.$emit('err', new Error('Classification model must have inference list'));
            } else if (isNaN(parseInt(this.iter.tile_zoom))) {
                return this.$emit('err', new Error('Tile Zoom must be an integer'));
            }

            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/iteration`, {
                    method: 'POST',
                    body: {
                        imagery_id: this.iter.imagery_id,
                        hint: this.type.toLowerCase(),
                        version: this.iter.version,
                        tile_zoom: parseInt(this.iter.tile_zoom),
                        inf_list: this.iter.inf_list,
                        inf_type: this.iter.inf_type,
                        inf_binary: this.iter.inf_binary,
                        inf_supertile: this.iter.inf_supertile,
                        model_type: this.iter.model_type
                    }
                });

                this.$emit('refresh');
                this.$router.push({ path: `/project/${this.$route.params.projectid}/iteration/${body.id}` });
            } catch(err) {
                return this.$emit('err', err);
            }
        }
    },
    components: {
        InfType,
        InfList,
        InfVersion,
        InfModel,
        InfImagery
    }
}
</script>
