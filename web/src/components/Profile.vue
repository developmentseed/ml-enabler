<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light'>
            <div class='col col--12'>

                <h2 v-if='mode === "profile"' class='txt-h4 ml12 pb12 fl'>Profile:</h2>
                <h2 v-else-if='mode === "analytics"' class='txt-h4 ml12 pb12 fl'>Analytics:</h2>
                <h2 v-else-if='mode === "admin"' class='txt-h4 ml12 pb12 fl'>Administration:</h2>

                <div class='fr'>
                    <div v-if='profile.access === "admin"' class='flex-parent-inline'>
                        <button @click='mode = "profile"' :class='{ "btn--stroke": mode !== "profile" }' class='btn btn--s btn--pill btn--pill-hl round mx0'>Profile</button>
                        <button @click='mode = "analytics"' :class='{ "btn--stroke": mode !== "analytics" }' class='btn btn--s btn--pill btn--pill-hc round mx0'>Analytics</button>
                        <button @click='mode = "admin"' :class='{ "btn--stroke": mode !== "admin" }' class='btn btn--s btn--pill btn--pill-hr round mx0'>Admin</button>
                    </div>
                </div>
            </div>
        </div>

        <template v-if='loading.profile'>
            <div class='flex-parent flex-parent--center-main w-full'>
                <div class='flex-child loading py24'></div>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 grid grid--gut12'>
                <div class='col col--6 pt12'>
                    <label>Username:</label>
                    <input v-model='profile.username' class='input' placeholder='Username'/>
                </div>
                <div class='col col--6 pt12'>
                    <label>Email:</label>
                    <input v-model='profile.email' class='input' placeholder='Username'/>
                </div>
                <div class='col col--12 clearfix pt12'>
                    <button disabled class='btn btn--stroke btn--gray btn--s round fr'>Update</button>
                </div>
            </div>
        </template>

        <ProfileTokens @err='$emit("err", $event)'/>
    </div>
</template>

<script>
import ProfileTokens from './profile/ProfileTokens.vue'

export default {
    name: 'Profile',
    props: [ ],
    data: function() {
        return {
            profile: {
                username: '',
                access: '',
                email: ''
            },
            loading: {
                profile: false,
            }
        };
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: function() {
            this.getUser();
        },
        getUser: function() {
            const url = new URL(`${window.location.origin}/api/user/me`);

            fetch(url, {
                method: 'GET'
            }).then((res) => {
                if (!res.ok && res.message) {
                    throw new Error(res.message);
                } else if (!res.ok) {
                    throw new Error('Failed to load profile');
                }
                return res.json();
            }).then((res) => {
                this.profile = res;
            }).catch((err) => {
                this.$emit('err', err);
            });
        }
    },
    components: {
        ProfileTokens
    }
}
</script>
