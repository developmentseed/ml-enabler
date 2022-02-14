<template>
<div class='col col--12'>
    <label><span v-text='version'/> Version</label>
    <input :disabled='disabled' v-model='version' class='input' placeholder='0.0.0'/>
</div>
</template>

<script>
export default {
    name: 'InfVersion',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        _version: String
    },
    data: function() {
        return {
            version: ''
        }
    },
    mounted: function() {
        if (this._version) {
            this.version = this._version;
        }
    },
    watch: {
        version: function() {
            this.$emit('version', this.version);
        }
    }
}
</script>
