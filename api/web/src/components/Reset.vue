<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 flex flex--center-main'>
            <h3 class='flex-child txt-h4 py6'>Reset Password</h3>
        </div>

        <template v-if='loading'>
            <Loading/>
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
            token: '',
            password: ''
        }
    },
    mounted: function() {
        this.reset();
    },
    methods: {
        reset: async function() {
            this.loading = true;

            try {
                const body = await window.std('/api/login/reset', {
                    method: 'POST',
                    body: {
                        token: this.token,
                        password: this.password
                    }
                }, false);
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
