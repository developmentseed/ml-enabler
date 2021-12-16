<template>
<div class='col col--12 grid mb24'>
    <div class='col col--12 clearfix mb6'>
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

    <div class='col col--12 grid border border--gray-light round px12 py12'>
        <div class='col col--6 px6'>
            <div class='col col--12 mt6'>
                <label>AOI Name</label>
                <template v-if='mode === "existing"'>
                    <vSelect
                        class='w-full'
                        v-model='selected'
                        :options='aois'
                    />
                </template>
                <template v-else>
                    <input v-model='selected.label' type='text' class='input' placeholder='New York City, NY, USA'/>
                </template>
            </div>
        </div>

        <div class='col col--6 px6'>
            <label>Bounding Box</label>
            <input :disabled='mode === "existing"' v-model='selected.bounds' type='text' class='input mt6' placeholder='minX, minY, maxX, maxY'/>
        </div>

        <div class='col col--12 my12'>
            <button :disabled='isSubmittable' @click='postAOI' class='fr btn btn--stroke round'>Submit</button>
        </div>
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
            selected: {
                label: '',
                bounds: '',
                code: ''
            },
            aois: []
        }
    },
    computed: {
        isSubmittable: function() {
            return !this.selected.bounds && this.selected.bounds.split(',').length !== 4;
        }
    },
    watch: {
        'selected.bounds': function() {
            this.$emit('bounds', this.selected.bounds.join(','));
        },
        mode: function() {
            this.selected = {
                label: '',
                bounds: '',
                code: ''
            }
        },
        mapbounds: function() {
            this.selected.bounds = this.mapbounds
        },
    },
    mounted: function() {
        this.getAOI();
    },
    methods: {
        postAOI: async function() {
            if (this.mode === 'existing') {
                return this.$emit('submit');
            }

            try {
                await window.std(`/api/project/${this.$route.params.projectid}/aoi`, {
                    method: 'POST',
                    body: {
                        iter_id: parseInt(this.$route.params.iterationid),
                        name: this.selected.label,
                        bounds: this.selected.bounds.split(',').map((b) => Number(b))
                    }
                });

                this.$emit('submit');
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getAOI: async function() {
            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/aoi`);

                this.aois = body.aois.map((aoi) => {
                    return {
                        label: aoi.name,
                        bounds: aoi.bounds.bounds,
                        geom: aoi.bounds,
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
