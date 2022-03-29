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

    <UserSelect
        :omitted='users'
        @user='addUser($event)'
        @err='$emit("err", $event)'
    />
</div>
</template>

<script>
import UserSelect from './util/UserSelect.vue';

export default {
    name: 'UserAccess',
    props: ['user', 'proj'],
    data: function() {
        return {
            users: [],
        }
    },
    mounted: function() {
        this.getProjectUsers();
    },
    methods: {
        addUser: async function(user) {
            try {
                await window.std(`/api/project/${this.proj.id}/user`, {
                    method: 'POST',
                    body: {
                        uid: user.id,
                        access: 'read'
                    }
                });
            } catch (err) {
                this.$emit('err', err);
            }

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
        }
    },
    components: {
        UserSelect
    }
}
</script>
