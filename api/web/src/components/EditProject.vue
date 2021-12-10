<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl'>Modify Project</h2>

            <button @click='$router.push({ path: "/" });' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button @click='deleteProject($route.params.projectid)' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <div class='grid grid--gut12'>
                <div class='col col--12 py6'>
                    <label class='fl'>Project Name</label>

                    <label class='fr switch-container'>
                        <span class='mr6'>Public Project</span>
                        <input v-model='project.access' type='checkbox' />
                        <div class='switch'></div>
                    </label>

                    <input v-model='project.name' class='input' placeholder='Project Name'/>
                </div>

                <div class='col col--6 py6'>
                    <label>Project Source</label>
                    <input v-model='project.source' class='input' placeholder='Company'/>
                </div>

                <div class='col col--6 py6'>
                    <label>Project Url</label>
                    <input v-model='project.project_url' class='input' placeholder='External URL'/>
                </div>

                <div class='col col--12 py6'>
                    <label>Project Readme</label>
                    <textarea v-model='project.notes' class='textarea w-full' placeholder='README'/>
                </div>

                <template v-if='!showUser'>
                    <div class='col col--12'>
                        <button @click='showUser = !showUser' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg><span class='fl pl6'>User Access</span></button>
                    </div>
                </template>
                <template v-else>
                    <div class='col col--12'>
                        <button @click='showUser = !showUser' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg><span class='fl pl6'>User Access</span></button>
                    </div>
                </template>
                <template v-if='showUser'>
                    <UserAccess
                        :user='user'
                        :proj='project'
                    />
                </template>

                <template v-if='!showAdvanced'>
                    <div class='col col--12'>
                        <button @click='showAdvanced = !showAdvanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-else>
                    <div class='col col--12'>
                        <button @click='showAdvanced = !showAdvanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-if='showAdvanced'>
                    <div class='w-full ml12 border-b border--gray-light mb12'/>

                    <div class='col col--12'>
                        <label>Stack Tags</label>
                    </div>

                    <div class='col col--12 grid grid--gut12' :key='tag_idx' v-for='(tag, tag_idx) in project.tags'>
                        <div class='col col--4 py6'>
                            <input v-model='tag.Key' input='text' class='input w-full' placeholder='Key'/>
                        </div>
                        <div class='col col--7 py6'>
                            <input v-model='tag.Value' input='text' class='input w-full' placeholder='Value'/>
                        </div>
                        <div class='col col--1 py6'>
                            <button @click='project.tags.splice(tag_idx, 1)' class='btn btn--stroke round color-gray color-blue-on-hover h36'><svg class='icon'><use href='#icon-close'/></svg></button>
                        </div>
                    </div>

                    <div class='col col--12 py6'>
                        <button @click='project.tags.push({"Key": "", "Value": ""})' class='btn btn--stroke round color-gray color-blue-on-hover'><svg class='icon'><use href='#icon-plus'/></svg></button>
                    </div>
                </template>

                <div class='col col--12 py12'>
                    <button v-if='showAdvanced' @click='postProject(true)' class='btn btn--stroke round fl color-gray color-red-on-hover'>Archive Project</button>
                    <button @click='postProject(false)' class='btn btn--stroke round fr color-blue-light color-blue-on-hover'>Update Project</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import UserAccess from './UserAccess.vue';

export default {
    name: 'EditProject',
    props: ['meta', 'user'],
    data: function() {
        return {
            showUser: false,
            showAdvanced: false,
            project: {
                name: '',
                notes: '',
                access: false,
                source: '',
                project_url: '',
                users: [],
                tags: []
            }
        }
    },
    mounted: function() {
        this.getProject();
    },
    methods: {
        postProject: async function(archive) {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}`, {
                    method: 'PATCH',
                    body: {
                        name: this.project.name,
                        archived: archive ? true : false,
                        notes: this.project.notes,
                        access: this.project.access ? 'public' : 'private',
                        source: this.project.source,
                        project_url: this.project.project_url,
                        tags: this.project.tags,
                    }
                });

                this.$router.push({ path: `/project/${this.$route.params.projectid}` });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getProject: async function() {
            try {
                this.project = await window.std(`/api/project/${this.$route.params.projectid}`)
                this.project.access = this.project.access === 'public' ? true : false;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteProject: async function() {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}`, {
                    method: 'DELETE'
                });
                this.$router.push({ path: '/' });
            } catch (err) {
                this.$emit('err', err);
            }
        },
    },
    components: {
        UserAccess
    }
}
</script>
