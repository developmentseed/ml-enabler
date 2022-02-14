<template>
    <div class='col col--12 grid pt24'>
        <div class='col col--12 grid border-b border--gray-light'>
            <div class='col col--12'>

                <h2 class='txt-h4 ml12 pb12 fl'>Server Admin:</h2>
            </div>
        </div>

        <template v-if='user.access === "admin"'>
            <AdminMeta
                @err='$emit("err", $event)'
            />

            <AdminUser
                @err='$emit("err", $event)'
            />

            <AdminStacks
                @err='$emit("err", $event)'
            />
        </template>
        <template v-else>
            <div class='flex flex--center-main w-full'>
                <div class='flex-child py24'>
                    <svg class='icon h60 w60 color-gray'><use href='#icon-info'/></svg>
                </div>
            </div>
            <div class='w-full align-center txt-bold'>Admin Access Only</div>
        </template>
    </div>
</template>

<script>
import AdminUser from './admin/AdminUser.vue'
import AdminStacks from './admin/AdminStacks.vue'
import AdminMeta from './admin/AdminMeta.vue'

export default {
    name: 'Admin',
    props: ['user'],
    components: {
        AdminUser,
        AdminMeta,
        AdminStacks
    }
}
</script>
