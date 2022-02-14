<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 flex flex--center-main'>
            <h3 class='flex-child txt-h4 py6'>Reset Password</h3>
        </div>

        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-if='!success'>
            <div class='col col--12 flex flex--center-main'>
                <div class='w240 col col--12 grid grid--gut12'>
                    <label class='mt12'>Reset Token:</label>
                    <input v-on:keyup.enter='reset' :class='{
                         "input--border-red": attempted && !token
                    }' v-model='token' type='text' class='input'/>

                    <label class='mt12 col col--12'>
                        New Password:
                    </label>
                    <input v-on:keyup.enter='reset' :class='{
                         "input--border-red": attempted && !password
                   } ' v-model='password' type='password' class='input'/>

                    <button @click='reset' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Reset Password</button>
                </div>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main py24'>
                <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
            </div>
            <div class='col col--12 flex flex--center-main'>
                <div>Password Reset</div>
            </div>

            <button @click='$router.push("/login")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Login</button>
        </template>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Reset',
    props: ['meta'],
    data: function() {
        return {
            loading: false,
            attempted: false,
            success: false,
            token: this.$route.query.token,
            password: ''
        }
    },
    methods: {
        reset: async function() {
            this.attempted = true;

            if (!this.token.length) return;
            if (!this.password.length) return;

            this.loading = true;

            try {
                await window.std('/api/login/reset', {
                    method: 'POST',
                    body: {
                        token: this.token,
                        password: this.password
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
