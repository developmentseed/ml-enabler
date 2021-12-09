<template>
    <div class='col col--12'>
        <div class='col col--12 grid'>
            <div class='col col--12'>
                Vectorize Inferences

                <button @click='$emit("close")' class='btn fr round btn--stroke color-gray color-black-on-hover'>
                    <svg class='icon'><use href='#icon-close'/></svg>
                </button>
            </div>

            <div class='col col--12'>
                <label>Submission #</label>
                <div class='select-container w-full'>
                    <select v-model='config.submission' class='select select--s'>
                        <template v-for='s in submissions'>
                            <option v-bind:key='s.id' v-text='s.id'></option>
                        </template>
                    </select>
                    <div class='select-arrow'></div>
                </div>
            </div>

            <div class='col col--12 clearfix py12'>
                <button @click='createVectorize' class='flex-child btn btn--stroke round fr'>
                    Submit
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TaskVectorize',
    data: function() {
        return {
            loading: false,
            submissions: [],
            config: {
                submission: ''
            },
        }
    },
    mounted: function() {
        this.getSubmissions();
    },
    methods: {
        getSubmissions: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/submission`);
                this.submissions = res.submissions;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        createVectorize: async function() {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task`, {
                    method: 'POST',
                    body: {
                        type: 'vectorize',
                        data: {
                            submission: parseInt(this.config.submission)
                        }
                    }
                });

                this.$emit('close');
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
