import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { buildStyle, getStyle, getStyleList } from "./lib/basemapkit";

const defaultCustomStyle = `
{
  // Invert the image color:
  "negate": false,

  // Ratio relative to current brightness.
  // Value in [-1, 1] but the range is actually open
  "brightness": 0,

  // Absolute brightness shift
  // Value in [-1, 1] but the range is actually open
  "brightnessShift": 0,

  // Exposure, like brightness but more preserving
  // Value in [-1, 1] but the range is actually open
  "exposure": 0,

  //  Rotate the hue wheel
  // Value in [-180, 180]
  "hueRotation": 0,

  // Modifiy color saturation
  // Value in [-1, 1] but the range is actually open
  "saturation": 0
}
`;

(() => {
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  const styleDD = document.getElementById("style-dd") as HTMLSelectElement;

  for (const styleId of getStyleList()) {
    const styleDdOption = document.createElement("option");
    styleDdOption.value = styleId;
    styleDdOption.innerText = styleId;
    styleDD.appendChild(styleDdOption);
  }

  // A custom option to show the custom panel
  const styleDdOption = document.createElement("option");
  styleDdOption.value = "custom";
  styleDdOption.innerText = "🖌️ custom 🎨";
  styleDD.appendChild(styleDdOption);

  if (!appDiv) {
    return;
  }

  maplibregl.addProtocol("pmtiles", new Protocol().tile);

  const pmtiles = "https://fsn1.your-objectstorage.com/public-map-data/pmtiles/planet.pmtiles";
  const sprite = "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut";
  const glyphs = "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf";
  const lang = "en";

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


  
  const map = new maplibregl.Map({
    container: appDiv,
    maxPitch: 89,
    hash: true,
    style: getStyle("versatile", {
      pmtiles, sprite, glyphs, lang,
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

  // Update the style based on the dropdown
  styleDD.addEventListener("change", (e: Event) => {
    const selectedStyle = (e.target as HTMLSelectElement).value;

    if (selectedStyle !== "custom") {
      map.setStyle(getStyle(selectedStyle, {
        pmtiles, sprite, glyphs, lang,
      }), {diff: false});
      return;
    }

    // The custom mode always starts with the versatile default style
    map.setStyle(getStyle("versatile", {
      pmtiles, sprite, glyphs, lang,
    }), {diff: false});
  });

  const validateStyleBt = document.getElementById("validate-style-bt") as HTMLButtonElement;
  const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;

  codeEditor.value = defaultCustomStyle;

  validateStyleBt.addEventListener("pointerup", (e) => {
    const jsonStr = codeEditor.value
      .split("\n")
      .map(l => l.trim())
      .filter(l => !l.startsWith("//"))
      .join("\n")
     
    const colorObj = JSON.parse(jsonStr);
    console.log(jsonStr);

      
    const style = buildStyle({
      baseStyleName: "versatile",
      pmtiles,
      sprite, glyphs, lang,

      hidePOIs: false,

      hideLabels: false,

      colorEdit: colorObj
    });

    map.setStyle(style, {diff: false});
    
  });

})();
