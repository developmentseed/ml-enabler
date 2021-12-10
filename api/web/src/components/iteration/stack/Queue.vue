<template>
<div class='col col--12 grid'>
    <div class='col col--12 pt12 pb6'>
        Queue Status

        <div class='fr'>
            <button @click='purgeQueue' class='btn mx3 round btn--stroke btn--gray btn--red-on-hover'>
                <svg class='icon'><use href='#icon-trash'/></svg>
            </button>
            <button @click='getQueue' class='btn mx3 round btn--stroke btn--gray'>
                <svg class='icon'><use href='#icon-refresh'/></svg>
            </button>
        </div>
    </div>
    <div class='col col--12 border border--gray-light grid round'>
        <template v-if='loading.queue'>
            <div class='flex-parent flex-parent--center-main w-full py24'>
                <div class='flex-child loading py24'></div>
            </div>
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

                <div class='flex-parent flex-parent--center-main col col--12 pb6'>
                    <div class='flex-child'>
                        <button :disabled='queue.dead === 0' class='btn btn--gray round btn--stroke btn--s'>Resubmit</button>
                    </div>
                </div>
            </div>
        </template>

        <template v-if='tasks.length > 0 && !loading.queue'>
            <div class='align-center w-full'>Queue Population Tasks</div>

            <div :key='task.id' v-for='task in tasks' class='col col--12 grid'>
                <div class='col col--6' v-text='task.id'></div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
export default {
    name: 'StackQueue',
    data: function() {
        return {
            loading: {
                queue: true
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
        this.refresh();
    },
    methods: {
        refresh: function() {
            this.getQueue();
            this.getTasks();
        },
        getTasks: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task`);
                this.tasks = res.tasks;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        purgeQueue: async function() {
            this.loading.queue = true;

            try {
                this.queue = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack/queue`, {
                    method: 'DELETE'
                });

            } catch (err) {
                this.$emit('err', err);
            }

            this.getQueue();
        },
        getQueue: async function() {
            this.loading.queue = true;

            try {
                this.queue = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack/queue`);

            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.queue = false;
        },
    }
}
</script>
