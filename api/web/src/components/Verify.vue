<template>
    <div class='col col--12 grid pt12'>
        <div class='col col--12 flex flex--center-main'>
            <h3 class='flex-child txt-h4 py6'>Verify Email</h3>
        </div>

        <template v-if='loading'>
            <Loading desc='Verifying Account'/>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main py24'>
                <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
            </div>
            <div class='col col--12 flex flex--center-main'>
                <div>Email Verified</div>
            </div>

            <button @click='$router.push("/login")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>Login</button>
        </template>
    </div>
</template>

<script>
import Loading from './util/Loading.vue';

export default {
    name: 'Verify',
    props: ['meta'],
    data: function() {
        return {
            loading: false,
        }
    },
    mounted: function() {
        console.error(this.$route.query);
        this.verify(this.$route.query.token);
    },
    methods: {
        verify: async function(token) {
            this.loading = true;

            try {
                await window.std('/api/login/verify', {
                    method: 'POST',
                    body: {
                        token
                    }
                }, false);

                this.loading = false;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        Loading
    }
}
</script>
