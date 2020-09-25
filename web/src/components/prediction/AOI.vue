<template>
    <div class='grid grid--gut12 col col--12'>
        <div class='col col--6'>
            <label>Area Of Interest</label>
            <input v-model='name' type='text' class='input' placeholder='name' />
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
export default {
    name: 'AOI',
    props: ['mapbounds'],
    data: function() {
        return {
            name: '',
            bounds: ''
        }
    },
    watch: {
        mapbounds: function() {
            this.bounds = this.mapbounds
        }
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
        }
    }
}
</script>
