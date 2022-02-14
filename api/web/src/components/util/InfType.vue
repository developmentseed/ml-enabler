<template>
<div class='col col--12'>
    <label>Inference Type:</label>
    <div class='select-container w-full'>
        <select :disabled='disabled' v-model='type' class='select select--stroke'>
            <option value='classification'>Classification</option>
            <option value='detection'>Object Detection</option>
            <option value='segmentation'>Segmentation</option>
        </select>
        <div class='select-arrow'></div>
    </div>
</div>
</template>

<script>
export default {
    name: 'InfType',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        _type: String
    },
    data: function() {
        return {
            type: 'classification'
        }
    },
    mounted: function() {
        if (this._type) {
            this.type = this._type;
        }
    },
    watch: {
        type: function() {
            this.$emit('type', this.type);
        }
    }
}
</script>
