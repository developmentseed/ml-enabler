<template>
<div class='col col--12 grid'>
    <div class='col col--12 pt12 pb6'>
        Queue Status

        <div class='fr'>
            <div v-if='loading.mini' class='fl mr6 mt3 loading loading--s'></div>

            <button @click='purgeQueue' v-tooltip='"Purge Queue"' class='btn mx3 round btn--stroke btn--gray btn--red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
            <button @click='refresh' v-tooltip='"Refresh Queue"' class='btn mx3 round btn--stroke btn--gray'>
                <svg class='icon'><use href='#icon-refresh'/></svg>
            </button>
        </div>
    </div>
    <div class='col col--12 border border--gray-light grid round'>
        <template v-if='loading.main'>
            <Loading desc='Loading Queues'/>
        </template>
        <template v-else>
            <div class='col col--4'>
                <div class='align-center'>Queued</div>

                <div class='align-center' v-text='queue.queued'></div>
            </div>
            <div class='col col--4'>
                <div class='align-center'>Inflight</div>

                <div class='align-center' v-text='queue.inflight'></div>
            </div>
            <div class='col col--4'>
                <div class='align-center'>Failed</div>

                <div class='align-center' v-text='queue.dead'></div>

                <div class='flex flex--center-main col col--12 pb6'>
                    <div class='flex-child'>
                        <button :disabled='queue.dead === 0' class='btn btn--gray round btn--stroke btn--s'>Resubmit</button>
                    </div>
                </div>
            </div>
        </template>

        <template v-if='tasks.length > 0 && !loading.main'>
            <div class='col col--12 px12'>
                <div class='align-center w-full'>Recent Queue Population Tasks</div>

                <div :key='task.id' v-for='task in tasks' class='col col--12 grid'>
                    <div class='col col--4'>
                        <div v-text='datefmt(task.created)'></div>
                    </div>
                    <div class='col col--2'>
                        <div class='align-center w-full' v-text='task.status'></div>
                    </div>
                    <div class='col col--6 clearfix'>
                        <div class='fr' v-text='task.statusReason'></div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
import moment from 'moment';
import Loading from '../../util/Loading.vue';

export default {
    name: 'StackQueue',
    data: function() {
        return {
            loading: {
                main: true,
                mini: false
            },
            tasks: [],
            queue: {
                queued: 0,
                inflight: 0,
                dead: 0
            },
            looping: false,
        };
    },
    mounted: function() {
        this.looping = setInterval(() => {
            this.refresh(false);
        }, 10 * 1000);

        this.refresh();
    },
    destroyed: function() {
        if (this.looping) clearInterval(this.looping);
        this.looping = false;
    },
    methods: {
        datefmt: function(dt) {
             const date = new Date(dt);

             return date.getFullYear()
                + '-' + ('0' + date.getMonth()).substr(-2)
                + '-' + ('0' + date.getDay()).substr(-2)
                + ' ' + ('0' + date.getHours()).substr(-2)
                + ':' + ('0' + date.getMinutes()).substr(-2)
                + ':' + ('0' + date.getSeconds()).substr(-2);
        },
        refresh: async function(showLoading=true) {
            if (showLoading) {
                this.loading.main = true;
            } else {
                this.loading.mini = true;
            }

            await this.getQueue();
            await this.getTasks();

            this.loading.main = false;
            this.loading.mini = false;
        },
        getTasks: async function() {
            try {
                const url = new URL(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task`, window.api);
                url.searchParams.append('type', 'pop');
                url.searchParams.append('after', moment().add(-12, 'hours').toISOString());
                const res = await window.std(url);

                const tasks = [];
                for (const task of res.tasks) {
                    tasks.push(window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task/${task.id}`));
                }

                this.tasks = await Promise.all(tasks);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        purgeQueue: async function() {
            this.loading = true;

            try {
                this.queue = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack/queue`, {
                    method: 'DELETE'
                });

            } catch (err) {
                this.loading = false;
                this.$emit('err', err);
            }

            this.refresh();
        },
        getQueue: async function() {
            try {
                this.queue = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack/queue`);

            } catch (err) {
                this.$emit('err', err);
            }
        },
    },
    components: {
        Loading
    }
}
</script>
