<template>
    <div class='col col--12'>
        <textarea
            class='mt6 textarea w-full'
            v-model='list'
            placeholder='x-y-z'

            :class='{
                "textarea--border-red": isInvalid
            }'
        />

        <button @click='$emit("queue", list.split("\n"))' class='fr btn btn--stroke mt12 round'>Submit</button>
    </div>
</template>

<script>
export default {
    name: 'StackXYZ',
    props: [],
    data: function() {
        return {
            list: ''
        };
    },
    computed: {
        isInvalid() {
            if (this.list.trim().length === 0) return false;

            const list = this.list.split('\n');

            for (let tile of list) {
                tile = tile.split('-');
                if (tile.length !== 3) return true;

                for (let i of tile) {
                    if (isNaN(parseInt(i))) return true;
                }
            }

            return false;
        }
    }
}
</script>
