<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 v-if='!newProject' class='fl'>Modify Project</h2>
            <h2 v-else class='fl cursor-default'>Add Project</h2>

            <button @click='$router.push({ path: "/" });' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='!newProject' @click='deleteProject($route.params.modelid)' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
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
                    <input v-model='project.projectUrl' class='input' placeholder='External URL'/>
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

                    <div :key='user.uid' v-for='user in users' class='col col--12 grid grid--gut12'>
                        <div class='col col--8'>
                            <button class='fl mr12 round btn btn--s mt6 btn--stroke color-gray'><svg class='icon'><use xlink:href='#icon-close'/></svg></button>
                            <span v-text='user.name'/>
                        </div>
                        <div class='col col--4'>
                            <div class='select-container fr'>
                                <select class='select'>
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
                        class='ml12 w-full'
                        v-model='search.name'
                        :options='search.users'
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
                    <button v-if='!newProject' @click='postProject(true)' class='btn btn--stroke round fl color-gray color-red-on-hover'>Archive Project</button>
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
            newProject: this.$route.name === 'newmodel',
            showUser: false,
            showAdvanced: false,
            search: {
                name: '',
                users: []
            },
            users: [],
            project: {
                name: '',
                access: false,
                source: '',
                projectUrl: '',
                users: [],
                tags: []
            }
        }
    },
    mounted: function() {
        if (this.$route.name === "newmodel") {
            this.users.push({
                uid: this.user.id,
                name: this.user.name,
                access: 'admin'
            });
        } else {
            this.getProject();
        }
    },
    methods: {
        postProject: async function(archive) {
            try {
                const res = await fetch(window.api + `/v1/model${!this.newProject ? '/' + this.$route.params.modelid : ''}`, {
                    method: this.$route.params.modelid ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        modelId: !this.newProject ? this.$route.params.modelid : undefined,
                        name: this.project.name,
                        access: this.project.access ? 'public' : 'private',
                        source: this.project.source,
                        projectUrl: this.project.projectUrl,
                        archived: archive ? true : false,
                        tags: this.project.tags
                    })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);
                this.$router.push({ path: '/' });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getProject: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}`, {
                    method: 'GET'
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message)
                body.access = body.access === 'public' ? true : false;

                this.project = body;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteProject: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}`, {
                    method: 'DELETE'
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);
                this.$router.push({ path: '/' });
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        vSelect
    }
}
</script>
