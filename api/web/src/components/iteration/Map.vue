<template>
    <div class='col col--12'>
        <div class='col col--12 border-b border--gray-light clearfix mb6'>
            <IterationHeader
                :iteration='iteration'
            />
            <div class='fr'>
                <button @click='$emit("refresh")' class='mx3 btn btn--stroke color-gray color-blue-on-hover round'><svg class='icon fl'><use href='#icon-refresh'/></svg></button>
            </div>
        </div>
        <template v-if='loading'>
            <Loading/>
        </template>
        <template v-else-if='!submissions.length'>
            <div class='col col--12 py6'>
                <div class='flex flex--center-main pt36'>
                    <svg class='flex-child icon w60 h60 color-gray'><use href='#icon-info'/></svg>
                </div>

                <div class='flex flex--center-main pt12 pb36'>
                    <h1 class='flex-child txt-h4 cursor-default'>No Inferences Uploaded</h1>
                </div>
            </div>
        </template>
        <template v-else>
            <div class='col col--12 h600'>
                <div id='map-container' class="col col--12 h-full w-full relative">
                    <div class='bg-white round absolute top left z5 px12 py12 mx12 my12 w180'>
                        <div class='col col--12'>
                            <label>Submission #</label>
                            <div class='select-container' style='width: 100px;'>
                                <select v-model='submission' class='select select--stroke select--s'>
                                    <option v-for='s in submissions' v-bind:key='s.id' v-text='s.id'></option>
                                </select>
                                <div class='select-arrow'></div>
                            </div>

                            <button @click='bboxzoom' class='btn round btn--stroke fr btn--gray' style='height: 30px;'><svg class='icon'><use xlink:href='#icon-viewport'/></svg></button>
                        </div>
                        <div v-if='iteration.inf_type !== "segmentation"' class='col col--12'>
                            <label>Inference Type</label>
                            <div class='select-container w-full'>
                                <select v-model='inf' class='select select--s'>
                                    <option v-for='inf in iteration.inf_list' :key='inf.name' v-text='inf.name'></option>
                                </select>
                                <div class='select-arrow'></div>
                            </div>
                        </div>

                        <template v-if='!advanced'>
                            <div class='col col--12'>
                                <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-right'/></svg><span class='fl pl6'>Advanced Options</span></button>
                            </div>
                        </template>
                        <template v-else>
                            <div class='col col--12 border-b border--gray-light mb12'>
                                <button @click='advanced = !advanced' class='btn btn--white color-gray px0'><svg class='icon fl my6'><use xlink:href='#icon-chevron-down'/></svg><span class='fl pl6'>Advanced Options</span></button>
                            </div>
                        </template>

                        <template v-if='advanced'>
                            <div class='col col--12'>
                                <label>Opacity (<span v-text='opacity'/>%)</label>
                                <div class='range range--s color-gray'>
                                    <input v-on:input='opacity = parseInt($event.target.value)' type='range' min=0 max=100 />
                                </div>
                            </div>
                            <div v-if='iteration.inf_type !== "segmentation"' class='col col--12'>
                                <label>Threshold (<span v-text='threshold'/>%)</label>
                                <div class='range range--s color-gray'>
                                    <input v-on:input='threshold = parseInt($event.target.value)' type='range' min=0 max=100 />
                                </div>
                            </div>

                            <div class='col col--12'>
                                <label>Imagery</label>
                                <div class='select-container w-full'>
                                    <select v-model='bg' class='select select--stroke select--s'>
                                        <option value='default'>Default</option>
                                        <option v-for='img in imagery' v-bind:key='img.id' :value='img.id' v-text='img.name'></option>
                                    </select>
                                    <div class='select-arrow'></div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div class='bg-white round absolute top right z5 mx12 my12'>
                        <button @click='fullscreen' class='btn btn--stroke round btn--gray'>
                            <svg class='icon'><use xlink:href='#icon-fullscreen'/></svg>
                        </button>
                    </div>

                    <div v-if='iteration.inf_type !== "segmentation"' class='absolute z5 w180 bg-white round px12 py12' style='bottom: 40px; left: 12px;'>
                        <template v-if='inspect'>
                            <div class='flex flex--center-main'>
                                <div class='flex-child'>
                                    <svg class='icon w30 h30'><use xlink:href='#icon-info'/></svg>
                                </div>
                            </div>
                            <div class='flex flex--center-main'>
                                <div class='flex-child'>
                                    <span v-text='inf'></span>: <span v-text='(inspect * 100).toFixed(1)'></span>%
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <div class='flex flex--center-main'>
                                <div class='flex-child'>
                                    <svg class='icon w30 h30'><use xlink:href='#icon-cursor'/></svg>
                                </div>
                            </div>
                            <div class='flex flex--center-main'>
                                <div class='flex-child'>
                                    <div align=center>Hover for Details</div>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div id="map" class='w-full h-full'></div>
                </div>
            </div>
            <div class='flex flex--center-main my18'>
                <div class='w240 round shadow-darken10 px12 py12 txt-s'>
                    <div class='flex flex--center-main flex--center-cross align-center'>
                        <div class='flex-child flex-child--grow wmin24'>
                            <span class='inline-block w12 h12 round-full bg-gray-light'></span>
                        </div>
                        <div class='flex-child flex-child--grow wmin24'>
                            <span class='inline-block w12 h12 round-full bg-blue-light'></span>
                        </div>
                        <div class='flex-child flex-child--grow wmin24'>
                            <span class='inline-block w12 h12 round-full bg-pink-light'></span>
                        </div>
                    </div>
                    <div class='grid txt-xs align-center'>
                        <div class='col col--4'>Unvalidated</div>
                        <div class='col col--4'>Validated<br>True</div>
                        <div class='col col--4'>Validated <br>False</div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import Loading from '../util/Loading.vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import buffer from '@turf/buffer';
import bboxPolygon from '@turf/bbox-polygon';
import IterationHeader from './IterationHeader.vue';

export default {
    name: 'CommonMap',
    props: ['meta', 'iteration'],
    data: function() {
        return {
            loading: true,
            integration: false,
            clickListener: false,
            popup: false,
            popupid: false,
            bg: 'default',
            inf: false,
            inspect: false,
            advanced: false,
            threshold: 50,
            opacity: 50,
            map: false,
            imagery: [],
            aois: [],
            submission: false,
            submissions: [],
            inferences: [],
            tilejson: false
        };
    },
    watch: {
        aoi: function() {
            for (const aoi of this.aois) {
                if (aoi.name !== this.aoi) continue;

                const bounds = aoi.bounds.bounds;
                this.map.fitBounds([
                    [bounds[0], bounds[1]],
                    [bounds[2], bounds[3]]
                ]);
            }
        },
        submission: async function() {
            await this.getSubmissionTileJSON();

            if (this.submission !== this.$route.params.subid) {
                this.$router.push(`/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/map/${this.submission}`);
            }

            if (!this.map) await this.init();
            this.styles();
        },
        bg: function() {
            this.background();
        },
        opacity: function() {
            if (this.iteration.inf_type === 'segmentation') {
                this.map.setPaintProperty(
                    `tiles`,
                    'raster-opacity',
                    this.opacity / 100
                );
            } else {
                for (const inf of this.iteration.inf_list) {
                    this.map.setPaintProperty(
                        `inf-${inf.name}`,
                        'fill-opacity',
                        [ 'number', [ '*', ['get', inf], (this.opacity / 100) ] ]
                    );
                }
            }
        },
        threshold: function() {
            for (const inf of this.iteration.inf_list) {
                this.filter(inf);
            }
        },
        inf: function() {
            this.hide();
        }
    },
    mounted: async function() {
        await this.getAOIs();
        await this.getSubmissions();
        await this.getImagery();

        this.inf = this.iteration.inf_list[0];

        this.loading = false;

        if (this.submissions.length && !this.$route.params.subid) {
            this.submission = this.submissions[0].id;
        } else if (this.$route.params.subid) {
            this.submission = this.$route.params.subid;
        }
    },
    methods: {
        init: function() {
            return new Promise((resolve) => {
                this.$nextTick(() => {
                    mapboxgl.accessToken = this.tilejson.token;

                    this.map = new mapboxgl.Map({
                        container: 'map',
                        bounds: this.tilejson.bounds,
                        style: 'mapbox://styles/mapbox/satellite-streets-v11'
                    });

                    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

                    this.map.on('load', resolve);
                });
            });
        },
        infValidity: async function(id, valid) {
            this.popup.remove();

            const prop = {};
            prop[`v_${this.inf}`] = valid;
            this.map.setFeatureState({
                id: id,
                source: 'tiles',
                sourceLayer: 'data'
            }, prop);

            const reqbody = {
                id: id,
                validity: {}
            };

            reqbody.validity[this.inf] = valid;

            try {
                const res = await fetch(window.api + `/v1/model/${this.$route.params.modelid}/prediction/${this.$route.params.predid}/validity`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reqbody)
                });

                const body = await res.json();
                if (!res.ok) throw new Error(body.message);
            } catch (err) {
                this.$emit('err', err);
            }
        },
        hide: function() {
            if (!this.map) return;

            for (const inf of this.iteration.inf_list) {
                this.map.setLayoutProperty(`inf-${inf.name}`, 'visibility', 'none');
            }

            this.map.setLayoutProperty(`inf-${this.inf.name}`, 'visibility', 'visible');
        },
        background: function() {
            this.map.once('styledata', () => {
                this.styles();
            });

            if (this.bg === 'default') {
                this.map.setStyle('mapbox://styles/mapbox/satellite-streets-v11', {
                    diff: false
                });
            } else {
                for (const img of this.imagery) {
                    if (img.id === this.bg) {
                        this.map.setStyle({
                            version: 8,
                            sources: {
                                'raster-tiles': {
                                    type: 'raster',
                                    tiles: [ img.url ]
                                }
                            },
                            layers:  [{
                                id: 'simple-tiles',
                                type: 'raster',
                                source: 'raster-tiles',
                                minzoom: 0,
                                maxzoom: 22
                            }]
                        }, {
                            diff: false
                        });
                        break;
                    }
                }
            }
        },
        bboxzoom: function() {
            this.map.fitBounds([
                [this.tilejson.bounds[0], this.tilejson.bounds[1]],
                [this.tilejson.bounds[2], this.tilejson.bounds[3]]
            ]);
        },
        filter: function(inf) {
            this.map.setFilter(`inf-${inf.name}`, ['>=', inf, this.threshold / 100]);
        },
        styles: function() {
            if (this.tilejson.tiles[0].match(/\.png$/)) {
                if (this.map.getSource('tiles')) {
                    this.map.removeLayer('tiles');
                    this.map.removeSource('tiles');
                }

                this.map.addSource('tiles', {
                    type: 'raster',
                    scheme: 'xyz',
                    tileSize: 256,
                    tiles: [ window.location.origin + this.tilejson.tiles[0] + `?token=${encodeURIComponent(localStorage.token)}` ],
                });

                this.map.addLayer({
                    id: `tiles`,
                    type: 'raster',
                    source: 'tiles',
                    paint: {
                        'raster-opacity': this.opacity / 100
                    }
                });
            } else {
                this.map.addSource('tiles', {
                    type: 'vector',
                    tiles: [ window.location.origin + this.tilejson.tiles[0] + `?token=${encodeURIComponent(localStorage.token)}` ],
                    minzoom: this.tilejson.minzoom,
                    maxzoom: this.tilejson.maxzoom
                });

                for (const inf of this.iteration.inf_list) {
                    this.map.addLayer({
                        id: `inf-${inf.name}`,
                        type: 'fill',
                        source: 'tiles',
                        'source-layer': 'data',
                        paint: {
                            'fill-color': [
                                'case',
                                ['==', ["feature-state", `v_${inf}`], false], '#ec747e',
                                ['==', ["feature-state", `v_${inf}`], true], '#00b6b0',
                                ['==', ['get', `v_${inf}`], false], '#ec747e',
                                ['==', ['get', `v_${inf}`], true], '#00b6b0',
                                '#ffffff'
                            ],
                            'fill-opacity': [
                                'number',
                                [ '*', ['get', inf], (this.opacity / 100) ]
                            ]
                        }
                    });

                    this.filter(inf);

                    if (!this.clickListener) {
                        this.map.on('click', `inf-${inf}`, (e) => {
                            if (
                                e.features.length === 0
                                || !e.features[0].properties[this.inf.name]
                                || e.features[0].properties[this.inf.name] === 0
                            ) return;

                            this.popupid = e.features[0].id;

                            this.popup = new mapboxgl.Popup({
                                className: 'infpop'
                            })
                                .setLngLat(e.lngLat)
                                .setHTML(`
                                    <div class='col col--12'>
                                        <h1 class="txt-h5 mb3 align-center">Inf Geom</h1>
                                        <button id="${inf}-valid" class="w-full round btn btn--gray color-green-on-hover btn--s btn--stroke mb6">Valid</button>
                                        <button id="${inf}-invalid" class="w-full round btn btn--gray color-red-on-hover btn--s btn--stroke">Invalid</button>
                                    </div>
                                `)
                                .setMaxWidth("200px")
                                .addTo(this.map);

                            this.$nextTick(() => {
                                document.querySelector(`#${inf}-valid`).addEventListener('click', () => {
                                    this.infValidity(this.popupid, true)
                                });
                                document.querySelector(`#${inf}-invalid`).addEventListener('click', () => {
                                    this.infValidity(this.popupid, false)
                                });
                            });
                        });

                        this.map.on('mousemove', `inf-${inf}`, (e) => {
                            if (
                                e.features.length === 0
                                || !e.features[0].properties[this.inf.name]
                                || e.features[0].properties[this.inf.name] === 0
                            ) {
                                this.map.getCanvas().style.cursor = '';
                                this.inspect = false;
                                return;
                            }

                            this.map.getCanvas().style.cursor = 'pointer';

                            this.inspect = e.features[0].properties[this.inf.name];
                        });
                    }
                }
                this.clickListener = true;

                this.hide();
            }

            const polyouter = buffer(bboxPolygon(this.tilejson.bounds), 0.3);
            const polyinner = buffer(bboxPolygon(this.tilejson.bounds), 0.1);

            const poly = {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [
                            polyouter.geometry.coordinates[0],
                            polyinner.geometry.coordinates[0]
                        ]
                    }
                }]
            };

            if (!this.map.getSource('bbox')) {
                this.map.addSource('bbox', {
                    type: 'geojson',
                    data: poly
                });
            }

            if (!this.map.getLayer('bbox-layer')) {
                this.map.addLayer({
                    'id': `bbox-layer`,
                    'type': 'fill',
                    'source': 'bbox',
                    'paint': {
                        'fill-color': '#ffffff',
                        'fill-opacity': 1
                    }
                });
            }

        },
        fullscreen: function() {
            const container = document.querySelector('#map-container');

            if (!document.fullscreen) {
                 container.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        },
        getImagery: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/imagery`);
                this.imagery = res.imagery;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getSubmissionTileJSON: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/submission/${this.submission}/tiles`);
                this.tilejson = res;
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getSubmissions: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/iteration/${this.$route.params.iterationid}/submission`);
                this.submissions = res.submissions.filter((s) => {
                    return s.tiles;
                });
            } catch (err) {
                this.$emit('err', err);
            }
        },
        getAOIs: async function() {
            try {
                const res = await window.std(`/api/project/${this.$route.params.projectid}/aoi`);
                this.aois = res.aois;
            } catch (err) {
                this.$emit('err', err);
            }
        },
    },
    components: {
        Loading,
        IterationHeader
    }
}
</script>
