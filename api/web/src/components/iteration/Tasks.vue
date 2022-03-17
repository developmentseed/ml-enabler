<template>
    <div class='col col--12'>
        <h2 class='w-full align-center txt-h4 py12'><span v-text='iteration.hint.charAt(0).toUpperCase() + iteration.hint.slice(1)'/> Tasks</h2>

        <div class='col col--12 grid border-b border--gray-light'>
            <div class='col col--2'>Type</div>
            <div class='col col--2'>Status</div>
            <div class='col col--3'>Note</div>
            <div class='col col--5 clearfix pr6'>
                <button class='dropdown btn fr h24 mb6 round btn--stroke btn--s color-gray color-green-on-hover'>
                    <svg class='icon fl'><use href='#icon-menu'/></svg>
                    <svg class='icon fl'><use href='#icon-chevron-down'/></svg>

                    <div class='round dropdown-content color-black' style='top: 24px;'>
                        <div @click='clearTasks' class='round bg-gray-faint-on-hover'>Clear</div>
                    </div>
                </button>
                <button class='dropdown btn fr h24 mr6 mb6 round btn--stroke btn--s color-gray color-green-on-hover'>
                    <svg class='icon fl'><use href='#icon-plus'/></svg>
                    <svg class='icon fl'><use href='#icon-chevron-down'/></svg>

                    <div class='round dropdown-content color-black' style='top: 24px;'>
                        <div @click='$emit("create", "vectorize")' class='round bg-gray-faint-on-hover'>Vectorize</div>
                        <div @click='$emit("create", "tfrecords")' class='round bg-gray-faint-on-hover'>TFRecords</div>
                        <div @click='$emit("create", "retrain")' class='round bg-gray-faint-on-hover'>Retraining</div>
                    </div>
                </button>
                <button @click='getTasks' class='mr6 btn fr round btn--stroke btn--gray color-green-on-hover'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>

                <div v-if='loading.tasks' class='fl mr6 mt3 loading loading--s'></div>
            </div>
        </div>
        <template v-if='loading.init'>
            <Loading desc='Loading Tasks'/>
        </template>
        <template v-else-if='loading.clear'>
            <Loading desc='Cleaning Up Tasks'/>
        </template>
        <template v-else-if='tasks.length === 0'>
            <div class='col col--12 py6'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>No Tasks Yet</h1>
                </div>
            </div>
        </template>
        <template v-else>
            <div @click='$router.push(`/project/${$route.params.projectid}/iteration/${$route.params.iterationid}/tasks/${task.id}/logs`)' :key='task.id' v-for='task in tasks' :class='{ "cursor-pointer": task.logs }' class='col col--12 grid py6 bg-gray-light-on-hover round'>
                <div class='col col--2 px6' v-text='task.type'></div>
                <template v-if='task._loading'>
                    <div class='col col--8 h24'>
                        <div class='loading loading--s'></div>
                    </div>
                </template>
                <template v-else>
                    <div class='col col--2 px6' v-text='task.status'></div>
                    <div class='col col--6 px6' v-text='task.statusReason'></div>
                </template>
                <div class='col col--2 px6 clearfix'>
                    <button @click.prevent.stop='deleteTask(task.id)' class='btn fr round btn--stroke btn--s btn--gray color-red-on-hover'>
                        <svg class='icon'><use href='#icon-trash'/></svg>
                    </button>
                    <div v-if='task.logs' class='fr bg-gray-faint color-gray inline-block px6 py3 round txt-xs txt-bold mr6'>
                        Logs
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'Tasks',
    props: ['iteration'],
    data: function() {
        return {
            init: true,
            tasks: [],
            looping: false,
            loading: {
                init: true,
                clear: false,
                tasks: true,
            }
        }
    },
    mounted: function() {
        this.getTasks();

        this.looping = setInterval(() => {
            this.getTasks(true);
        }, 10 * 1000);
    },
    unmounted: function() {
        if (this.looping) clearInterval(this.looping);
    },
    methods: {
        clearTasks: function() {
            this.loading.clear = true;

            for (const task of this.tasks) {
                this.deleteTask(task.id, false);
            }

            this.getTasks();

            this.loading.clear = false;
        },
        external: function(url) {
            if (!url) return;

            window.open(url, "_blank")
        },
        getTasks: async function() {
            if (this.init) {
                this.init = false;
                this.loading.init = true;
            } else {
                this.loading.tasks = true;
            }

            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task`);

                this.tasks = body.tasks.map((task) => {
                    task._loading = true;
                    return task;
                });
                this.tasks.forEach(task => this.getTask(task.id));
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.init = false;
            this.loading.tasks = false;
        },
        getTask: async function(task_id) {
            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task/${task_id}`);

                for (const task of this.tasks) {
                    if (task.id !== body.id) continue;
                    task.status = body.status;
                    task.statusReason = body.statusReason;
                    task.logs = body.logs;
                    task._loading = false;
                }
            } catch (err) {
                console.error(err)
                this.$emit('err', err);
            }
        },
        deleteTask: async function(task_id, refresh=true) {
            try {
                await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/task/${task_id}`, {
                    method: 'DELETE'
                });

                if (refresh) this.getTasks()
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
