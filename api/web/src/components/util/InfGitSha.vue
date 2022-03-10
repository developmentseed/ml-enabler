<template>
<div class='col col--12 grid'>
    <div class='col col--12'>
        <button @click='folding = !folding' class='btn btn--white color-gray px0'>
            <svg v-if='!folding' class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg>
            <svg v-else class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg>
            <span class='fl pl6'>Git Integration</span>
        </button>
    </div>

    <template v-if='!folding'>
        <div class='col col--12'>
            <label>GitSha</label>
            <input :disabled='disabled' v-model='version' class='input' placeholder='GitSha'/>
        </div>
    </template>
</div>
</template>

<script>
export default {
    name: 'InfGitSha',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        _gitsha: String
    },
    data: function() {
        return {
            version: '',
            folding: true
        }
    },
    mounted: function() {
        if (this._gitsha) {
            this.gitsha = this._gitsha;
        }
    },
    watch: {
        version: function() {
            this.$emit('gitsha', this.gitsha);
        }
    }
}
</script>
