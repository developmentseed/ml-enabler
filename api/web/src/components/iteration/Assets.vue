<template>
    <div class='col col--12'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <IterationHeader
                :iteration='iteration'
            />

            <div class='fr'>
                <button v-if='iteration.log_link' @click='logLink(iteration.log_link)' class='mx3 btn btn--s btn--stroke color-gray color-blue-on-hover round'><svg class='icon fl' style='margin-top: 4px;'><use href='#icon-link'/></svg>Build Log</button>
                <button v-if='iteration.dockerLink' @click='ecrLink(iteration.docker_link)' class='mx3 btn btn--s btn--stroke color-gray color-blue-on-hover round'><svg class='icon fl' style='margin-top: 4px;'><use href='#icon-link'/></svg> ECR</button>
            </div>
        </div>

        <h2 class='w-full align-center txt-h4 py12'><span v-text='iteration.hint.charAt(0).toUpperCase() + iteration.hint.slice(1)'/> Assets</h2>

        <template v-if='iteration.hint === "iteration" && !iteration.model_link'>
            <div class='align-center pb6'>Upload a model to get started</div>

            <UploadPrediction
                type='model'
                :iteration='iteration'
                @err='$emit("err", $event)'
                @close='$router.push({ name: "project", params: { projectid: $route.params.projectid } })'
            />
        </template>
        <template v-else-if='iteration.hint === "training" && !tilejson'>
            <div class='align-center pb6'>Upload GeoJSON Training Data to get started</div>

            <UploadPrediction
                type='inferences'
                :iteration='iteration'
                @err='$emit("err", $event)'
                @close='$router.push({ name: "project", params: { projectid: $route.params.projectid } })'
            />
        </template>
        <template v-else-if='meta.environment !== "aws"'>
            <div class='flex-parent flex-parent--center-main pt36'>
                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex-parent flex-parent--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default align-center'>Assets can only be created when MLEnabler is running in an "aws" environment</h1>
            </div>
        </template>
        <template v-else-if='
            !iteration.model_link
            && !iteration.tfrecord_link
            && !iteration.checkpoint_link
            && !iteration.save_link
            && !iteration.docker_link
        '>
            <div class='col col--12 py3'>
                <div class='align-center'>No Downloadable Assets</div>
            </div>
        </template>
        <template v-else>
            <div v-if='iteration.model_link' class='col col--12 py3'>
                <div class='col col--12 mb6'>
                    <span>TF Model</span>
                    <button @click='dwn("model")' class='mt6 btn btn--s btn--stroke round fr btn--gray'><svg class='icon'><use href='#icon-arrow-down'/></svg></button>
                </div>
                <pre class='pre w-full' v-text='"s3://" + iteration.model_link'/>
            </div>
            <div v-if='iteration.tfrecord_link' class='col col--12 py3'>
                <div class='col col--12 mb6'>
                    <span>TF Records</span>
                    <button @click='dwn("tfrecord")' class='mt6 btn btn--s btn--stroke round fr btn--gray'><svg class='icon'><use href='#icon-arrow-down'/></svg></button>
                </div>
                <pre class='pre' v-text='"s3://" + iteration.tfrecord_link'></pre>
            </div>
            <div v-if='iteration.checkpoint_link' class='col col--12 py3'>
                <div class='col col--12 mb6'>
                    <span>TF Checkpoint</span>
                    <button @click='dwn("checkpoint")' class='mt6 btn btn--s btn--stroke round fr btn--gray'><svg class='icon'><use href='#icon-arrow-down'/></svg></button>
                </div>
                <pre class='pre' v-text='"s3://" + iterationt.checkpoint_link'></pre>
            </div>
            <div v-if='iteration.save_link' class='col col--12 py3'>
                <div class='col col--12 mb6'>
                    <span>TFServing Container</span>
                    <button @click='dwn("container")' class='mt6 btn btn--s btn--stroke round fr btn--gray'><svg class='icon'><use href='#icon-arrow-down'/></svg></button>
                </div>
                <pre class='pre' v-text='"s3://" + iteration.save_link'></pre>
            </div>
            <div v-if='iteration.save_link' class='col col--12 py3'>
                <div class='align-center'>ECR Container</div>
                <pre class='pre' v-text='iteration.docker_link'></pre>
            </div>
        </template>
    </div>
</template>

<script>
import UploadPrediction from './UploadPrediction.vue';
import IterationHeader from './IterationHeader.vue';

export default {
    name: 'Assets',
    props: ['meta', 'iteration', 'tilejson'],
    data: function() {
        return { }
    },
    components: {
        IterationHeader,
        UploadPrediction
    },
    methods: {
        ecrLink(ecr) {
            const url = `https://console.aws.amazon.com/ecr/repositories/${ecr.split(':')[0]}/`;
            this.external(url);
        },
        logLink: function(stream) {
            const url = `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/%252Faws%252Fbatch%252Fjob/log-events/${encodeURIComponent(stream)}`
            this.external(url);
        },
        dwn: function(asset) {
            this.external(window.api + `/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/asset?type=${asset}&token=${localStorage.token}`)
        },
        external: function(url) {
            if (!url) return;

            window.open(url, "_blank")
        }
    }
}
</script>
