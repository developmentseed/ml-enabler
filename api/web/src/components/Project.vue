<template>
    <div class="col col--12">
        <template v-if='loading.project'>
            <div class='flex-parent flex-parent--center-main w-full py24'>
                <div class='flex-child loading py24'></div>
            </div>
        </template>
        <template v-else-if='$route.name === "project"'>
            <div class='col col--12 clearfix py6'>
                <h2 @click='$router.push({ name: "home" })' class='fl cursor-pointer txt-underline-on-hover'>Projects</h2>
                <h2 class='fl px6'>&gt;</h2>
                <h2 class='fl cursor-pointer txt-underline-on-hover' v-text='project.name'></h2>

                <button @click='$router.push({ name: "home" })' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-close'/></svg>
                </button>

                <button v-if='project.projectUrl' @click='external(project.projectUrl)' class='mr12 btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-link'/></svg>
                </button>

                <button @click='$router.push({ name: "editproject", params: { projectid: $route.params.projectid } })' class='mr12 btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-pencil'/></svg>
                </button>

                <button @click='refresh' class='btn fr round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>
            </div>

            <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
                <div class='col col--12 border-b border--gray-light clearfix'>
                    <button @click='folding.iterations = !folding.iterations' class='btn btn--white color-gray px0'>
                        <svg v-if='!folding.iterations' class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg>
                        <svg v-else class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg>

                        <span class='fl pl6'>Iterations</span>

                    </button>

                    <button v-if='!folding.iterations' class='dropdown btn fr h24 mr6 mb6 round btn--stroke color-gray color-green-on-hover'>
                        <svg class='icon fl'><use href='#icon-plus'/></svg>
                        <svg class='icon fl'><use href='#icon-chevron-down'/></svg>

                        <div class='round dropdown-content color-black' style='top: 24px;'>
                            <div @click='$router.push({ path: `/project/${$route.params.projectid}/prediction` })' class='round bg-gray-faint-on-hover'>Prediction</div>
                            <div @click='$router.push({ path: `/project/${$route.params.projectid}/training` })' class='round bg-gray-faint-on-hover'>Training</div>
                        </div>
                    </button>
                    <div v-if='folding.iterations' class='fr bg-gray-faint bg-gray-on-hover color-white-on-hover color-gray inline-block px6 py3 round txt-xs txt-bold mr3'>
                        <span v-text='`${iterations.length > 0 ? iterations.length : "No"} Iterations`'/>
                    </div>
                </div>

                <div v-if='!folding.iterations' class='grid grid--gut12'>
                    <template v-if='iterations.length === 0'>
                        <div class='col col--12 py6'>
                            <div class='flex-parent flex-parent--center-main pt36'>
                                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                            </div>

                            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                                <h1 class='flex-child txt-h4 cursor-default'>No Iterations Yet</h1>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div :key='iter.id' v-for='iter in iterations' @click='$router.push({ name: "iteration", params: {
                            projectid: $route.params.projectid,
                            iterationid: iter.id
                        }})' class='cursor-pointer col col--12'>
                            <div class='col col--12 grid py6 px12 bg-darken10-on-hover'>
                                <div class='col col--6'>
                                    <div class='col col--12 clearfix'>
                                        <h3 class='txt-h4 fl' v-text='"v" + iter.version'></h3>
                                        <span class='fl ml6 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue inline-block px6 py3 round txt-xs txt-bold cursor-pointer' v-text='iter.hint'/>
                                    </div>
                                </div>
                                <div class='col col--6 clearfix'>
                                    <template v-if='!iter.modelLink && iter.hint === "prediction"'>
                                        <div class='fr bg-red-faint bg-red-on-hover color-white-on-hover color-red inline-block px6 py3 round txt-xs txt-bold cursor-pointer'>
                                            No Model
                                        </div>
                                    </template>

                                    <div v-if='iter.modelLink' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue inline-block px6 py3 round txt-xs txt-bold cursor-pointer'>
                                        Model
                                    </div>
                                    <div v-if='iter.saveLink' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue inline-block px6 py3 round txt-xs txt-bold cursor-pointer'>
                                        Container
                                    </div>
                                    <div v-if='stacks.predictions.includes(iter.predictionsId)' class='fr bg-green-faint bg-green-on-hover color-white-on-hover color-green inline-block px6 py3 round txt-xs txt-bold mr3'>
                                        Active Stack
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class='col col--12 border-b border--gray-light clearfix pt24'>
                    <button @click='folding.imagery = !folding.imagery' class='btn btn--white color-gray px0'>
                        <svg v-if='!folding.imagery' class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg>
                        <svg v-else class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg>

                        <span class='fl pl6'>Imagery</span>
                    </button>

                    <button v-if='!folding.imagery' @click='$router.push({ path: `/project/${$route.params.projectid}/imagery` })' class='btn fr mb6 round btn--stroke color-gray color-green-on-hover'>
                        <svg class='icon'><use href='#icon-plus'/></svg>
                    </button>
                    <div v-if='folding.imagery' class='fr bg-gray-faint bg-gray-on-hover color-white-on-hover color-gray inline-block px6 py3 round txt-xs txt-bold mr3'>
                        <span v-text='`${imagery.length > 0 ? imagery.length : "No"} Imagery`'/>
                    </div>
                </div>

                <div v-if='!folding.imagery' class='grid grid--gut12'>
                    <template v-if='imagery.length === 0'>
                        <div class='col col--12 py6'>
                            <div class='flex-parent flex-parent--center-main pt36'>
                                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                            </div>

                            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                                <h1 class='flex-child txt-h4 cursor-default'>No Imagery Yet</h1>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div :key='img.id' v-for='img in imagery' @click='$router.push({ path: `/project/${$route.params.projectid}/imagery/${img.id}` })' class='cursor-pointer col col--12'>
                            <div class='col col--12 grid py6 px12 bg-darken10-on-hover'>
                                <div class='col col--8'><h3 class='txt-h4 fl' v-text='img.name'></h3></div>
                                <div class='col col--4'><div v-text='img.fmt' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue px6 py3 round txt-xs txt-bold'></div></div>
                            </div>
                        </div>
                    </template>
                </div>

                <div class='col col--12 border-b border--gray-light clearfix pt24'>
                    <button @click='folding.integrations = !folding.integrations' class='btn btn--white color-gray px0'>
                        <svg v-if='!folding.integrations' class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg>
                        <svg v-else class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg>

                        <span class='fl pl6'>Integrations</span>
                    </button>

                    <button v-if='!folding.integrations' @click='$router.push({ path: `/project/${$route.params.projectid}/integration` })' class='btn fr mb6 round btn--stroke color-gray color-green-on-hover'>
                        <svg class='icon'><use href='#icon-plus'/></svg>
                    </button>
                    <div v-if='folding.integrations' class='fr bg-gray-faint bg-gray-on-hover color-white-on-hover color-gray inline-block px6 py3 round txt-xs txt-bold mr3'>
                        <span v-text='`${integrations > 0 ? integrations : "No"} Integrations`'/>
                    </div>
                </div>

                <Integrations
                    v-if='!folding.integrations'
                    @integration='$router.push({ path: `/project/${$route.params.projectid}/integration/${$event.id}` })'
                    @count='integrations = $event'
                />

                <template v-if='project.notes'>
                    <div class='col col--12 border-b border--gray-light clearfix pt24'>
                        <button @click='folding.notes = !folding.notes' class='btn btn--white color-gray px0'>
                            <svg v-if='!folding.notes' class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg>
                            <svg v-else class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg>

                            <span class='fl pl6'>Notes</span>
                        </button>
                    </div>

                    <pre v-if='!folding.notes' v-text='project.notes' class='pre'/>
                </template>
            </div>
        </template>
        <template v-else>
            <router-view
                :meta='meta'
                :model='project'
                :user='user'
                @refresh='refresh'
                @err='$emit("err", $event)'
            />
        </template>
    </div>
</template>

<script>
import vSort from 'semver-sort';
import Integrations from './Integrations.vue';

export default {
    name: 'Project',
    props: ['meta', 'stacks', 'user'],
    data: function() {
        return {
            iterations: [],
            project: {},
            imagery: [],
            integrations: 0,
            loading: {
                project: true
            },
            folding: {
                integrations: false,
                imagery: false,
                iterations: false,
                notes: false
            }
        }
    },
    watch: {
        '$route': function() {
            this.refresh();
        }
    },
    components: {
        Integrations,
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: function() {
            this.getIterations();
            this.getProject();
            this.getImagery();
        },
        close: function() {
            this.$emit('close');
        },
        external: function(url) {
            if (!url) return;

            window.open(url, "_blank")
        },
        getIterations: async function() {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}/iteration`);

                const vMap = {};

                for (const v of []) {
                    vMap[v.version] = v;
                }

                this.iterations = vSort.desc([].map(r => r.version)).map(r => {
                    return vMap[r];
                });

            } catch (err) {
                this.$emit('err', err);
            }
        },
        getProject: async function() {
            try {
                this.loading.project = true;
                this.project = await window.std(`/api/project/${this.$route.params.projectid}`);
                this.loading.project = false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getImagery: async function() {
            try {
                const imagery = await window.std(`/api/project/${this.$route.params.projectid}/imagery`);
                this.imagery = imagery.imagery;
            } catch (err) {
                this.$emit('err', err);
            }
        },
    }
}
</script>

<style>
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 6px 12px;
    z-index: 1;
}

.dropdown:hover .dropdown-content {
    display: block;
}
</style>

