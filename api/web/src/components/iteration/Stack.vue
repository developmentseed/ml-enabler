<template>
    <div class='col col--12'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <IterationHeader
                :iteration='iteration'
            />

            <div v-if='iteration.model_link' class='fr'>
                <button @click='refresh' v-tooltip='"Refresh Stack"' class='btn fr round btn--stroke btn--gray'>
                    <svg class='icon'><use href='#icon-refresh'/></svg>
                </button>

                <button v-if='complete.includes(stack.status)' @click='deleteStack' v-tooltip='"Delete Stack"' class='mr12 btn fr round btn--stroke color-gray color-red-on-hover'>
                    <svg class='icon'><use href='#icon-trash'/></svg>
                </button>
            </div>
        </div>

        <template v-if='meta.environment !== "aws"'>
            <div class='flex flex--center-main pt36'>
                <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
            </div>

            <div class='flex flex--center-main pt12 pb36'>
                <h1 class='flex-child txt-h4 cursor-default align-center'>Stacks can only be created when MLEnabler is running in an "aws" environment</h1>
            </div>
        </template>
        <template v-else-if='!iteration || loading.stack'>
            <Loading/>
        </template>
        <template v-else-if='!iteration.model_link'>
            <div class='col col--12 py6'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color--gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>A Model must be uploaded before a stack is created</h1>
                </div>
            </div>
        </template>
        <template v-else-if='stack.status === "None"'>
            <h2 class='w-full align-center txt-h4 py12'>Stack Creation</h2>

            <div class='col col--12 grid grid--gut12'>
                <template v-if='!advanced'>
                    <div class='col col--12'>
                        <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-else>
                    <div class='col col--12 border-b border--gray-light mb12'>
                        <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg><span class='fl pl6'>Advanced Options</span></button>
                    </div>
                </template>
                <template v-if='advanced'>
                    <div class='col col--6 py6'>
                        <label>Max Instance Count</label>
                        <input v-model='params.max_size' type='text' class='input'>
                    </div>
                    <div class='col col--6 py6'>
                        <label>Max Inference Concurrency</label>
                        <input v-model='params.max_concurrency' type='text' class='input'/>
                    </div>

                    <div class='col col--12'>
                        <label>Stack Tags</label>
                    </div>

                    <div class='col col--12 grid grid--gut12' :key='tag_idx' v-for='(tag, tag_idx) in params.tags'>
                        <div class='col col--4 py6'>
                            <input v-model='tag.Key' input='text' class='input w-full' placeholder='Key'/>
                        </div>
                        <div class='col col--7 py6'>
                            <input v-model='tag.Value' input='text' class='input w-full' placeholder='Value'/>
                        </div>
                        <div class='col col--1 py6'>
                            <button @click='params.tags.splice(tag_idx, 1)' class='btn btn--stroke round color-gray color-blue-on-hover h36'><svg class='icon'><use href='#icon-close'/></svg></button>
                        </div>
                    </div>

                    <div class='col col--12 py6'>
                        <button @click='params.tags.push({"Key": "", "Value": ""})' class='btn btn--stroke round color-gray color-blue-on-hover'><svg class='icon'><use href='#icon-plus'/></svg></button>
                    </div>
                </template>

                <div class='col col--12 clearfix py12'>
                    <button @click='createStack' class='fr btn btn--stroke color-gray color-green-on-hover round'>Create Stack</button>
                </div>
            </div>
        </template>
        <template v-else-if='submit'>
            <div class='flex flex--center-main w-full'>
                <div class='flex-child py24'>Inferences Submitted</div>
            </div>
            <div class='flex flex--center-main w-full'>
                <button @click='submit = false' class='flex-child btn btn--stroke color-gray color-blue-on-hover round'>Close</button>
            </div>
        </template>
        <template v-else-if='complete.includes(stack.status)'>
            <div class='col col--12 grid'>
                <div class='col col--12 grid'>
                    <span v-text='stack.name'/>
                </div>

                <StackQueue
                    @err='$emit("err", $event)'
                />

                <div class='col col--12 pt12'>
                    Imagery Chip Submission

                    <button class='dropdown round color-gray color-blue-on-hover mx12 mt3'>
                        <svg class='icon inline'><use href='#icon-options'/></svg>

                        <div class='round dropdown-content w180 color-black' style='top: 24px;'>
                            <label class='switch-container px6 fr'>
                                <span class='mr6'>Auto Terminate</span>
                                <input v-model='autoTerminate' type='checkbox' />
                                <div class='switch'></div>
                            </label>

                            <label class='switch-container px6 fr'>
                                <span class='mr6'>Auto Vectorize</span>
                                <input v-model='autoVectorize' type='checkbox' />
                                <div class='switch'></div>
                            </label>
                        </div>
                    </button>

                    <div v-if='imagery.fmt !== "list"' class='fr'>
                        <button @click='mode = "bbox"' :class='{
                            "btn--stroke": mode !== "bbox"
                        }' class="btn btn--pill btn--pill-stroke btn--s btn--pill-hl round">BBox</button>
                        <button @click='mode = "xyz"' :class='{
                            "btn--stroke": mode !== "xyz"
                        }' class="btn btn--pill btn--s btn--pill-hr btn--pill-stroke round">XYZ</button>
                    </div>

                </div>
                <div class='col col--12'>
                    <template v-if='imagery.fmt === "wms" && mode === "bbox"'>
                        <StackQueueAOI
                            v-on:queue='postQueue($event)'
                        />
                    </template>
                    <template v-else-if='imagery.fmt === "wms" && mode === "xyz"'>
                        <StackQueueXYZ
                            v-on:queue='postQueue($event)'
                        />
                    </template>
                    <template v-else-if='imagery.fmt === "list"'>
                        <StackQueueList
                            :imagery='imagery'
                            v-on:queue='postQueue($event)'
                        />
                    </template>
                    <template v-else>
                        <div class='flex flex--center-main w-full py24'>
                            <div class='flex-child py24'>Imagery Type Not Supported</div>
                        </div>
                    </template>
                </div>
            </div>
        </template>
        <template v-else-if='stack.status !== "None"'>
            <Loading :desc='stack.status'/>
        </template>
    </div>
</template>

<script>
import IterationHeader from './IterationHeader.vue';

import StackQueueList from './stack/QueueList.vue';
import StackQueueXYZ from './stack/QueueXYZ.vue';
import StackQueueAOI from './stack/QueueAOI.vue';

import StackQueue from './stack/Queue.vue';
import Loading from '../util/Loading.vue';

export default {
    name: 'Stack',
    props: ['meta', 'project', 'iteration'],
    data: function() {
        return {
            mode: 'bbox',
            advanced: false,
            complete: [
                'CREATE_COMPLETE',
                'UPDATE_COMPLETE'
            ],
            imagery: {},
            loading: {
                stack: true,
                queue: true
            },
            queue: {
                queued: 0,
                inflight: 0,
                dead: 0
            },
            autoTerminate: true,
            autoVectorize: true,
            looping: false,
            params: {
                image: false,
                max_size: '1',
                max_concurrency: '50',
                tags: []
            },
            submit: false,
            stack: {
                id: false,
                name: '',
                status: 'None'
            }
        };
    },
    watch: {
        submit: function() {
            this.refresh();
        },
        'params.type': function() {
            if (this.params.type === 'classification') {
                this.params.max_size = '1';
                this.params.max_concurrency = '50';
            } else if (this.params.type === 'detection') {
                this.params.max_size = '5';
                this.params.max_concurrency = '5';
            }
        }
    },
    mounted: function() {
        this.params.tags = JSON.parse(JSON.stringify(this.project.tags));
        this.refresh();
    },
    methods: {
        refresh: function() {
            this.getImagery();
            if (this.meta.environment === 'aws') {
                this.getStack();
                this.getQueue();
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
                //this.$emit('err', err);
            }

            this.loading.queue = false;
        },
        postQueue: async function(payload) {
            this.loading.stack = true;

            let reqbody;
            if (payload && payload.geometry) {
                reqbody = {
                    geometry: payload.geometry
                };
            } else if (payload) {
                reqbody = payload
            } else {
                reqbody = {};
            }

            reqbody.autoTerminate = this.autoTerminate;
            reqbody.autoVectorize = this.autoVectorize;

            try {
                await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack/queue`, {
                    method: 'POST',
                    body: reqbody
                });

                this.submit = true;
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.stack = false;
        },
        loop: function() {
            this.looping = true;

            if ([
                'None',
                'CREATE_COMPLETE',
                'UPDATE_COMPLETE',
                'DELETE_COMPLETE'
            ].includes(this.stack.status)) {
                this.looping = false;
                return;
            }

            setTimeout(() => {
                if ([
                    'None',
                    'CREATE_COMPLETE',
                    'UPDATE_COMPLETE',
                    'DELETE_COMPLETE'
                ].includes(this.stack.status)) {
                    this.looping = false;
                    return;
                }

                this.loop();
                this.getStack();
            }, 5000);
        },
        getStack: async function() {
            this.loading.stack = true;

            try {
                this.stack = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack`);
                if (!this.looping) this.loop();
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.stack = false;
        },
        deleteStack: async function() {
            this.loading.stack = true;

            try {
                const body = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack`, {
                    method: 'DELETE'
                });

                this.stack = body;
                this.loading.stack = false;

                if (!this.looping) this.loop();
            } catch (err) {
                this.$emit('err', err);
            }
        },
        emitmode: function(mode) {
            this.$emit('mode', mode);
        },
        getImagery: async function() {
            try {
                this.imagery = await window.std(`/api/project/${this.$route.params.projectid}/imagery/${this.iteration.imagery_id}`);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        createStack: async function() {
            if (this.params.type === 'classification' && !this.params.inferences) return;

            this.loading.stack = true;

            try {
                this.stack = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/stack`, {
                    method: 'POST',
                    body: {
                        tags: this.params.tags.map((tag) => {
                            return {
                                Key: tag.Key,
                                Value: tag.Value
                            };
                        }),
                        max_size: parseInt(this.params.max_size),
                        max_concurrency: parseInt(this.params.max_concurrency)
                    }
                });

                if (!this.looping) this.loop();
            } catch (err) {
                this.$emit('err', err);
            }

            this.loading.stack = false;

        }
    },
    components: {
        Loading,
        IterationHeader,
        StackQueueList,
        StackQueueXYZ,
        StackQueueAOI,
        StackQueue
    }
}
</script>

<style>
.dropdown {
    position: relative;
    display: inline-block;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    padding: 6px 12px;
    z-index: 1;
}

.dropdown:hover .dropdown-content {
    display: block;
}
</style>
