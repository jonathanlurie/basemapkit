import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { makeStyle } from "./lib/pmbm";

(() => {
  const appDiv = document.querySelector<HTMLDivElement>("#app");

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
      // If tiles are fetched directly on a public bucket as a single pmtiles file:
      pmtiles: "https://fsn1.your-objectstorage.com/public-map-data/pmtiles/planet.pmtiles",

      // If pmtiles tiles are served as single MVT (using pmtiles CLI or Maplibre Martin) and referenced
      // with a tileJSON file:
      // tilejson: "http://localhost:8080/pmtiles/planet.json",

      sprite:
        "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut",
      glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
      lang: "fr",

      brightness: -0.3,
      // brightnessShift: -0.7,
      saturation: -0.8,
      // hueRotation: 10,
      multiplyColor: ["#171075", 0.6],
      // mixColor: ["#001580", 0.6],
      contrast: [1.2, 170],

    }),
    center: [0, 0],
    zoom: 3,
  });

  // Enable globe view
  map.on("style.load", () => {
    map.setProjection({
      type: ["interpolate", ["linear"], ["zoom"], 7, "vertical-perspective", 8, "mercator"],
    });
  });
})();
