<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span v-if='$route.params.integrationid'>Update Integration</span>
                <span v-else>Add Integration</span>
            </h2>

            <button @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='$route.params.integrationid' @click='deleteIntegration' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <div class='grid grid--gut12'>
                <div class='col col--8'>
                    <label>Integration Name</label>
                    <input v-model='integration.name' class='input' placeholder='Integration Name'/>
                </div>

                <div class='col col--4'>
                    <label>Integration Type:</label>
                    <div class='select-container w-full'>
                        <select v-model='integration.integration' class='select'>
                            <option value='maproulette'>MapRoulette</option>
                        </select>
                        <div class='select-arrow'></div>
                    </div>
                </div>

                <div class='col col--8 pt6'>
                    <label>Integration Url</label>
                    <input v-model='integration.url' class='input' placeholder='Integration Name'/>
                </div>

                <div class='col col--4 pt6'>
                    <label>Integration Auth</label>
                    <input v-model='integration.auth' class='input' placeholder='Integration Auth'/>
                </div>

                <div class='col col--12 py12'>
                    <template v-if='$route.params.integrationid'>
                        <button @click='postIntegration' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update Integration</button>
                    </template>
                    <template v-else>
                        <button @click='postIntegration' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Integration</button>
                    </template>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'Integration',
    mounted: function() {
        if (this.$route.params.integrationid) {
            this.getIntegration();
        }
    },
    data: function() {
        return {
            integration: {
                id: false,
                integration: 'maproulette',
                modelId: false,
                name: '',
                auth: '',
                url: ''
            }
        };
    },
    methods: {
        getIntegration: async function() {
            try {
                this.integration = await window.std(`/api/project/${this.$route.params.projectid}/integration/${this.$route.params.integrationid}`)
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteIntegration: async function() {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}/integration/${this.$route.params.integrationid}`, {
                    method: 'DELETE'
                });
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        postIntegration: async function() {
            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/integration${this.$route.params.integrationid ? '/' + this.$route.params.integrationid : ''}`, {
                    method: this.$route.params.integrationid ? 'PATCH' : 'POST',
                    body: {
                        integration: this.integration.integration,
                        auth: this.integration.auth,
                        name: this.integration.name,
                        url: this.integration.url
                    }
                });

                this.integration.id = body.id;
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
