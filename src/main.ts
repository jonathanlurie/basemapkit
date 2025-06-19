import "maplibre-gl/dist/maplibre-gl.css";
import './style.css'
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import { makeStyle } from "./lib";

(() => {
  const appDiv = document.querySelector<HTMLDivElement>('#app');

  if (!appDiv) {
    return;
  }

  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  const map = new maplibregl.Map({
    container: appDiv,
    maxPitch: 89,
    hash: true,
    style: makeStyle({
      pmtiles: "https://fsn1.your-objectstorage.com/public-map-data/pmtiles/planet.pmtiles",
      sprite: "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut",
      glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
      lang: "dep"
    }),
    center: [0, 0],
    zoom: 3,
  });

  // Enable globe view
  map.on('style.load', () => {
    map.setProjection({
      // type: 'mercator',
      type: [
        "interpolate",
        ["linear"],
        ["zoom"],
        7,
        "vertical-perspective",
        8,
        "mercator"
      ]
    });
  });


})()