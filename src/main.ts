import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { buildStyle, getStyle, getStyleList, type ColorEdit, type Lang } from "./lib/basemapkit";

type CustomStyle = {
  baseStyleName: string;
  lang: Lang;
  hidePOIs: boolean;
  hideLabels: boolean;
  colorEdit: ColorEdit;
};

const defaultCustomStyle = `{
  "baseStyleName": "avenue",
  "lang": "en",
  "hidePOIs": false,
  "hideLabels": false,
  "colorEdit": {
    "negate": false,
    "brightness": 0,
    "brightnessShift": 0,
    "exposure": 0,
    "contrast": [
      0,
      127
    ],
    "hueRotation": 0,
    "saturation": 0,
    "multiplyColor": [
      "#ff0000",
      0
    ],
    "mixColor": [
      "#ff0000",
      0
    ]
  }
}
`;

function getStyleFromUrl(): CustomStyle | null {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const styleStr = searchParams.get("customstyle");

  if (!styleStr) return null;

  try {
    const styleObj = JSON.parse(decodeURIComponent(styleStr));
    return styleObj as CustomStyle;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function updateUrlStyle(s: CustomStyle) {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.set("customstyle", encodeURIComponent(JSON.stringify(s)));
  history.pushState(null, "", url);
}

function removeUrlStyle() {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.delete("customstyle");
  history.pushState(null, "", url);
}

(() => {
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  const styleDD = document.getElementById("style-dd") as HTMLSelectElement;
  const styleEditor = document.getElementById("style-editor") as HTMLDivElement;
  const validateStyleBt = document.getElementById("validate-style-bt") as HTMLButtonElement;
  const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;
  const resetButton = document.getElementById("reset-style-bt") as HTMLButtonElement;

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
  const sprite =
    "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut";
  const glyphs = "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf";
  const lang = "en";

  const map = new maplibregl.Map({
    container: appDiv,
    maxPitch: 89,
    hash: true,
    style: getStyle("avenue", {
      pmtiles,
      sprite,
      glyphs,
      lang,
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
    removeUrlStyle();
    const selectedStyle = (e.target as HTMLSelectElement).value;

    if (selectedStyle !== "custom") {
      map.setStyle(
        getStyle(selectedStyle, {
          pmtiles,
          sprite,
          glyphs,
          lang,
        }),
        { diff: false },
      );
      styleEditor.classList.add("hidden");
      return;
    }

    styleEditor.classList.remove("hidden");
    // The custom mode always starts with the avenue default style
    map.setStyle(
      getStyle("avenue", {
        pmtiles,
        sprite,
        glyphs,
        lang,
      }),
      { diff: false },
    );
  });

  codeEditor.value = defaultCustomStyle;
  let customStyle: CustomStyle | null = JSON.parse(defaultCustomStyle) as CustomStyle;

  // Trying to load style from URL
  const styleFromUrl = getStyleFromUrl();
  if (styleFromUrl) {
    try {
      const style = buildStyle({
        ...styleFromUrl,
        pmtiles,
        sprite,
        glyphs,
      });

      customStyle = styleFromUrl;
      codeEditor.value = JSON.stringify(styleFromUrl, null, 2);
      map.setStyle(style, { diff: false });
      updateUrlStyle(customStyle);
      styleDD.value = "custom";
      styleEditor.classList.remove("hidden");
    } catch (e) {
      removeUrlStyle();
      console.error(e);
    }
  }

  codeEditor.addEventListener("input", () => {
    customStyle = null;
    try {
      customStyle = JSON.parse(codeEditor.value) as CustomStyle;
    } catch (_e) {
      styleEditor.classList.add("error-editor");
      validateStyleBt.disabled = true;
      return;
    }

    styleEditor.classList.remove("error-editor");
    validateStyleBt.disabled = false;
  });

  resetButton.addEventListener("pointerup", () => {
    removeUrlStyle();
    codeEditor.value = defaultCustomStyle;
    customStyle = JSON.parse(defaultCustomStyle) as CustomStyle;
    const style = buildStyle({
      ...customStyle,
      pmtiles,
      sprite,
      glyphs,
    });

    map.setStyle(style, { diff: false });
  });

  validateStyleBt.addEventListener("pointerup", () => {
    if (!customStyle) {
      removeUrlStyle();
      return;
    }

    const style = buildStyle({
      ...customStyle,
      pmtiles,
      sprite,
      glyphs,
    });

    map.setStyle(style, { diff: false });
    updateUrlStyle(customStyle);
  });
})();
