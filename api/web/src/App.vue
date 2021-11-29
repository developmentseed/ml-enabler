<template>
    <div id="app" class='flex-parent flex-parent--center-main relative'>
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
                            <div @click.stop='getLogout' class='round bg-gray-faint-on-hover'>Logout</div>
                        </div>
                    </button>

                    <button v-else @click='$router.push({ path: "/login" })' class='fr btn btn--stroke btn--s round color-gray-light color-gray-on-hover'>Login</button>

                </div>
            </div>
            <template v-if='loading.meta || loading.user'>
                <div class='flex-parent flex-parent--center-main w-full'>
                    <div class='flex-child loading py24'></div>
                </div>
                <div class='flex-parent flex-parent--center-main w-full'>
                    <div class='flex-child py24'>Loading MLEnabler</div>
                </div>
            </template>
            <template v-else-if='meta.security === "authenticated" && !user.username && $route.path !== "/login"'>
                <div class='flex-parent flex-parent--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-alert'/></svg>
                </div>

                <div class='flex-parent flex-parent--center-main pt12 pb6'>
                    <h1 class='flex-child txt-h4 cursor-default align-center'>Access Denied</h1>
                </div>
                <div class='flex-parent flex-parent--center-main'>
                    <h2 class='flex-child txt-h5 cursor-default align-center'>Please Login To Access</h2>
                </div>
            </template>
            <template v-else>
                <router-view
                    :user='user'
                    :meta='meta'
                    :stacks='stacks'
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

export default {
    name: 'MLEnabler',
    data: function() {
        return {
            err: false,
            user: {
                name: false
            },
            stacks: {
                models: [],
                predictions: [],
                stacks: []
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
            if (token) {
                localStorage.token = token;
            }


            await this.getMeta();
            await this.getUser();
            this.getStacks();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getLogout: async function() {
            try {
                delete window.token;
                window.location.href = window.api;
            } catch (err) {
                this.err = err;
            }
        },
        getMeta: async function() {
            try {
                this.loading.meta = true;
                this.meta = await window.std('/api');
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
        },
        getStacks: async function() {
            try {
                this.stacks = await window.std('/api/stack');
            } catch(err) {
                console.error(err);
            }
        }
    },
    components: {
        Err
    }
}
</script>

<style>
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

