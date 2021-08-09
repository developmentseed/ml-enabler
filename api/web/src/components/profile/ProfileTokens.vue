<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light pt24'>
            <div class='col col--12'>
                <h2 class='txt-h4 ml12 pb12 fl'>API Tokens:</h2>

                <div class='fr'>
                    <button @click='newToken.show = true' class='btn round btn--stroke color-gray color-green-on-hover mx3'>
                        <svg class='icon'><use xlink:href='#icon-plus'/></svg>
                    </button>
                    <button @click='refresh' class='btn round btn--stroke color-gray mx3'>
                        <svg class='icon'><use xlink:href='#icon-refresh'/></svg>
                    </button>
                </div>
            </div>
        </div>

        <template v-if='loading'>
            <div class='flex-parent flex-parent--center-main w-full'>
                <div class='flex-child loading py24'></div>
            </div>
        </template>
        <template v-else-if='!tokens.length && !newToken.show'>
            <div class='col col--12'>
                <div class='flex-parent flex-parent--center-main'>
                    <div class='flex-child py24'>
                        <svg class='icon h60 w60 color-gray'><use href='#icon-info'/></svg>
                    </div>
                </div>
                <div class='w-full align-center'>You haven't created any API tokens yet</div>
            </div>
        </template>
        <template v-else>
            <template v-if='newToken.show && !newToken.token'>
                <div class='col col--12 border border--gray-light round my12'>
                    <div class='col col--12 grid grid--gut12 pl12 py6'>
                        <div class='col col--12 pb6'>
                            <h2 class='txt-bold fl'>Create New Token</h2>
                            <button @click='newToken.show = false' class='fr btn round btn--s btn--stroke btn--gray'>
                                <svg class='icon'><use xlink:href='#icon-close'/></svg>
                            </button>
                        </div>

                        <div class='col col--12'>
                            <label>Token Name</label>
                        </div>
                        <div class='col col--10'>
                            <input v-model='newToken.name' type='text' class='input' placeholder='Token Name'/>
                        </div>
                        <div class='col col--2'>
                            <button @click='setToken' class='fr btn btn--stroke round color-gray color-green-on-hover h-full w-full'>
                                <svg class='fl icon mt6'><use href='#icon-check'/></svg><span>Save</span>
                            </button>
                        </div>
                    </div>
                </div>
            </template>
            <template v-if='newToken.show && newToken.token'>
                <div class='col col--12 border border--gray-light round my12'>
                    <div class='col col--12 grid grid--gut12 pl12 py6'>
                        <div class='col col--12 pb6'>
                            <h2 class='txt-bold fl' v-text='newToken.name'></h2>
                            <button @click='newToken.show = false' class='fr btn round btn--s btn--stroke btn--gray'>
                                <svg class='icon'><use xlink:href='#icon-close'/></svg>
                            </button>
                        </div>

                        <div class='col col--12'>
                            <pre class='pre txt--s' v-text='newToken.token'/>
                        </div>
                    </div>
                </div>
            </template>
            <div :key='token.id' v-for='token in tokens' class='col col--12 grid bg-gray-light-on-hover cursor-default round px12 py12'>
                <div class='col col--10' v-text='token.name'></div>
                <div class='col col--2'>
                    <button @click='deleteToken(token.id)' class='fr btn round btn--s btn--stroke color-gray color-red-on-hover h-full'>
                        <svg class='icon'><use xlink:href='#icon-trash'/></svg>
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
export default {
    name: 'ProfileToken',
    props: [ ],
    data: function() {
        return {
            newToken: {
                show: false,
                name: '',
                token: false
            },
            tokens: [],
            loading: false
        };
    },
    mounted: function() {
        this.refresh();
    },
    watch: {
        'newToken.show': function() {
            if (!this.newToken.show) {
                this.newToken.name = '';
                this.newToken.token = '';
            }

            this.getTokens();
        }
    },
    methods: {
        refresh: function() {
            this.newToken.show = false;
            this.newToken.name = '';
            this.newToken.token = false;

            this.getTokens();
        },
        setToken: async function() {
            try {
                const body = await window.std('/api/token', {
                    method: 'POST',
                    body: {
                        name: this.newToken.name
                    }
                });

                this.newToken.token = body.token;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getTokens: async function() {
            this.loading = true;
            try {
                const tokens = await window.std('/api/token');

                this.tokens = tokens.tokens;
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        deleteToken: async function(token_id) {
            try {
                await window.std(`/api/token/${token_id}`, {
                    method: 'DELETE',
                });
            } catch (err) {
                this.$emit('err', err);
            }

            this.getTokens();
        }
    }
}
</script>
