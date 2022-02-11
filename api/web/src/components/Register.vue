<template>
    <div class='col col--12 grid pt12'>
        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main'>
                <h3 class='flex-child txt-h4 py6'>Register</h3>
            </div>

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
                const body = await window.std('/api/login', {
                    method: 'POST',
                    body: {
                        username: this.username,
                        password: this.password
                    }
                }, false);

                this.$emit('auth', body.token);
                this.$router.push('/')
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
