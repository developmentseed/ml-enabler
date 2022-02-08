<template>
    <div class="flex-inline py3">
        <button @click='mode !== "config" && $router.push({ name: "config" })' :class='{
            "btn--stroke": mode !== "config"
        }' class="btn btn--pill btn--pill-stroke btn--s btn--pill-hl round">Config</button>
        <button @click='mode !== "assets" && $router.push({ name: "assets" })' :class='{
            "btn--stroke": mode !== "assets"
        }' class="btn btn--pill btn--pill-stroke btn--s btn--pill-hc round">Assets</button>
        <button v-if='iteration.hint === "iteration"' @click='mode !== "stack" && $router.push({ name: "stack" })' :class='{
            "btn--stroke": mode !== "stack"
        }' class="btn btn--pill btn--s btn--pill-hc btn--pill-stroke round">Stack</button>
        <button @click='mode !== "map" && $router.push({ name: "map" })' :class='{
            "btn--stroke": mode !== "map"
        }' class="btn btn--pill btn--s btn--pill-hc btn--pill-stroke round">Inferences</button>
        <button @click='mode !== "export" && $router.push({ name: "export" })' :class='{
            "btn--stroke": mode !== "export"
        }' class="btn btn--pill btn--s btn--pill-hc btn--pill-stroke round">Export</button>
        <button @click='mode !== "tasks" && $router.push({ name: "tasks" })' :class='{
            "btn--stroke": mode !== "tasks"
        }' class="btn btn--pill btn--s btn--pill-hr btn--pill-stroke round">Tasks</button>
    </div>
</template>

<script>
export default {
    name: 'IterationHeader',
    props: ['iteration'],
    data: function() {
        return {
            mode: false
        };
    },
    mounted: function() {
        this.mode = this.$route.path.split('/')[this.$route.path.split('/').length - 1]
    }
}
</script>
