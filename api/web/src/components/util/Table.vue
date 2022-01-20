<template>
<div class='grid col col--12'>
    <div class='col col--12 grid txt-bold border-b border--gray-light mt12'>
        <div :key='header._id' v-for='header in filter_h(h)' v-text='header.name' :class='[
            "col", `col--${header.size}`, "txt-truncate"
        ]'></div>
    </div>
    <div :key='_ri' v-for='(row, _ri) of d' class='col col--12 grid py6 px12 round bg-gray-light-on-hover cursor-pointer' :class='{
        "bg-gray-faint": _ri % 2
    }' @click='$emit("click", row)'>
        <div :key='ele.i' v-for='ele in filter_r(row)' v-text='ele.n' :class='[
            "col", `col--${h[ele.i].size}`, "txt-truncate"
        ]'></div>
    </div>
</div>
</template>

<script>
/*
 * Headers prop can be:
 * - CSV String
 * - Array of strings
 * - Array of Objects
 *   { name: "", size: "1-12" }
 */
export default {
    name: 'Table',
    props: ['headers', 'data'],
    data: function() {
        return {
            cols: 12,
            h: [],
            d: []
        };
    },
    mounted: function() {
        this.parseHeader();
        this.d = this.data;
    },
    methods: {
        filter_h: function(headers) {
            return headers.filter((h) => h.name[0] !== "_");
        },
        filter_r: function(row) {
            return row.map((h, i) => {
                return {
                    i: i,
                    n: h
                };
            }).filter((h) => {
                return this.h[h.i].name[0] !== "_";
            });
        },
        parseHeader() {
            let parsed;
            if (typeof this.headers === 'string') {
                parsed = this.headers.split(',').map((h) => {
                    return {
                        name: h
                    }
                });
            } else {
                parsed = this.headers.map((h) => {
                    if (typeof h === 'string') return { name: h };
                    return h;
                });
            }

            let unsized = 0;
            // Determine how many col slots are taken up
            for (let i = 0; i < parsed.length; i++) {
                if (parsed[i].name[0] === '_') continue;

                if (parsed[i].size) {
                    this.cols -= parsed[i].size;
                } else {
                    unsized++;
                }
            }

            let def = Math.floor(this.cols / unsized);
            for (let i = 0; i < parsed.length; i++) {
                if (parsed[i].name[0] === '_') continue;

                parsed[i]._id = i;

                if (!parsed[i].size && i == parsed.length - 1) {
                    parsed[i].size = this.cols;
                    this.cols = 0;
                } else if (!parsed[i].size) {
                    parsed[i].size = def;
                    this.cols -= def;
                }
            }

            this.h = parsed;
        }
    }
}
</script>
