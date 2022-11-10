<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light pt24'>
            <div class='col col--12'>
                <h2 class='txt-h4 ml12 pb12 fl'>
                    <span class='bg-red-faint color-red round inline-block px6 py3 txt-xs txt-bold'>Admin</span>
                    Server Metadata:
                </h2>

                <div class='fr'>
                    <button @click='newMeta = true' class='btn round btn--stroke color-gray color-green-on-hover mr6'>
                        <svg class='icon'><use xlink:href='#icon-plus'/></svg>
                    </button>


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
                    <label>Metadata Key Filter</label>
                    <input v-model='filter' class='input' placeholder='john-doe' />
                </div>
            </div>
        </template>

        <template v-if='newMeta'>
            <CommonMetadata
                :existing='false'
                @err='$emit("err", $event)'
                @close='getMetas'
            />
        </template>
        <template v-else-if='editMeta'>
            <CommonMetadata
                :existing=editMeta
                @err='$emit("err", $event)'
                @close='getMetas'
            />
        </template>

        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else-if='!metas.length'>
            <div class='flex flex--center-main w-full'>
                <div class='flex-child py24'>
                    <svg class='icon h60 w60 color-gray'><use href='#icon-info'/></svg>
                </div>
            </div>
            <div class='w-full align-center txt-bold'>No Metadata Found</div>
        </template>
        <template v-else>
            <div :key='meta.key' v-for='meta in metas' class='col col--12 grid'>
                <div @click='meta._open = !meta._open' class='grid col col--12 bg-gray-light-on-hover cursor-pointer px12 py12 round'>
                    <span v-text='meta.key'/>
                </div>

                <div v-if='meta._open' class='col col--12 border border--gray-light round px12 py12 my6 grid'>
                    <div class='col col--12 relative'>
                        <button @click='editMeta = meta' class='btn btn--stroke round btn--gray absolute top right mr6 mt6'>
                            <svg class='icon h16 w16 color-gray'><use href='#icon-pencil'/></svg>
                        </button>
                        <div class='pre' v-text='meta.value'></div>
                    </div>
                </div>
            </div>
        </template>

        <Pager v-if='metas.length' @page='page = $event' :perpage='perpage' :total='total'/>
    </div>
</template>

<script>
import Pager from '../util/Pager.vue';
import Loading from '../util/Loading.vue';
import CommonMetadata from './Metadata.vue';

export default {
    name: 'AdminMeta',
    props: [ ],
    data: function() {
        return {
            loading: false,
            filter: '',
            showFilter: false,
            page: 0,
            perpage: 10,
            total: 100,
            metas: [],
            newMeta: false,
            editMeta: false
        };
    },
    mounted: function() {
        this.refresh();
    },
    watch:  {
        page: function() {
            this.getMetas();
        },
        filter: function() {
            this.page = 0;
            this.getMetas();
        }
    },
    methods: {
        refresh: function() {
            this.getMetas();
        },
        getMetas: async function() {
            this.newMeta = false;
            this.editMeta = false;
            this.loading = true;

            const url = new URL(`${window.api}/api/meta`);
            url.searchParams.append('limit', this.perpage)
            url.searchParams.append('page', this.page)
            url.searchParams.append('filter', this.filter)

            try {
                const res = await window.std(url);

                this.loading = false;

                this.total = res.total;
                this.metas = res.meta.map((meta) => {
                    meta._open = false;
                    return meta;
                });
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        CommonMetadata,
        Loading,
        Pager
    }
}
</script>
