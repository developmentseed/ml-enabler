<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>Projects</h2>

            <div class='fr'>
                <label class='switch-container px6'>
                    <span class='mr6'>Archived</span>
                    <input v-model='archived' type='checkbox' />
                    <div class='switch'></div>
                </label>

                <button @click='showSearch = !showSearch' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-search'/></svg>
                </button>
                <button @click='refresh' class='btn round btn--stroke color-gray color-blue-on-hover mr12'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>
                <button @click='$router.push({ name: "newproject" })' class='btn round btn--stroke color-gray color-green-on-hover'>
                    <svg class='icon'><use href='#icon-plus'/></svg>
                </button>
            </div>
        </div>
        <div class='border border--gray-light round mb60'>
            <template v-if='showSearch'>
                <div class='col col--12 px24 py6'>
                    <div class='relative'>
                        <div class='absolute flex flex--center-cross flex--center-main w36 h36'>
                            <svg class='icon'><use xlink:href='#icon-search'></use></svg>
                        </div>
                        <input ref='search' v-model='search' class='input pl36' placeholder='Model Name'>
                    </div>
                </div>
            </template>
            <template v-if='loading.projects'>
                <Loading desc='Loading Projects'/>
            </template>
            <template v-else-if='projects.length === 0'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>No Projects Found</h1>
                </div>
            </template>
            <template v-else>
                <div @click='$router.push({ name: "project", params: { projectid: project.id } })' :key='project.modelId' v-for='project in projects.slice(page * 10, page * 10 + 10)'>
                    <div class='cursor-pointer bg-darken10-on-hover col col--12 py12'>
                        <div class='col col--12 grid py6 px12'>
                            <div class='col col--6'>
                                <div class='col col--12 clearfix'>
                                    <svg v-if='project.access === "private"' class='fl icon color-gray h24 w24'><use xlink:href='#icon-lock'/></svg>

                                    <h3 class='txt-h4 fl' v-text='project.name'></h3>
                                    <svg @click.prevent.stop='$router.push({ name: "editproject", params: { projectid: project.id } })' class='fl my6 mx6 icon cursor-pointer color-gray-light color-gray-on-hover'><use href='#icon-pencil'/></svg>
                                </div>
                                <div class='col col--12'>
                                    <h3 class='txt-xs' v-text='project.source'></h3>
                                </div>
                            </div>
                            <div class='col col--6'>
                                <div v-if='project.project_url' @click.prevent.stop='external(project.project_url)' class='fr bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue inline-block px6 py3 round txt-xs txt-bold cursor-pointer mr3'>
                                    Project Page
                                </div>

                                <div v-if='project.repo' @click.prevent.stop='external(project.repo)' class='fr bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue inline-block px6 py3 round txt-xs txt-bold cursor-pointer mr3'>
                                    <svg class='icon' style='height: 15px; width: 15px;'><use xlink:href='#icon-github'/></svg>
                                </div>


                                <div v-if='project.stacks.length' class='fr bg-green-faint bg-green-on-hover color-white-on-hover color-green inline-block px6 py3 round txt-xs txt-bold mr3'>
                                    Active Stack
                                </div>
                                <div v-if='project.archived' class='fr bg-gray-faint bg-gray-on-hover color-white-on-hover color-gray inline-block px6 py3 round txt-xs txt-bold mr3'>
                                    Archived
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Pager
                    @page='page = $event'
                    :total='projects.length'
                    perpage='10'
                />
            </template>
        </div>
    </div>
</template>

<script>
import Pager from './util/Pager.vue';
import Loading from './util/Loading.vue';

export default {
    name: 'Home',
    props: ['meta'],
    data: function() {
        return {
            page: 0,
            showSearch: false,
            search: '',
            archived: false,
            projects: [],
            loading: {
                projects: true
            }
        }
    },
    mounted: function() {
        this.refresh();

        window.addEventListener('keydown', (e) => {
            if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
                e.preventDefault();
                this.showSearch = true;
                this.$refs.search.focus()
            } else if (e.keyCode === 27) {
                e.preventDefault();
                this.showSearch = false;
            }
        })
    },
    watch: {
        showSearch: function() {
            if (!this.showSearch) this.search = '';

            this.$nextTick(() => {
                if (this.showSearch) this.$refs.search.focus()
            });
        },
        search: function() {
            this.refresh();
        },
        archived: function() {
            this.refresh();
        }
    },
    methods: {
        refresh: function() {
            this.page = 0;
            this.getProjects();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getProjects: async function() {
            this.loading.projects = true;
            this.projects = [];

            try {
                const url = new URL('/api/project', window.api);
                url.searchParams.append('filter', this.search);
                url.searchParams.append('archived', this.archived);
                const projects = await window.std(url);

                this.projects = projects.projects;
                this.loading.projects = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading,
        Pager
    }
}
</script>
