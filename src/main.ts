import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { buildStyle, getStyle, getStyleList, type ColorEdit, type Lang } from "./lib/basemapkit";

type CustomStyle = {
  baseStyleName: string,
  lang: Lang,
  hidePOIs: boolean,
  hideLabels: boolean,
  colorEdits: ColorEdit,
}

const defaultCustomStyle = `{
  "baseStyleName": "versatile",
  "lang": "en",
  "hidePOIs": false,
  "hideLabels": false,
  "colorEdits": {
    "negate": false,
    "brightness": 0,
    "brightnessShift": 0,
    "exposure": 0,
    "contrast": [0, 127],
    "hueRotation": 0,
    "saturation": 0,
    "multiplyColor": ["#ff0000", 0.0],
    "mixColor": ["#ff0000", 0.0]
  }
}
`;

(() => {
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  const styleDD = document.getElementById("style-dd") as HTMLSelectElement;
  const styleEditor = document.getElementById("style-editor") as HTMLDivElement;
  const validateStyleBt = document.getElementById("validate-style-bt") as HTMLButtonElement;
  const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;

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
      styleEditor.classList.add("hidden");
      return;
    }

    styleEditor.classList.remove("hidden");
    // The custom mode always starts with the versatile default style
    map.setStyle(getStyle("versatile", {
      pmtiles, sprite, glyphs, lang,
    }), {diff: false});
  });

  
  codeEditor.value = defaultCustomStyle;
  let customStyle: CustomStyle | null = JSON.parse(defaultCustomStyle) as CustomStyle;
  let errorMessage = "";


  codeEditor.addEventListener("input", () => {
    customStyle = null;
    try {
      customStyle = JSON.parse(codeEditor.value) as CustomStyle;
    } catch(e: unknown) {
      styleEditor.classList.add("error-editor");
      validateStyleBt.disabled = true;
      errorMessage = e instanceof Error ? e.message : 'An error occurred';
      console.log(errorMessage);
      return;
    }

    console.log(customStyle);
    styleEditor.classList.remove("error-editor");
    validateStyleBt.disabled = false;
  })


  validateStyleBt.addEventListener("pointerup", (e) => {
    if (!customStyle) {
      return;
    }

    const style = buildStyle({
      ...customStyle,
      pmtiles,
      sprite, glyphs,
    });

    map.setStyle(style, {diff: false});
    
  });

})();


