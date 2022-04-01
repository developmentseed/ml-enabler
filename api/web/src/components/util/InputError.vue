<template>
<div class='col col--12 round py3 bg-red mt6 align-center color-white'>
    <span v-text='desc'/>
</div>
</template>

<script>
export default {
    name: 'InputError',
    props: {
        desc: String
    }
}
</script>

