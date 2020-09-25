<template>
    <div class='grid grid--gut12 col col--12'>
        <div class='col col--6'>
            <div class='col col--12 clearfix'>
                <label class='fl'>Area Of Interest</label>

                <div class='fr'>
                    <button @click='mode = "new"' :class='{
                        "btn--stroke": mode !== "new"
                    }' class="btn btn--pill btn--pill-stroke btn--s btn--pill-hl round">New</button>
                    <button @click='mode = "existing"' :class='{
                        "btn--stroke": mode !== "existing"
                    }' class="btn btn--pill btn--s btn--pill-hr btn--pill-stroke round">Existing</button>
                </div>
            </div>

            <div class='col col--12 mt6'>
                <template v-if='mode === "existing"'>
                    <vSelect
                        class='w-full'
                        v-model='name'
                        :options='aois'
                    />
                </template>
                <template v-else>
                    <input v-model='name.label' type='text' class='input'/>
                </template>
            </div>
        </div>
        <div class='col col--6'>
            <label>Bounding Box</label>
            <input :disabled='mode === "existing"' v-model='bounds' type='text' class='input mt6' placeholder='minX, minY, maxX, maxY'/>
        </div>

        <div class='col col--12 my12 pr12'>
            <button :disabled='isSubmittable' @click='postAOI' class='fr btn btn--stroke round'>Submit</button>
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
            mode: 'new',
            name: {
                label: '',
                code: ''
            },
            bounds: '',
            aois: []
        }
    },
    computed: {
        isSubmittable: function() {
            if (this.mode === "existing") {
                return !name.code;
            } else {
                return !this.name.length && this.bounds.split(',').length !== 4;
            }
        }
    },
    watch: {
        mapbounds: function() {
            this.bounds = this.mapbounds
        },
        name: function() {
            console.error(this.name);
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

                this.aois = body.aois.map((aoi) => {
                    return {
                        label: aoi.name,
                        code: aoi.id
                    };
                });
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
