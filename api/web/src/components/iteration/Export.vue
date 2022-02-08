<template>
    <div class='col col--12 relative'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <IterationHeader
                :iteration='iteration'
            />
        </div>

        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else-if='submissions.length'>
            <div class='col col--12 grid grid--gut12'>
                <div class='col col--6'>
                    <h2 class='txt-h4 py12'>Export Inferences</h2>
                </div>
                <div class='col col--6'>
                    <div class="flex-inline fr py12">
                        <button @click='mode = "download"' :class='{
                            "btn--stroke": mode !== "download"
                        }' class="btn btn--pill btn--pill-stroke btn--s btn--pill-hl round">Download</button>
                        <button @click='mode = "integrations"' :class='{
                            "btn--stroke": mode !== "integrations"
                        }' class="btn btn--pill btn--s btn--pill-hr btn--pill-stroke round">Integrations</button>
                    </div>
                </div>

                <template v-if='mode === "download"'>
                    <div class='col col--2'>
                        <label>Submission</label>
                        <div class='select-container w-full'>
                            <select v-model='params.submission' class='select'>
                                <option value='all'>All</option>
                                <option :key='s.id' v-for='s in submissions' :value='s.id'><span v-text='s.id'/></option>
                            </select>
                            <div class='select-arrow'></div>
                        </div>
                    </div>
                    <div class='col col--5'>
                        <label>Format</label>
                        <div class='select-container w-full'>
                            <select v-model='params.format' class='select'>
                                <option value='geojson'>GeoJSON</option>
                                <option value='geojsonld'>GeoJSON LD</option>
                                <option value='csv'>CSV</option>
                            </select>
                            <div class='select-arrow'></div>
                        </div>
                    </div>
                    <div class='col col--5'>
                        <label>Inferences</label>
                        <div class='select-container w-full'>
                            <select v-model='params.inferences' class='select'>
                                <option value='all'>All</option>
                                <option :key='inf' v-for='inf in iteration.inf_list.split(",")' :value='inf'><span v-text='inf'/></option>
                            </select>
                            <div class='select-arrow'></div>
                        </div>
                    </div>

                    <div class='col col--12'>
                        <button @click='folding.single = !folding.single' class='btn btn--white color-gray px0'>
                            <svg v-if='!folding.single' class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg>
                            <svg v-else class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg>

                            <span class='fl pl6'>Single Inference Options</span>
                        </button>
                    </div>

                    <template v-if='!folding.single'>
                        <div class='col col--8 py12'>
                            <label>Threshold (<span v-text='params.threshold'/>%)</label>
                            <div class='range range--s color-gray'>
                                <input :disabled='params.inferences === "all"' v-on:input='params.threshold = parseInt($event.target.value)' type='range' min=0 max=100 />
                            </div>
                        </div>

                        <div class='col col--4 py12'>
                            <label>Validation</label>

                            <div class='col col--12'>
                                <button :disabled='params.inferences === "all"' @click='params.validation.validated = !params.validation.validated' class='btn btn--s btn--gray round mr12' :class='{
                                    "btn--stroke": !params.validation.validated
                                }'>Validated</button>
                                <button :disabled='params.inferences === "all"' @click='params.validation.unvalidated = !params.validation.unvalidated' class='btn btn--gray btn--s round' :class='{
                                    "btn--stroke": !params.validation.unvalidated
                                }'>Unvalidated</button>
                            </div>
                        </div>
                    </template>

                    <div class='col col--12 clearfix py6'>
                        <button @click='getExport' class='fr btn btn--stroke color-gray color-green-on-hover round'>Export</button>
                    </div>
                </template>
                <template v-else-if='mode === "complete"'>
                    <div class='col col--12 py6'>
                        <div class='flex flex--center-main pt36'>
                            <svg class='flex-child icon w60 h60 color-gray'><use href='#icon-info'/></svg>
                        </div>

                        <div class='flex flex--center-main pt12 pb36'>
                            <h1 class='flex-child txt-h4 cursor-default'>Integration Successful</h1>
                        </div>
                    </div>
                </template>
                <template v-else-if='mode === "integrations"'>
                    <div class='w-full align-center py24'>Not Yet Implemented</div>
                </template>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 py6'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color-gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>No Inferences Uploaded</h1>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import IterationHeader from './IterationHeader.vue';
import Loading from './../util/Loading.vue';

export default {
    name: 'Export',
    props: ['meta', 'iteration'],
    data: function() {
        return {
            mode: 'download',
            loading: false,
            integration: false,
            folding: {
                single: true,
                integration: true
            },
            submissions: [],
            params: {
                format: 'geojson',
                inferences: 'all',
                threshold: 50,
                submission: 'all',
                validation: {
                    validated: true,
                    unvalidated: true
                }
            }
        };
    },
    mounted: async function() {
        await this.getSubmissions();
    },
    watch: {
        'params.inferences': function() {
            this.folding.single = this.params.inferences === 'all';
        },
    },
    methods: {
        getExport: function() {
            const url = new URL(`${window.api}/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/export`);

            url.searchParams.set('format', this.params.format);
            url.searchParams.set('inferences', this.params.inferences);
            url.searchParams.set('token', localStorage.token);

            if (this.params.submission !== 'all') {
                url.searchParams.set('submission', this.params.submission);
            }

            if (this.params.inferences !== 'all') {
                url.searchParams.set('threshold', this.params.threshold / 100);

                if (this.params.validation.validated && !this.params.validation.unvalidated) {
                    url.searchParams.set('validity', 'validated');
                } else if (!this.params.validation.validated && this.params.validation.unvalidated) {
                    url.searchParams.set('validity', 'unvalidated');
                } else {
                    url.searchParams.set('validity', 'both');
                }
            }

            this.external(url);
        },
        getSubmissions: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/submission`);
                this.submissions = res.submissions.filter((s) => {
                    return s.storage;
                });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        external: function(url) {
            if (!url) return;

            window.open(url, "_blank")
        },
    },
    components: {
        Loading,
        IterationHeader
    }
}
</script>
