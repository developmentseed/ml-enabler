<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 v-if='!newProject' class='fl'>Modify Project</h2>
            <h2 v-else class='fl cursor-default'>Add Project</h2>

            <button @click='$router.push({ path: "/" });' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='!newProject' @click='deleteProject($route.params.projectid)' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
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

                    <input v-model='project.name' class='input' placeholder='Model Name'/>
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
                    <div class='w-full ml12 border-b border--gray-light mb12'/>

                    <div :key='user.uid' v-for='(user, user_idx) in project.users' class='col col--12 grid grid--gut12 my3'>
                        <div class='col col--8'>
                            <button @click='project.users.splice(user_idx, 1)' class='fl mr12 round btn btn--s mt6 btn--stroke color-gray'><svg class='icon'><use xlink:href='#icon-close'/></svg></button>
                            <span v-text='user.name'/>
                        </div>
                        <div class='col col--4'>
                            <div class='select-container fr'>
                                <select v-model='user.access' class='select'>
                                    <option>read</option>
                                    <option>write</option>
                                    <option>admin</option>
                                </select>
                                <div class='select-arrow'></div>
                            </div>
                        </div>
                    </div>

                    <label class='ml12'>Add User to Project</label>
                    <vSelect
                        label='name'
                        class='ml12 w-full'
                        v-model='search.user'
                        :options='search.users'
                        @input='addUser'
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
                    <button v-if='!newProject && showAdvanced' @click='postProject(true)' class='btn btn--stroke round fl color-gray color-red-on-hover'>Archive Project</button>
                    <button v-if='!newProject' @click='postProject(false)' class='btn btn--stroke round fr color-blue-light color-blue-on-hover'>Update Project</button>
                    <button v-else @click='postProject(false)' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Project</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
    name: 'EditProject',
    props: ['meta', 'user'],
    data: function() {
        return {
            newProject: this.$route.params.projectid !== 'new',
            showUser: false,
            showAdvanced: false,
            search: {
                user: {},
                users: []
            },
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
        this.getUsers();

        if (this.newProject) {
            this.project.users.push({
                uid: this.user.id,
                name: this.user.name,
                access: 'admin'
            });
        } else {
            this.getProject();
        }
    },
    methods: {
        addUser: function() {
            for (const user of this.project.users) {
                if (this.search.user.id === user.uid) {
                    this.search.user = null;
                    return;
                }
            }

            this.project.users.push({
                uid: this.search.user.id,
                name: this.search.user.name,
                access: 'read'
            });

            this.search.user = null;
        },
        postProject: async function(archive) {
            const body = {
                name: this.project.name,
                notes: this.project.notes,
                access: this.project.access ? 'public' : 'private',
                source: this.project.source,
                project_url: this.project.project_url,
                tags: this.project.tags,
                users: this.project.users
            };

            if (!this.newProject) {
                body.archived = archive ? true : false;
            }

            try {
                const proj = await window.std(`/api/project${!this.newProject ? '/' + this.$route.params.projectid : ''}`, {
                    method: this.$route.params.projectid ? 'PUT' : 'POST',
                    body: body
                });

                if (this.newProject) {
                    this.$router.push({ path: `/model/${proj.id}` });
                } else {
                    this.$router.push({ path: `/model/${this.$route.params.projectid}` });
                }
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
        getUsers: async function() {
            try {
                this.search.users = (await window.std('/api/user')).users;
            } catch (err) {
                this.$emit('err', err);
            }
        },
    },
    components: {
        vSelect
    }
}
</script>
