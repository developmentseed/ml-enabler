<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light pt24'>
            <div class='col col--12'>
                <h2 class='txt-h4 ml12 pb12 fl'>
                    <span class='bg-red-faint color-red round inline-block px6 py3 txt-xs txt-bold'>Admin</span>
                    Users:
                </h2>

                <div class='fr'>
                    <button @click='showFilter = !showFilter' class='btn round btn--stroke color-gray mr12'>
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


        <template v-if='loading'>
            <div class='flex-parent flex-parent--center-main w-full'>
                <div class='flex-child loading py24'></div>
            </div>
        </template>
        <template v-else-if='!users.length'>
            <div class='flex-parent flex-parent--center-main w-full'>
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

                <div v-if='user._open' class='col col-12 border border--gray-light round px12 py12 my6 grid'>
                    <h3 class='pb6 w-full'>User Flags</h3>

                    <div class='col col--6'>
                        <label class='checkbox-container'>
                            <input @change='patchUser(user)' v-model='user.flags.upload' type='checkbox' />
                            <div class='checkbox mr6'>
                                <svg class='icon'><use xlink:href='#icon-check' /></svg>
                            </div>
                            Source Upload
                        </label>
                    </div>
                    <div class='col col--6'>
                        <label class='checkbox-container'>
                            <input @change='patchUser(user)' v-model='user.flags.moderator' type='checkbox' />
                            <div class='checkbox mr6'>
                                <svg class='icon'><use xlink:href='#icon-check' /></svg>
                            </div>
                            Source Moderator
                        </label>
                    </div>
                </div>
            </div>
        </template>

        <Pager v-if='users.length' @page='page = $event' :perpage='perpage' :total='total'/>
    </div>
</template>

<script>
import Pager from '../util/Pager.vue';

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
            users: []
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
        getUsers: function() {
            this.loading = true;

            const url = new URL(`${window.location.origin}/api/user`);
            url.searchParams.append('limit', this.perpage)
            url.searchParams.append('page', this.page)
            url.searchParams.append('filter', this.filter)

            fetch(url, {
                method: 'GET'
            }).then((res) => {
                this.loading = false;

                if (!res.ok && res.statusCode !== 404 && res.message) {
                    throw new Error(res.message);
                } else if (!res.ok && res.statusCode !== 404) {
                    throw new Error('Failed to load users');
                }
                return res.json();
            }).then((res) => {
                this.total = res.total;
                this.users = res.users.map((user) => {
                    user._open = false;
                    return user;
                });
            }).catch((err) => {
                this.$emit('err', err);
            });
        },
        patchUser: function(user) {
            const url = new URL(`${window.location.origin}/api/user/${user.id}`);

            fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    flags: user.flags
                })
            }).then((res) => {
                if (!res.ok && res.message) {
                    throw new Error(res.message);
                } else if (!res.ok) {
                    throw new Error('Failed to update user');
                }
                return res.json();
            }).then((res) => {
                for (const key of Object.keys(res)) {
                    user[key] = res[key];
                }
            }).catch((err) => {
                this.$emit('err', err);
            });
        }
    },
    components: {
        Pager
    }
}
</script>
