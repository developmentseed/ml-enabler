<template>
<div class='col col--12'>
    <div class='col col--12'>
        <label>Inferences List:</label>
        <label class='switch-container px6 fr'>
            <span class='mr6'>Binary Inference</span>
            <input :disabled='disabled || list.length !== 2' v-model='binary' type='checkbox' />
            <div class='switch'></div>
        </label>
    </div>

    <div class='col col--12 border border--gray-light py12 px12 round'>
        <div :key='l.name' v-for='l in list' class='col col--12 grid grid--gut12 py6'>
            <div class='col col--10'>
                <input :disabled='disabled' v-model='l.name' type='text' class='input w-full' placeholder='Class Name'/>
            </div>
            <div class='col col--2'>
                <input :disabled='disabled' v-model='l.color' type='color' class='input w-full h-full'>
            </div>
        </div>

        <div v-if='!disabled' class='col col--12 clearfix'>
            <button @click='add' class='btn btn--stroke round fr color-gray color-green-on-hover'>
                Add Class
            </button>
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'InfList',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        _binary: Boolean,
        _list: Array
    },
    data: function() {
        return {
            binary: false,
            list: []
        }
    },
    mounted: function() {
        if (this._binary) this.binary = this._binary;
        if (this._list) {
            this.list = this._list;
        } else {
            this.list.push({
                name: '',
                color: ''
            });
        }
    },
    watch: {
        binary: function() {
            this.$emit('binary', this.binary);
        },
        list: function() {
            this.$emit('list', this.list);
        }
    },
    methods: {
        add: function() {
            this.list.push({
                name: '',
                color: ''
            });
        }
    }
}
</script>
