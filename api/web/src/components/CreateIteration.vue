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
                    <label>Imagery Source:</label>
                    <div class='border border--gray-light round'>
                        <template v-if='loading.imagery'>
                            <Loading desc='Loading Imagery'/>
                        </template>
                        <template v-else-if='imagery.length === 0'>
                            <div class='flex flex--center-main pt36'>
                                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                            </div>

                            <div class='flex flex--center-main pt12 pb36'>
                                <h1 class='flex-child txt-h4 cursor-default'>An Imagery Source Must Be Created</h1>
                            </div>
                            <div class='flex flex--center-main pt12 pb36'>
                                <button @click='$router.push({ path: `/project/${$route.params.projectid}/imagery` })' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Create Imagery</button>
                            </div>
                        </template>
                        <template v-else>
                            <div @click='iter.imagery_id = img.id' :key='img.id' v-for='img in imagery' class='col col--12 cursor-pointer bg-darken10-on-hover'>
                                <div class='w-full py6 px6' :class='{
                                    "bg-gray-light": iter.imagery_id === img.id
                                }'>
                                    <span class='txt-h4 round' v-text='img.name'/>
                                    <div v-text='img.fmt' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue px6 py3 round txt-xs txt-bold'></div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <div v-if='isWMS' class='col col--12 py12'>
                    <label><span v-text='type'/> Zoom Level</label>
                    <label class='switch-container px6 fr'>
                        <span class='mr6'>Supertile</span>
                        <input v-model='iter.inf_supertile' type='checkbox' />
                        <div class='switch'></div>
                    </label>
                    <input type='number' v-model='iter.tile_zoom' class='input' placeholder='18'/>
                </div>

                <div class='col col--12 py12'>
                    <button @click='postIteration' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add <span v-text='type'/></button>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
import Loading from './util/Loading.vue';
import InfType from './util/InfType.vue';
import InfList from './util/InfList.vue';
import InfVersion from './util/InfVersion.vue';
import InfModel from './util/InfModel.vue';

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
    mounted: function() {
        this.refresh();
    },
    computed: {
        isWMS: function() {
            if (!this.iter.imagery_id) return false;

            for (const img of this.imagery) {
                if (img.id === this.iter.imagery_id && img.fmt === 'wms') {
                    return true;
                }
            }

            return false;
        }
    },
    watch: {
        'iter.inf_list': function() {
            if (this.iter.inf_list.split(",").length !== 2) {
                this.iter.inf_binary = false;
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
                const imagery = await window.std(window.api + `/api/project/${this.$route.params.projectid}/imagery`);

                this.imagery = imagery.imagery;

                if (imagery.total === 1) {
                    this.iter.imagery_id = this.imagery[0].id;
                }
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.imagery = false;
        },
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
        Loading,
        InfType,
        InfList,
        InfVersion,
        InfModel
    }
}
</script>
