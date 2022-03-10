<template>
    <div class='col col--12'>
        <div class='col col--12 clearfix'>
            <button @click='$router.push(`/project/${$route.params.projectid}/iteration/${$route.params.iterationid}/tasks`)' class='mt6 btn btn--s round btn--stroke btn--gray fl'>
                <svg class='icon'><use href='#icon-arrow-left'/></svg>
            </button>

            <h2 class='txt-h4 ml12 fl'>Task #<span v-text='task.id'/> Logs</h2>

            <div v-if='loading.small' class='fr mr6 mt3 loading loading--s'></div>
        </div>

        <template v-if='loading.logs'>
            <Loading desc='Loading Logs'/>
        </template>
        <template v-else>
            <div class='col col--12 my12'>
                <div v-for='line in logs' :key='line.id' v-text='line.message' class='cursor-pointer bg-darken10-on-hover pre'></div>
            </div>
        </template>
    </div>
</template>

<script>
import Loading from '../../util/Loading.vue';

export default {
    name: 'Logs',
    props: ['iteration'],
    data: function() {
        return {
            logs: [{
                id: 1,
                message: 'NO LOGS FOUND'
            }],
            looping: false,
            task: {},
            loading: {
                logs: false,
                small: false
            }
        }
    },
    mounted: async function() {
        this.loading.logs = true;

        await this.getTask();
        await this.getLogs();

        this.looping = setInterval(() => {
            this.getLogs(true);
        }, 10 * 1000);
    },
    destroyed: function() {
        if (this.looping) clearInterval(this.looping);
    },
    methods: {
        getLogs: async function(no_load) {
            if (no_load) {
                this.loading.small = true;
            } else {
                this.loading.logs = true;
            }

            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task/${this.$route.params.taskid}/logs`);

                this.logs = body.logs;
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.logs = false;
            this.loading.small = false;
        },
        getTask: async function() {
            try {
                this.task = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task/${this.$route.params.taskid}`);
            } catch (err) {
                console.error(err)
                this.$emit('err', err);
            }
        },
    },
    components: {
        Loading
    }
}
</script>
