<template>
    <div class="col col--12">
        <div class='col col--12'>
            <file-pond
                name='model-upload'
                ref='pond'
                :label-idle='label'
                v-bind:allow-multiple='false'
                v-on:processfile='uploaded'
                :accepted-file-types='filetype'
                :fileValidateTypeDetectType='detect'
                allowRevert='false'
                :server='server'
                v-bind:files='files'
            />
        </div>

        <div v-if='done' class='col col--12 py12'>
            <button @click='close' class='btn btn--stroke round fr color-blue-light color-blue-on-hover'>Done</button>
        </div>
    </div>
</template>

<script>
import vueFilePond from 'vue-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
const FilePond = vueFilePond(FilePondPluginFileValidateType);

export default {
    name: 'UploadPrediction',
    props: ['prediction', 'type'],
    components: {
        FilePond
    },
    data: function() {
        return {
            done: false,
            files: [],
            label: '',
            server: {
                url: this.type === 'inferences'
                    ? `/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/import`
                    : `/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/asset?type=${this.type}`,
                process: {
                    onerror: this.error
                }
            },
            filetype: ''
        };
    },
    mounted: function() {
        if (this.type === 'inferences') {
            this.label = 'Drop labels.geojson here';
            this.filetype = 'application/geo+json';
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
        uploaded: function(err) {
            if (err) return;

            this.done = true;
        },
        close: function() {
            this.$emit('close');
        }
    }
}
</script>
