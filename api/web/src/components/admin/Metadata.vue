<template>
<div class='col col--12 border border--gray-light round my12'>
    <div class='col col--12 grid grid--gut12 pl12 py6'>
        <div class='col col--12 pb6'>
            <h2 class='txt-bold fl'>Metadata Editor</h2>
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
                <input v-model='key' :disabled='existing' type='text' class='input' placeholder='Key' :class='{
                     "input--border-red": attempted && !key
                }' />
            </div>
            <div class='col col--12'>
                <label>Value</label>
                <textarea rows=10 v-model='value' type='text' class='input' placeholder='JSON Value' :class='{
                     "input--border-red": attempted && (!key || invalidjson)
                }'/>
            </div>

            <div class='col col--12 mt12 clearfix'>
                <button @click='deleteMeta' class='fl btn btn--stroke round color-gray color-red-on-hover'>
                    <svg class='fl icon mt6'><use href='#icon-trash'/></svg><span>Delete</span>
                </button>
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
                <div>Metadata <span v-text='success'/></div>
            </div>

            <button @click='$emit("close")' class='mt12 w-full color-gray color-green-on-hover btn btn--stroke round'>OK</button>
        </template>
    </div>
</div>
</template>

<script>
import Loading from '../util/Loading.vue';

export default {
    name: 'CommonMetadata',
    props: {
        existing: {
            type: [Boolean, Object],
            default: false
        }
    },
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
    mounted: function() {
        if (this.existing) {
            this.key = this.existing.key;
            this.value = JSON.stringify(this.existing.value, null, 4);
        }
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
                if (this.existing) {
                    await window.std(`/api/meta/${this.key}`, {
                        method: 'PATCH',
                        body: {
                            key: this.key,
                            value: value,
                        }
                    })
                } else {
                    await window.std('/api/meta', {
                        method: 'POST',
                        body: {
                            key: this.key,
                            value: value,
                        }
                    })
                }


                this.success = 'Saved';
            } catch (err) {
                this.$emit('err', err);
            }
            this.loading = false;
        },
        deleteMeta: async function() {
            this.loading = true;

            try {
                await window.std(`/api/meta/${this.key}`, {
                    method: 'DELETE',
                });

                this.success = 'Deleted';
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
