import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { buildStyle, getStyle, getStyleList } from "./lib/basemapkit";

(() => {
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  if (!appDiv) {
    return;
  }

  const protocol = new Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  console.log(getStyleList());

  const pmtiles = "https://fsn1.your-objectstorage.com/public-map-data/pmtiles/planet.pmtiles";
  const sprite = "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut";
  const glyphs = "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf";
  const lang = "fr";

  // const style = buildStyle({
  //   baseStyleName: "versatile",

  //   // If tiles are fetched directly on a public bucket as a single pmtiles file:
  //   pmtiles,

  //   // If pmtiles tiles are served as single MVT (using pmtiles CLI or Maplibre Martin) and referenced
  //   // with a tileJSON file:
  //   // tilejson: "http://localhost:8080/pmtiles/planet.json",

  //   sprite, glyphs, lang,

  //   hidePOIs: true,

  //   hideLabels: true,

  //   colorEdit: {
  //     // negate: true,
  //     // exposure: 1.9,
  //     saturation: -0.1,
  //     // contrast: [-0.1, 140],

  //     multiplyColor: ["#ff00d9", 0.1],
  //     // mixColor: ["#ff00d9", 0.2],
  //     // brightness: 0.2,
  //     hueRotation: 140,

      
  //   }
  // });



  const style = getStyle("versatile-blueprint", {
    pmtiles, sprite, glyphs, lang,
  })
  
  console.log(style);
  

  const map = new maplibregl.Map({
    container: appDiv,
    maxPitch: 89,
    hash: true,
    style,
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
