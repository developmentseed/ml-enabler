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
                <input disabled :value='username' class='input' placeholder='Username'/>
            </div>
            <div class='col col--6 pt12'>
                <label>Email:</label>
                <input disabled :value='email' class='input' placeholder='Email'/>
            </div>
            <div class='col col--12 clearfix pt12'>
                <button @click='saveEmail' class='btn btn--stroke btn--gray btn--s round fr'>Update Email</button>
                <button @click='savePassword' class='btn btn--stroke btn--gray btn--s round fr mr12'>Change Password</button>
            </div>
        </div>

        <ProfileTokens
            @err='$emit("err", $event)'
        />

    </div>
</template>

<script>
import ProfileTokens from './profile/ProfileTokens.vue'

export default {
    name: 'Profile',
    props: ['user'],
    data: function() {
        return {
            username: this.user.username,
            email: this.user.email
        }
    },
    components: {
        ProfileTokens
    },
    methods: {
        saveEmail: function() {

        },
        savePassword: function() {

        }
    }
}
</script>
