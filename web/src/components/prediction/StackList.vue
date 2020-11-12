<template>
    <div class='col col--12 grid grid--gut12 pt12'>
        <label class='col col--10 pt12'>Submit "<span v-text='imagery.name'/>" For Inferencing</label>
        <div class='col col--2 mb12'>
            <button @click='$emit("queue")' class='fr btn btn--stroke round'>Submit</button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'StackList',
    props: ['imagery'],
    data: function() {
        return {};
    },
}
</script>
