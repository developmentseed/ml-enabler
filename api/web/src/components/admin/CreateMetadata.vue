<template>
<div class='col col--12 border border--gray-light round my12'>
    <div class='col col--12 grid grid--gut12 pl12 py6'>
        <div class='col col--12 pb6'>
            <h2 class='txt-bold fl'>Create Metadata</h2>
            <button @click='$emit("close")' class='fr btn round btn--s btn--stroke btn--gray'>
                <svg class='icon'><use xlink:href='#icon-close'/></svg>
            </button>
        </div>

        <template v-if='loading'>
            <Loading desc='Saving Metadata'/>
        </template>
        <template v-else-if='!success'>
            <div class='col col--12'>
                <label>Key</label>
                <input v-model='key' type='text' class='input' placeholder='Key' :class='{
                     "input--border-red": attempted && !key
                }' />
            </div>
            <div class='col col--12'>
                <label>Value</label>
                <textarea row=10 v-model='value' type='text' class='input' placeholder='JSON Value' :class='{
                     "input--border-red": attempted && (!key || invalidjson)
                }'/>
            </div>

            <div class='col col--12 mt12'>
                <button @click='createMeta' class='fr btn btn--stroke round color-gray color-green-on-hover'>
                    <svg class='fl icon mt6'><use href='#icon-check'/></svg><span>Save</span>
                </button>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 flex flex--center-main py24'>
                <svg class='icon color-green w60 h60'><use href='#icon-check'/></svg>
            </div>
            <div class='col col--12 flex flex--center-main'>
                <div>Metadata Saved</div>
            </div>

            <button @click='$emit("close")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>OK</button>
        </template>
    </div>
</div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'CreateMeta',
    props: [ ],
    data: function() {
        return {
            loading: false,
            success: false,
            attempted: false,
            invalidjsonp: false,
            key: '',
            value: ''
        };
    },
    methods: {
        createMeta: async function() {
            try  {
                this.attempted = true;
                if (!this.key || !this.value) true;

                let value;
                try {
                    value = JSON.parse(this.value);
                } catch (err) {
                    this.invalidjson = true;
                    return;
                }
                this.invalidjson = false;

                this.loading = true;
                await window.std('/api/meta', {
                    method: 'POST',
                    body: {
                        key: this.key,
                        value: value,
                    }
                })

                this.success = true;
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        }
    },
    components: {
        Loading
    }
}
</script>
