<template>
    <div class="col col--12">
        <div class='col col--12 clearfix py6'>
            <h2 class='fl cursor-default'>
                <span v-if='$route.params.imageryid'>Update Imagery</span>
                <span v-else>Add Imagery</span>
            </h2>

            <button @click='$router.go(-1)' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                <svg class='icon'><use href='#icon-close'/></svg>
            </button>

            <button v-if='$route.params.imageryid' @click='deleteImagery' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
        </div>
        <div class='border border--gray-light round col col--12 px12 py12 clearfix'>
            <div class='grid grid--gut12'>
                <div class='col col--8 py6'>
                    <label>Imagery Name</label>
                    <input v-model='imagery.name' class='input' placeholder='Imagery Name'/>
                </div>

                <div class='col col--4 py6'>
                    <label>Imagery Format</label>
                    <div class='select-container w-full'>
                        <select v-model='imagery.fmt' class='select'>
                            <option value='wms'>WMS</option>
                            <option value='list'>Chip List</option>
                        </select>
                        <div class='select-arrow'></div>
                    </div>
                </div>

                <div class='col col--12 py6'>
                    <label>Imagery Url</label>
                    <input v-model='imagery.url' class='input' placeholder='Imagery Name'/>
                </div>

                <div class='col col--12 py12'>
                    <template v-if='$route.params.imageryid'>
                        <button @click='postImagery' class='btn btn--stroke round fr color-blue-light color-green-on-hover'>Update Imagery</button>
                    </template>
                    <template v-else>
                        <button @click='postImagery' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Add Imagery</button>
                    </template>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
export default {
    name: 'Imagery',
    mounted: function() {
        if (this.$route.params.imageryid) {
            this.getImagery();
        }
    },
    data: function() {
        return {
            imagery: {
                imageryId: false,
                modelId: this.$route.params.modelid,
                name: '',
                fmt: 'wms',
                url: ''
            }
        };
    },
    methods: {
        getImagery: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/imagery/${this.$route.params.imageryid}`, {
                    method: 'GET'
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);

                this.imagery = body;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        deleteImagery: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/imagery/${this.$route.params.imageryid}`, {
                    method: 'DELETE'
                });
                if (!res.ok) throw new Error('Failed to delete imagery');
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        postImagery: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/imagery${this.$route.params.imageryid ? '/' + this.$route.params.imageryid : ''}`, {
                    method: this.$route.params.imageryid ? 'PATCH' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        modelId: this.imagery.modelId,
                        name: this.imagery.name,
                        url: this.imagery.url,
                        fmt: this.imagery.fmt
                    })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);
                this.$emit('refresh');
                this.$router.go(-1);
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
