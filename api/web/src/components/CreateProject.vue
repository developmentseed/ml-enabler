<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>Add Project</h2>

            <button @click='$router.push({ path: "/" });' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
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
                    <div class='w-full ml12 border-b border--gray-light mb12'/>

                    <div :key='user.uid' v-for='(user, user_idx) in project.users' class='col col--12 grid grid--gut12 my3'>
                        <div class='col col--8'>
                            <button @click='project.users.splice(user_idx, 1)' class='fl mr12 round btn btn--s mt6 btn--stroke color-gray'><svg class='icon'><use xlink:href='#icon-close'/></svg></button>
                            <span v-text='user.username'/>
                        </div>
                        <div class='col col--4'>
                            <div class='select-container fr'>
                                <select v-model='user.access' class='select select--stroke'>
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
                        label='username'
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

                    <div class='col col--12 grid'>
                        <label>Git Repository</label>

                        <input v-model='project.repo' class='input' placeholder='https://github.com/example/repo' :class='{
                            "border": errors.repo,
                            "border--red": errors.repo
                        }'/>

                        <div v-if='errors.repo' class='col col--12 round py3 bg-red mt6 align-center color-white'>
                            Repo must follow the format: https://github.com/&lt;user&gt;/&lt;repo&gt;
                        </div>
                    </div>

                    <div class='col col--12 py12'>
                        <label>Stack Tags</label>

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
                    </div>
                </template>

                <div class='col col--12 py12'>
                    <button @click='postProject' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Project</button>
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
            showUser: false,
            showAdvanced: false,
            search: {
                user: {},
                users: []
            },
            errors: {
                repo: false
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

        this.project.users.push({
            uid: this.user.id,
            username: this.user.username,
            access: 'admin'
        });
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
                username: this.search.user.username,
                access: 'read'
            });

            this.search.user = null;
        },
        postProject: async function() {
            let error = false;
            if (this.project.repo && !this.project.repo.match(/https:\/\/github.com\/[a-z-]+\/[a-z-]+/)) {
                this.errors.repo = true;
                error = true
            }

            if (error) return;

            try {
                const body = {
                    name: this.project.name,
                    notes: this.project.notes,
                    access: this.project.access ? 'public' : 'private',
                    source: this.project.source,
                    project_url: this.project.project_url,
                    tags: this.project.tags,
                    users: this.project.users.map((u) => {
                        return {
                            uid: u.uid,
                            access: u.access
                        }
                    })
                };

                if (this.project.repo) body.repo = this.project.repo;

                const proj = await window.std('/api/project', {
                    method: 'POST',
                    body
                });

                this.$router.push({ path: `/project/${proj.id}` });
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
