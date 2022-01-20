<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light pt24'>
            <div class='col col--12'>
                <h2 class='txt-h4 ml12 pb12 fl'>
                    <span class='bg-red-faint color-red round inline-block px6 py3 txt-xs txt-bold'>Admin</span>
                    Stacks:
                </h2>

                <div class='fr'>
                    <button @click='showFilter = !showFilter' class='btn round btn--stroke color-gray mr6'>
                        <svg v-if='!showFilter' class='icon'><use href='#icon-search'/></svg>
                        <svg v-else class='icon'><use href='#icon-close'/></svg>
                    </button>

                    <button @click='refresh' class='btn round btn--stroke color-gray'>
                        <svg class='icon'><use xlink:href='#icon-refresh'/></svg>
                    </button>
                </div>
            </div>
        </div>

        <template v-if='showFilter'>
            <div class='col col--12 grid border border--gray px6 py6 round mb12 relative'>
                <div class='absolute triangle--u triangle color-gray' style='top: -12px; right: 75px;'></div>

                <div class='col col--12 px6'>
                    <label>Stack Name Filter</label>
                    <input v-model='filter' class='input' placeholder='project-1' />
                </div>
            </div>
        </template>

        <template v-if='loading'>
            <div class='flex-parent flex-parent--center-main w-full'>
                <div class='flex-child loading py24'></div>
            </div>
        </template>
        <template v-else-if='!stacks.length'>
            <div class='flex-parent flex-parent--center-main w-full'>
                <div class='flex-child py24'>
                    <svg class='icon h60 w60 color-gray'><use href='#icon-info'/></svg>
                </div>
            </div>
            <div class='w-full align-center txt-bold'>No Stacks Found</div>
        </template>
        <template v-else>
            <div :key='stack.id' v-for='stack in stacks' class='col col--12 grid'>
                <div @click='stack._open = !stack._open' class='grid col col--12 bg-gray-light-on-hover cursor-pointer px12 py12 round'>
                    <div class='col col--3'>
                        <span v-text='stack.StackName'/>
                    </div>
                    <div class='col col--6'>
                        <span v-text='stack.StackName'/>
                    </div>
                    <div class='col col--3'>
                        <span class='fr bg-blue-faint color-blue round inline-block px6 py3 txt-xs txt-bold' v-text='stack.StackName'></span>
                    </div>
                </div>

                <div v-if='stack._open' class='col col-12 border border--gray-light round px12 py12 my6 grid'>
                    <h3 class='pb6 w-full'>User Flags</h3>

                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: 'AdminStacks',
    props: [ ],
    data: function() {
        return {
            loading: false,
            filter: '',
            showFilter: false,
            stacks: []
        };
    },
    mounted: function() {
        this.refresh();
    },
    watch:  {
        filter: function() {
            this.getStacks();
        }
    },
    methods: {
        refresh: function() {
            this.getStacks();
        },
        getStacks: async function() {
            this.loading = true;

            const url = new URL(`${window.api}/api/stack`);
            url.searchParams.append('filter', this.filter);

            try {
                const res = await window.std(url);

                this.loading = false;

                this.stacks = res.stacks.map((stack) => {
                    stack._open = false;
                    return stack;
                });
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
