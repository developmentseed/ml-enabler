<template>
    <div id="app" class='flex-parent flex-parent--center-main relative'>
        <div class='flex-child wmax600 col col--12'>
            <div class='flex-parent flex-parent--center-main py36'>
                <h1 @click='$router.push({ path: "/" })' class='flex-child txt-h3 cursor-default txt-underline-on-hover cursor-pointer'>ML Enabler</h1>
            </div>

            <router-view
                :meta='meta'
                :stacks='stacks'
                @err='err = $event'
            />
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
            stacks: {
                models: [],
                predictions: [],
                stacks: []
            },
            meta: {
                version: 1,
                environemnt: 'docker'
            }
        }
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: function() {
            this.getMeta();
            this.getStacks();
        },
        external: function(url) {
            if (!url) return;
            window.open(url, "_blank")
        },
        getMeta: function() {
            fetch(window.api + '/v1', {
                method: 'GET'
            }).then((res) => {
                return res.json();
            }).then((res) => {
                this.meta = res;
            }).catch((err) => {
                console.error(err);
            });
        },
        getStacks: function() {
            fetch(window.api + '/v1/stacks', {
                method: 'GET'
            }).then((res) => {
                return res.json();
            }).then((res) => {
                if (!res.error) {
                    this.stacks = res;
                }
            });
        }
    },
    components: {
        Err
    }
}
</script>