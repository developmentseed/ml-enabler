<template>
<div class='col col--12 border border--gray-light round my12'>
    <div class='col col--12 grid grid--gut12 pl12 py6'>
        <div class='col col--12 pb6'>
            <h2 class='txt-bold fl'>Create New User</h2>
            <button @click='$emit("close")' class='fr btn round btn--s btn--stroke btn--gray'>
                <svg class='icon'><use xlink:href='#icon-close'/></svg>
            </button>
        </div>

        <template v-if='loading'>
            <Loading desc='Creating User'/>
        </template>
        <template v-else-if='!success'>
            <div class='col col--4'>
                <label>Username</label>
                <input v-model='username' type='text' class='input' placeholder='Username'/>
            </div>
            <div class='col col--4'>
                <label>Email</label>
                <input v-model='email' type='text' class='input' placeholder='Email'/>
            </div>
            <div class='col col--4'>
                <label>Access</label>
                <div class='select-container w-full'>
                    <select v-model='access' class='select select--stroke'>
                        <option>user</option>
                        <option>admin</option>
                    </select>
                    <div class='select-arrow'></div>
                </div>
            </div>

            <div class='col col--12 mt12'>
                <button @click='createUser' class='fr btn btn--stroke round color-gray color-green-on-hover'>
                    <svg class='fl icon mt6'><use href='#icon-check'/></svg><span>Create</span>
                </button>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main py24'>
                <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
            </div>
            <div class='col col--12 flex flex--center-main'>
                <div>User Created</div>
            </div>

            <button @click='$emit("close")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>OK</button>
        </template>
    </div>
</div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'CreateUser',
    props: [ ],
    data: function() {
        return {
            loading: false,
            success: false,
            username: '',
            email: '',
            access: 'user',
        };
    },
    methods: {
        createUser: async function() {
            try  {
                this.loading = true;
                await window.std('/api/user', {
                    method: 'POST',
                    body: {
                        username: this.username,
                        email: this.email,
                        access: this.access
                    }
                })
                
                this.success = true;
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        }
    },
    components: {
        Loading
    }
}
</script>
