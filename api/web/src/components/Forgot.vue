<template>
    <div class='col col--12 grid pt12'>
        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main'>
                <h3 class='flex-child txt-h4 py6'>Forgot Password</h3>
            </div>

            <div class='col col--12 flex flex--center-main'>
                <div class='w240 col col--12 grid grid--gut12'>
                    <label class='mt12'>Username/Email:</label>
                    <input v-on:keyup.enter='login' :class='{
                         "input--border-red": attempted && !username
                    }' v-model='username' type='text' class='input'/>

                    <button @click='reset' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Reset Password</button>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Forgot',
    props: ['meta'],
    data: function() {
        return {
            loading: false,
            attempted: false,
            username: '',
        }
    },
    methods: {
        reset: async function() {
            this.attempted = true;

            if (!this.username.length) return;
            this.loading = true;

            try {
                await window.std('/api/login/reset', {
                    method: 'POST',
                    body: {
                        username: this.username
                    }
                }, false);

                //this.$router.push('/')
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
