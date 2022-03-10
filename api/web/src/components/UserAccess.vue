<template>
<div class='grid col col--12'>
    <div :key='user.id' v-for='(user, user_idx) in users' class='col col--12 grid grid--gut12 my3'>
        <div class='col col--8'>
            <button @click='users.splice(user_idx, 1)' class='fl mr12 round btn btn--s mt6 btn--stroke color-gray'><svg class='icon'><use xlink:href='#icon-close'/></svg></button>
            <span v-text='user.username'/>
        </div>
        <div class='col col--4'>
            <div class='select-container fr'>
                <select v-on:change='modifyUser(user)' v-model='user.access' class='select select--stroke'>
                    <option>read</option>
                    <option>user</option>
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
</div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

export default {
    name: 'UserAccess',
    props: ['user', 'proj'],
    data: function() {
        return {
            users: [],
            search: {
                user: {},
                users: []
            }
        }
    },
    mounted: function() {
        this.getUsers();
        this.getProjectUsers();
    },
    methods: {
        addUser: async function() {
            for (const user of this.users) {
                if (this.search.user.id === user.uid) {
                    this.search.user = null;
                    return;
                }
            }

            try {
                await window.std(`/api/project/${this.proj.id}/user`, {
                    method: 'POST',
                    body: {
                        uid: this.search.user.id,
                        access: 'read'
                    }
                });
            } catch (err) {
                this.$emit('err', err);
            }

            this.search.user = null;

            this.getProjectUsers();
        },
        modifyUser: async function(user) {
            try {
                await window.std(`/api/project/${this.proj.id}/user/${user.id}`, {
                    method: 'PATCH',
                    body: {
                        access: user.access
                    }
                });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getProjectUsers: async function() {
            try {
                const list = await window.std(`/api/project/${this.proj.id}/user`);
                this.users = list.projects_access;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getUsers: async function() {
            try {
                const list = await window.std('/api/user');
                this.search.users = list.users;
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
