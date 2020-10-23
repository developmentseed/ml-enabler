<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light pt24'>
            <div class='col col--12'>
                <h2 class='txt-h4 ml12 pb12 fl'>
                    <span class='bg-red-faint color-red round inline-block px6 py3 txt-xs txt-bold'>Admin</span>
                    Users:
                </h2>

                <div class='fr'>
                    <button @click='newUser.show = true' class='btn round btn--stroke color-gray color-green-on-hover mr6'>
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

        <template v-if='newUser.show'>
            <div class='col col--12 border border--gray-light round my12'>
                <div class='col col--12 grid grid--gut12 pl12 py6'>
                    <div class='col col--12 pb6'>
                        <h2 class='txt-bold fl'>Create New User</h2>
                        <button @click='newUser.show = false' class='fr btn round btn--s btn--stroke btn--gray'>
                            <svg class='icon'><use xlink:href='#icon-close'/></svg>
                        </button>
                    </div>

                    <div class='col col--4'>
                        <label>Username</label>
                        <input v-model='newUser.name' type='text' class='input' placeholder='Username'/>
                    </div>
                    <div class='col col--4'>
                        <label>Email</label>
                        <input v-model='newUser.email' type='text' class='input' placeholder='Email'/>
                    </div>
                    <div class='col col--4'>
                        <label>Access</label>
                        <div class='select-container w-full'>
                            <select v-model='newUser.access' class='select'>
                                <option>user</option>
                                <option>admin</option>
                            </select>
                            <div class='select-arrow'></div>
                        </div>
                    </div>

                    <div class='col col--12 mt12'>
                        <button @click='createUser' class='fr btn btn--stroke round color-gray color-green-on-hover'>
                            <svg class='fl icon mt6'><use href='#icon-check'/></svg><span>Create</span>
                        </button>
                    </div>
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
                        <span v-text='user.name'/>
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
            users: [],
            newUser: {
                show: false,
                name: '',
                email: '',
                access: 'user'
            }
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

            const url = new URL(`${window.location.origin}/v1/user`);
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
        createUser: function() {
            fetch(`${window.location.origin}/v1/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.newUser.name,
                    email: this.newUser.email,
                    access: this.newUser.access
                })
            }).then((res) => {
                if (!res.ok && res.statusCode !== 404 && res.message) {
                    throw new Error(res.message);
                } else if (!res.ok && res.statusCode !== 404) {
                    throw new Error('Failed to create user');
                }

                this.getUsers();
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
