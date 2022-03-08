<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light pt24'>
            <div class='col col--12'>
                <h2 class='txt-h4 ml12 pb12 fl'>
                    <span class='bg-red-faint color-red round inline-block px6 py3 txt-xs txt-bold'>Admin</span>
                    Users:
                </h2>

                <div class='fr'>
                    <button @click='newUser = true' class='btn round btn--stroke color-gray color-green-on-hover mr6'>
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
                    <label>Username/Email Filter</label>
                    <input v-model='filter' class='input' placeholder='john-doe' />
                </div>
            </div>
        </template>

        <template v-if='newUser'>
            <CreateUser
                @err='$emit("err", $event)'
                @close='getUsers'
            />
        </template>

        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else-if='!users.length'>
            <div class='flex flex--center-main w-full'>
                <div class='flex-child py24'>
                    <svg class='icon h60 w60 color-gray'><use href='#icon-info'/></svg>
                </div>
            </div>
            <div class='w-full align-center txt-bold'>No Users Found</div>
        </template>
        <template v-else>
            <div :key='user.id' v-for='user in users' class='col col--12 grid'>
                <div @click='user._open = !user._open' class='grid col col--12 bg-gray-light-on-hover cursor-pointer px12 py12 round'>
                    <div class='col col--3'>
                        <span v-text='user.username'/>
                    </div>
                    <div class='col col--6'>
                        <span v-text='user.email'/>
                    </div>
                    <div class='col col--3'>
                        <span class='fr bg-blue-faint color-blue round inline-block px6 py3 txt-xs txt-bold' v-text='user.access'></span>
                    </div>
                </div>

                <div v-if='user._open' class='col col--12 border border--gray-light round px12 py12 my6 grid'>
                    <h3 class='pb6'>User Flags</h3>
                </div>
            </div>
        </template>

        <Pager v-if='users.length' @page='page = $event' :perpage='perpage' :total='total'/>
    </div>
</template>

<script>
import Pager from '../util/Pager.vue';
import Loading from '../util/Loading.vue';
import CreateUser from './CreateUser.vue';

export default {
    name: 'ProfileAdminUser',
    props: [ ],
    data: function() {
        return {
            loading: false,
            filter: '',
            showFilter: false,
            page: 0,
            perpage: 10,
            total: 100,
            users: [],
            newUser: false
        };
    },
    mounted: function() {
        this.refresh();
    },
    watch:  {
        page: function() {
            this.getUsers();
        },
        filter: function() {
            this.page = 0;
            this.getUsers();
        }
    },
    methods: {
        refresh: function() {
            this.getUsers();
        },
        getUsers: async function() {
            this.newUser = false;
            this.loading = true;

            const url = new URL(`${window.api}/api/user`);
            url.searchParams.append('limit', this.perpage)
            url.searchParams.append('page', this.page)
            url.searchParams.append('filter', this.filter)

            try {
                const res = await window.std(url);

                this.loading = false;

                this.total = res.total;
                this.users = res.users.map((user) => {
                    user._open = false;
                    return user;
                });
            } catch (err) {
                this.$emit('err', err);
            }
        }
    },
    components: {
        CreateUser,
        Loading,
        Pager
    }
}
</script>
