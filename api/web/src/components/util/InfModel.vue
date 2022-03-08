<template>
<div class='col col--12'>
    <label>Model Type:</label>
    <div class='select-container w-full'>
        <select :disabled='disabled' v-model='model' class='select select--stroke'>
            <option value='tensorflow'>Tensorflow</option>
            <option value='pytorch'>PyTorch</option>
        </select>
        <div class='select-arrow'></div>
    </div>
</div>
</template>

<script>
export default {
    name: 'InfModel',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        _model: String
    },
    data: function() {
        return {
            model: 'tensorflow'
        }
    },
    mounted: function() {
        if (this._model) {
            this.model = this._model;
        }
    },
    watch: {
        model: function() {
            this.$emit('model', this.model);
        }
    }
}
</script>
