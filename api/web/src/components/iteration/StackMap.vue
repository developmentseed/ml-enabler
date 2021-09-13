<template>
    <div class='col col--12 grid grid--gut12 pt12'>
        <AOI
            :mapbounds='bounds'
            @bounds='bounds = $event'
            @submit='$emit("queue", poly)'
            @err='$emit("err", $event)'
        />

        <div id='map-container' class="col col--12 h600 w-full relative">
            <div id="map" class='w-full h-full'></div>
        </div>
    </div>
</template>

<script>
import AOI from './AOI.vue'

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import DrawRectangle from 'mapbox-gl-draw-rectangle-mode';

import bboxPolygon from '@turf/bbox-polygon';
import bbox from '@turf/bbox'

export default {
    name: 'StackMap',
    props: ['tilejson'],
    data: function() {
        return {
            map: false,
            draw: false,
            token: false,
            bounds: '',
            poly: {
                type: 'Feature',
                properties: { },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[[0,0],[0,0],[0,0],[0,0],[0,0]]]
                }
            }
        };
    },
    mounted: async function() {
        try {
            const body = await window.std(`/api/mapbox`);
            this.token = body.token;
            this.init();
        } catch (err) {
            this.$emit('err', err);
        }
    },
    watch: {
        bounds: function() {
            if (this.bounds.trim().length === 0) {
                this.map.getSource('bounds').setData({
                    type: 'FeatureCollection',
                    features: []
                });
                return;
            }

            const bounds = this.bounds.split(',');

            try {
                this.poly = {
                    type: 'Feature',
                    properties: {},
                    geometry: bboxPolygon(bounds).geometry
                };

                this.map.getSource('bounds').setData(this.poly);

                this.map.fitBounds([
                    [bounds[0], bounds[1]],
                    [bounds[2], bounds[3]]
                ]);
            } catch(err) {
                // TODO make input bar red?
                console.error(err);
            }

            this.draw.changeMode('draw_rectangle');
        }
    },
    methods: {
        init: function() {
            mapboxgl.accessToken = this.token;

            this.map = new mapboxgl.Map({
                container: 'map',
                zoom: 1,
                style: 'mapbox://styles/mapbox/satellite-streets-v11'
            });

            this.map.addControl(new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl
            }));

            const modes = MapboxDraw.modes;
            modes.draw_rectangle = DrawRectangle;

            this.draw = new MapboxDraw({
                displayControlsDefault: false,
                modes: modes
            });

            this.map.addControl(this.draw, 'top-left');
            this.draw.changeMode('draw_rectangle');

            this.map.on('draw.create', (f) => {
                this.bounds = bbox(f.features[0]).join(',');
                this.draw.deleteAll();
            });

            this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

            this.map.on('load', () => {
                this.map.addSource('bounds', {
                    type: 'geojson',
                    data: this.poly
                });

                this.map.addLayer({
                    'id': `bounds-layer`,
                    'type': 'fill',
                    'source': 'bounds',
                    'layout': {},
                    'paint': {
                        'fill-color': '#ff0000',
                        'fill-opacity': 0.5
                    }
                });
            });
        },
    },
    components: {
        AOI
    }
}
</script>
