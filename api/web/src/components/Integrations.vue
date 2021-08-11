<template>
    <div class="col col--12">
        <div class='grid grid--gut12'>
            <template v-if='integrations.length === 0'>
                <div class='col col--12 py6'>
                    <div class='flex-parent flex-parent--center-main pt36'>
                        <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                    </div>

                    <div class='flex-parent flex-parent--center-main pt12 pb36'>
                        <h1 class='flex-child txt-h4 cursor-default'>No Integrations Yet</h1>
                    </div>
                </div>
            </template>
            <template v-else>
                <div @click='$emit("integration", integration)' :key='integration.id' v-for='integration in integrations' class='cursor-pointer col col--12'>
                    <div class='col col--12 grid py6 px12 bg-darken10-on-hover'>
                        <h3 class='txt-h4 fl' v-text='integration.name'></h3>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script>

export default {
    name: 'Integrations',
    props: [],
    data: function() {
        return {
            integrations: []
        }
    },
    mounted: function() {
        this.refresh();
    },
    methods: {
        refresh: function() {
            this.getIntegration();
        },
        getIntegration: async function() {
            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/integration`)

                this.integrations = body.integrations;
                this.$emit('count', this.integrations.length);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
