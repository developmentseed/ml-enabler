<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span v-if='$route.params.integrationid'>Update Integration</span>
                <span v-else=''>Add Integration</span>
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
                            <option value='tasking'>Tasking Manager</option>
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
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/integration/${this.$route.params.integrationid}`, {
                    method: 'GET'
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);


                this.integration = body;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteIntegration: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/integration/${this.$route.params.integrationid}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to delete Integration');
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        postIntegration: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/integration${this.$route.params.integrationid ? '/' + this.$route.params.integrationid : ''}`, {
                    method: this.$route.params.integrationid ? 'PATCH' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        modelId: this.integration.modelId,
                        integration: this.integration.integration,
                        auth: this.integration.auth,
                        name: this.integration.name,
                        url: this.integration.url
                    })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);
                this.integration.integrationId = body.integrationId;
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
