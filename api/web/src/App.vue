<template>
    <div id="app" class='flex flex--center-main relative'>
        <div class='flex-child wmax600 col col--12'>
            <div class='py36 col col--12 grid'>
                <div class='col col--3'></div>
                <div class='col col--6'>
                    <h1 @click='$router.push({ path: "/" })' class='align-center txt-h3 cursor-default txt-underline-on-hover cursor-pointer'>ML Enabler</h1>
                </div>
                <div v-if='!loading.user && $route.path !== "/login"' class='col col--3'>
                    <button v-if='user.username' @click='$router.push({ path: "/profile" })' class='dropdown btn fr mr6 mb6 pb3 round btn--stroke color-gray color-blue-on-hover'>
                        <svg class='icon inline'><use href='#icon-chevron-down'/></svg>
                        <span v-text='user.username'/>

                        <div class='round dropdown-content color-black' style='top: 24px;'>
                            <div @click.stop='$router.push({ path: "/profile" })' class='round bg-gray-faint-on-hover'>Profile</div>
                            <div v-if='user.access === "admin"' @click.stop='$router.push({ path: "/admin" })' class='round bg-gray-faint-on-hover'>Admin</div>
                            <div @click.stop='getLogout' class='round bg-gray-faint-on-hover'>Logout</div>
                        </div>
                    </button>
                    <button v-else @click='$router.push({ path: "/login" })' class='btn fr mr6 mb6 pb3 round btn--stroke color-gray color-green-on-hover'>
                        Login
                    </button>

                    <button @click='external("/docs/")' class='btn btn--stroke round color-gray fr mr12' style='height: 33px;'>
                        <svg class='icon'><use href='#icon-book'/></svg>
                    </button>

                </div>
            </div>
            <template v-if='loading.meta || loading.user'>
                <Loading desc='Loading ML-Enabler'/>
            </template>
            <template v-else-if='meta.security === "authenticated" && !user.username && $route.path !== "/login"'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-alert'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb6'>
                    <h1 class='flex-child txt-h4 cursor-default align-center'>Access Denied</h1>
                </div>
                <div class='flex flex--center-main'>
                    <h2 class='flex-child txt-h5 cursor-default align-center'>Please Login To Access</h2>
                </div>
            </template>
            <template v-else>
                <router-view
                    :user='user'
                    :meta='meta'
                    @err='err = $event'
                    @auth='refresh($event)'
                />
            </template>
        </div>

        <Err
            v-if='err'
            :err='err'
            @err='err = $event'
        />
    </div>
</template>

<script>
import Err from './components/Err.vue';
import Loading from './components/util/Loading.vue';

export default {
    name: 'MLEnabler',
    data: function() {
        return {
            err: false,
            user: {
                name: false,
                access: false
            },
            meta: {
                version: 1,
                environment: 'docker',
                security: false
            },
            loading: {
                user: true,
                meta: true
            }
        }
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: async function(token) {
            if (token) localStorage.token = token;

            await this.getMeta();
            await this.getUser();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getLogout: async function() {
            try {
                delete localStorage.token;
                if (this.$router.path !== '/') this.$router.push({ path: "/" })
            } catch (err) {
                this.err = err;
            }
        },
        getMeta: async function() {
            try {
                this.loading.meta = true;
                this.meta = await window.std('/api/');
                this.loading.meta = false;
            } catch (err) {
                this.err = err;
            }
        },
        getUser: async function() {
            try {
                this.loading.user = true;
                this.user = await window.std('/api/login', {}, false);
                this.loading.user = false;
            } catch (err) {
                console.error(err);
            }
        }
    },
    components: {
        Loading,
        Err
    }
}
</script>

<style lang="scss">

.col--1 { width: 8.3333% !important; }
.col--2 { width: 16.6666% !important; }
.col--3 { width: 25% !important; }
.col--4 { width: 33.3333% !important; }
.col--5 { width: 41.6666% !important; }
.col--6 { width: 50% !important; }
.col--7 { width: 58.3333% !important; }
.col--8 { width: 66.6666% !important; }
.col--9 { width: 75% !important; }
.col--10 { width: 83.3333% !important; }
.col--11 { width: 91.6666% !important; }
.col--12 { width: 100% !important; }

@media screen and (min-width: 640px) {
    .col--1-mm { width: 8.3333% !important; }
    .col--2-mm { width: 16.6666% !important; }
    .col--3-mm { width: 25% !important; }
    .col--4-mm { width: 33.3333% !important; }
    .col--5-mm { width: 41.6666% !important; }
    .col--6-mm { width: 50% !important; }
    .col--7-mm { width: 58.3333% !important; }
    .col--8-mm { width: 66.6666% !important; }
    .col--9-mm { width: 75% !important; }
    .col--10-mm { width: 83.3333% !important; }
    .col--11-mm { width: 91.6666% !important; }
    .col--12-mm { width: 100% !important; }
}

.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 6px 12px;
    z-index: 1;
}

.dropdown:hover .dropdown-content {
    display: block;
}
</style>

