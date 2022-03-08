<template>
    <div class="col col--12">
        <div class='col col--12'>
            <Upload
                :label='label'
                :url='url'
                :headers='headers'
                :mimetype='filetype'
                single=true
                err='error($event)'
                @ok='close'
            />
        </div>

    </div>
</template>

<script>
import Upload from '../util/Upload.vue';

export default {
    name: 'UploadPrediction',
    props: ['iteration', 'type'],
    data: function() {
        return {
            label: '',
            url: this.type === 'inferences'
                ? new URL(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/import`, window.location.origin)
                : new URL(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/asset?type=${this.type}`, window.location.origin),
            headers: {
                Authorization: `Bearer ${localStorage.token}`
            },
            filetype: ''
        };
    },
    mounted: function() {
        if (this.type === 'inferences') {
            this.label = 'Drop labels.geojson here';
            this.filetype = 'application/geo+json';
        } else if (this.iteration.model_type === 'pytorch') {
            this.label = `Drop pytorch.mar here`;
            this.filetype = 'application/octet-stream';
        } else if (this.iteration.model_type === 'tensorflow') {
            this.label = `Drop ${this.type}.zip here`;
            this.filetype = 'application/zip';
        } else {
            this.label = `Drop ${this.type}.zip here`;
            this.filetype = 'application/zip';
        }
    },
    methods: {
        detect: async function(file) {
            if (['geojson', 'geojsonld', 'ldgeojson', 'json'].includes(file.name.split('.')[1])) {
                return 'application/geo+json';
            } else if (['zip'].includes(file.name.split('.')[1])) {
                return 'application/zip';
            }
        },
        error: function(res) {
            this.$emit('err', new Error(JSON.parse(res).message));
        },
        close: function() {
            this.$emit('close');
        }
    },
    components: {
       Upload
    }
}
</script>
