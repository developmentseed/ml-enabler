<template>
    <div class='grid grid--gut12 col col--12'>
        <div class='col col--6'>
            <label>Area Of Interest</label>
            <vSelect
                v-model='name'
                :options='aois'
            />
        </div>
        <div class='col col--6'>
            <label>Bounding Box</label>
            <input v-model='bounds' type='text' class='input' placeholder='minX, minY, maxX, maxY'/>
        </div>

        <div class='col col--12 my12 pr12'>
            <button @click='postAOI' class='fr btn btn--stroke round'>Submit</button>
        </div>
    </div>
</template>

<script>
import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export default {
    name: 'AOI',
    props: ['mapbounds'],
    data: function() {
        return {
            name: '',
            bounds: '',
            aois: []
        }
    },
    watch: {
        mapbounds: function() {
            this.bounds = this.mapbounds
        }
    },
    mounted: function() {
        this.getAOI();
    },
    methods: {
        postAOI: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/aoi`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        pred_id: parseInt(this.$route.params.predid),
                        name: this.name,
                        bounds: this.bounds
                    })
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);

                this.$emit('submit');
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getAOI: async function() {
            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/aoi`, {
                    method: 'GET'
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);

                this.aois = body;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        vSelect
    }
}
</script>
