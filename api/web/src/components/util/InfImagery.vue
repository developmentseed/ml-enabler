<template>
<div class='col col--12'>
    <div class='col col--12'>
        <label>Imagery Source</label>
    </div>

    <div class='col col--12 border border--gray-light py12 px12 round'>
        <template v-if='loading'>
            <Loading desc='Loading Imagery'/>
        </template>
        <template v-else-if='sources.length === 0'>
            <div class='flex flex--center-main pt36'>
                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex flex--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default'>An Imagery Source Must Be Created</h1>
            </div>
            <div class='flex flex--center-main pt12 pb36'>
                <button @click='$router.push({ path: `/project/${$route.params.projectid}/imagery` })' class='btn btn--stroke round fr color-green-light color-green-on-hover'>Create Imagery</button>
            </div>
        </template>
        <template v-else>
            <div @click='imagery = img.id' :key='img.id' v-for='img in sources' class='col col--12 bg-darken10-on-hover' :class='{
                "cursor-pointer": !disabled
            }'>
                <div class='w-full py6 px6' :class='{
                    "bg-gray-light": imagery === img.id
                }'>
                    <span class='txt-h4 round' v-text='img.name'/>
                    <div v-text='img.fmt' class='fr mx3 bg-blue-faint bg-blue-on-hover color-white-on-hover color-blue px6 py3 round txt-xs txt-bold'></div>
                </div>
            </div>
        </template>

        <div v-if='isWMS' class='col col--12 py12'>
            <label>Zoom Level</label>
            <label class='switch-container px6 fr'>
                <span class='mr6'>Supertile</span>
                <input :disabled='disabled' v-model='supertile' type='checkbox' />
                <div class='switch'></div>
            </label>
            <input :disabled='disabled' type='number' v-model='zoom' class='input' placeholder='18'/>
        </div>
    </div>
</div>
</template>

<script>
import Loading from './Loading.vue';

export default {
    name: 'InfImagery',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        _supertile: Boolean,
        _imagery: Number,
        _zoom: Number
    },
    data: function() {
        return {
            loading: true,
            sources: [],
            imagery: false,
            supertile: false,
            zoom: ''
        }
    },
    mounted: function() {
        if (this._imagery) this.imagery = this._imagery;
        if (this._supertile) this.supertile = this._supertile;
        if (this._zoom) this.zoom = this._zoom;

        this.getImagery();
    },
    watch: {
        imagery: function() {
            this.$emit('imagery', this.imagery);
        },
        supertile: function() {
            this.$emit('supertile', this.supertile);
        },
        zoom: function() {
            this.$emit('zoom', this.zoom);
        }
    },
    computed: {
        isWMS: function() {
            if (!this.imagery) return false;

            for (const img of this.sources) {
                if (img.id === this.imagery && img.fmt === 'wms') {
                    return true;
                }
            }

            return false;
        }
    },
    methods: {
        getImagery: async function() {
            this.loading = true;

            try {
                const imagery = await window.std(window.api + `/api/project/${this.$route.params.projectid}/imagery`);

                this.sources = imagery.imagery;

                if (imagery.total === 1) {
                    this.imagery = this.sources[0].id;
                }
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading = false;
        },
    },
    components: {
        Loading
    }
}
</script>
