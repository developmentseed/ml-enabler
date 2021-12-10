<template>
    <div class="col col--12">
        <div class='w-full ml12 border-b border--gray-light mb12'/>

        <div :key='user.uid' v-for='(user, user_idx) in users' class='col col--12 grid grid--gut12 my3'>
            <div class='col col--8'>
                <button @click='users.splice(user_idx, 1)' class='fl mr12 round btn btn--s mt6 btn--stroke color-gray'><svg class='icon'><use xlink:href='#icon-close'/></svg></button>
                <span v-text='user.username'/>
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
        addUser: function() {
            for (const user of this.users) {
                if (this.search.user.id === user.uid) {
                    this.search.user = null;
                    return;
                }
            }

            this.users.push({
                uid: this.search.user.id,
                username: this.search.user.username,
                access: 'read'
            });

            this.search.user = null;
        },
        getProjectUsers: async function() {
            try {
                const users = await window.std(`/api/project/${this.proj.id}/user`);
                this.users = users.access;
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
