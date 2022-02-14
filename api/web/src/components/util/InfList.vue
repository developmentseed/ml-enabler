<template>
<div class='col col--12'>
    <label>Inferences List:</label>
    <label class='switch-container px6 fr'>
        <span class='mr6'>Binary Inference</span>
        <input :disabled='list.length !== 2' v-model='binary' type='checkbox' />
        <div class='switch'></div>
    </label>
    <input v-model='list' type='text' class='input' placeholder='buildings,schools,roads,...'/>
</div>
</template>

<script>
export default {
    name: 'InfList',
    props: {
        disabled: {
            type: Boolean,
            default: false
        }
    },
    data: function() {
        return {
            binary: false,
            list: []
        }
    },
    watch: {
        binary: function() {
            this.$emit('binary', this.binary);
        },
        list: function() {
            this.$emit('list', this.list);
        }
    }
}
</script>
