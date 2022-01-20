<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light'>
            <div class='col col--12'>

                <h2 class='txt-h4 ml12 pb12 fl'>Profile:</h2>
            </div>
        </div>

        <div class='col col--12 grid grid--gut12'>
            <div class='col col--6 pt12'>
                <label>Username:</label>
                <input :value='user.username' class='input' placeholder='Username'/>
            </div>
            <div class='col col--6 pt12'>
                <label>Email:</label>
                <input :value='user.email' class='input' placeholder='Username'/>
            </div>
            <div class='col col--12 clearfix pt12'>
                <button disabled class='btn btn--stroke btn--gray btn--s round fr'>Update</button>
            </div>
        </div>

        <ProfileTokens
            @err='$emit("err", $event)'
        />

        <template v-if='user.access === "admin"'>
            <ProfileAdminUser
                @err='$emit("err", $event)'
            />

            <AdminStacks
                @err='$emit("err", $event)'
            />
        </template>
    </div>
</template>

<script>
import ProfileTokens from './profile/ProfileTokens.vue'
import ProfileAdminUser from './profile/ProfileAdminUser.vue'
import AdminStacks from './profile/AdminStacks.vue'

export default {
    name: 'Profile',
    props: ['user'],
    data: function() {
        return { };
    },
    methods: {
    },
    components: {
        ProfileTokens,
        ProfileAdminUser,
        AdminStacks
    }
}
</script>
