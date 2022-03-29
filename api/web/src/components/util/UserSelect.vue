<template>
<div class='col col--12 grid'>
    <input v-model='filter' class='input' placeholder='username'/>

    <div class='col col--12 border border--gray-light mt6 round'>
        <template v-if='users.length'>
            <div @click='emit(u)' :key='u.id' v-for='u in users' class='col col--12 bg-darken10-on-hover cursor-pointer'>
                <div class='w-full py6 px6'>
                    <span class='txt-h4 round' v-text='u.username'/>
                    <span class='txt-h4 round fr' v-text='u.email'/>
                </div>
            </div>
        </template>
        <template v-else>
            <div class='flex flex--center-main'>
                <div>No Users Found</div>
            </div>
        </template>
    </div>
</div>
</template>

<script>
export default {
    name: 'UserSelect',
    props: {
        omitted: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    data: function() {
        return {
            filter: '',
            users: []
        }
    },
    mounted: function() {
        this.fetchUsers();
    },
    watch: {
        omitted: {
            deep: true,
            handler: function() {
                this.fetchUsers();
            }
        },
        filter: function() {
            this.fetchUsers();
        }
    },
    methods: {
        emit: function(u) {
            this.$emit('user', u);
            this.filter = '';
        },
        fetchUsers: async function() {
            try {
                const users = (await window.std(`/api/user?filter=${encodeURIComponent(this.filter)}&limit=10`)).users

                const final = [];
                for (const user of users) {
                    let omit = false;
                    for (const u of this.omitted) {
                        if (u.uid === user.id) {
                            omit = true;
                            break;
                        }
                    }

                    if (!omit) final.push(user);
                }

                this.users = final;
            } catch (err) {
                this.$emit('err', err);
            }
        }
    }
}
</script>
