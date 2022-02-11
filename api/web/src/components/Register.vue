<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 flex flex--center-main'>
            <h3 class='flex-child txt-h4 py6'>Register</h3>
        </div>

        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else-if='!success'>
            <div class='col col--12 flex flex--center-main'>
                <div class='w240 col col--12 grid grid--gut12'>
                    <label class='mt12 col col--12'>
                        Username:
                    </label>
                    <input v-on:keyup.enter='register' :class='{
                         "input--border-red": attempted && !username
                    }' v-model='username' type='text' class='input'/>

                    <label class='mt12 col col--12'>
                        Email:
                    </label>
                    <input v-on:keyup.enter='register' :class='{
                         "input--border-red": attempted && !username
                    }' v-model='email' type='text' class='input'/>

                    <label class='mt12 col col--12'>
                        Password:
                    </label>
                    <input v-on:keyup.enter='register' :class='{
                         "input--border-red": attempted && !password
                   } ' v-model='password' type='password' class='input'/>

                    <button @click='register' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Register</button>
                </div>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main py24'>
                <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
            </div>
            <div class='col col--12 flex flex--center-main'>
                <div>Email Confirmation Sent!</div>
            </div>

            <button @click='$router.push("/home")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Home</button>
        </template>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Register',
    props: ['meta'],
    data: function() {
        return {
            loading: false,
            attempted: false,
            success: false,
            username: '',
            password: '',
            email: ''
        }
    },
    methods: {
        register: async function() {
            this.attempted = true;

            if (!this.username.length) return;
            if (!this.password.length) return;
            this.loading = true;

            try {
                await window.std('/api/user', {
                    method: 'POST',
                    body: {
                        username: this.username,
                        password: this.password,
                        email: this.email
                    }
                }, false);

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
