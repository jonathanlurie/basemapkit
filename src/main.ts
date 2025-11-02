import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import {
  Protocol,
  // PMTiles
} from "pmtiles";
import packagejson from "../package.json";
import {
  buildStyle,
  getStyle,
  getStyleList,
  type BasemapkitStyle,
  type BuildStyleOptions,
  type ColorEdit,
  type Lang,
} from "./lib/basemapkit";

const defaultStyle = "avenue" as BasemapkitStyle;

type CustomStyle = {
  baseStyleName: string;
  lang: Lang;
  hidePOIs: boolean;
  hideLabels: boolean;
  colorEdit: ColorEdit;
  hillshading: boolean;
  globe: boolean;
};

const defaultCustomStyle = `{
  "baseStyleName": "${defaultStyle}",
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
  },
  "hillshading": true,
  "globe": true
}
`;

function getStyleIdFromUrl(): BasemapkitStyle | null {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const styleId = searchParams.get("styleid");

  if (!styleId) return null;

  const styleIdFormatted = styleId.trim().toLowerCase();
  return getStyleList().includes(styleIdFormatted) ? (styleIdFormatted as BasemapkitStyle) : null;
}

function updateUrlStyleId(styleId: string) {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.set("styleid", styleId.trim().toLowerCase());
  history.pushState(null, "", url);
}

function removeUrlStyleId() {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.delete("styleid");
  history.pushState(null, "", url);
}

function getCustomStyleFromUrl(): CustomStyle | null {
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

function updateUrlCustomStyle(s: CustomStyle) {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.set("customstyle", encodeURIComponent(JSON.stringify(s)));
  history.pushState(null, "", url);
}

function removeUrlCustomStyle() {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  searchParams.delete("customstyle");
  history.pushState(null, "", url);
}

(() => {
  const appDiv = document.getElementById("app") as HTMLDivElement;
  const styleDD = document.getElementById("style-dd") as HTMLSelectElement;
  const styleEditor = document.getElementById("style-editor") as HTMLDivElement;
  const validateStyleBt = document.getElementById("validate-style-bt") as HTMLButtonElement;
  const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;
  const resetButton = document.getElementById("reset-style-bt") as HTMLButtonElement;
  const basemapkitVersionDiv = document.getElementById("basemapkit-version") as HTMLDivElement;
  const zoomDisplay = document.getElementById("zoom-display") as HTMLDivElement;
  const currentStyleId = getStyleIdFromUrl() ?? defaultStyle;
  basemapkitVersionDiv.innerText = packagejson.version;

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

  styleDD.value = currentStyleId;

  if (!appDiv) {
    return;
  }

  maplibregl.addProtocol("pmtiles", new Protocol().tile);

  const lang = "en";
  const pmtiles = "https://fsn1.your-objectstorage.com/public-map-data/pmtiles/planet.pmtiles";
  const sprite =
    "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut";
  const glyphs = "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf";
  const pmtilesTerrain = "https://fsn1.your-objectstorage.com/public-map-data/pmtiles/terrain-mapterhorn.pmtiles";
  const terrainTileEncoding = "terrarium";

  const style = getStyle(currentStyleId, {
    pmtiles,
    sprite,
    glyphs,
    lang,
    terrain: {
      pmtiles: pmtilesTerrain,
      encoding: terrainTileEncoding,
    },
    globe: true,
  });

  const map = new maplibregl.Map({
    container: appDiv,
    maxPitch: 89,
    hash: true,
    style,
    center: [0, 0],
    zoom: 3,
  });

  map.on("zoom", () => {
    if (!zoomDisplay) {
      return;
    }
    zoomDisplay.innerText = map.getZoom().toFixed(2);
  });

  // Update the style based on the dropdown
  styleDD.addEventListener("change", (e: Event) => {
    removeUrlCustomStyle();
    removeUrlStyleId();
    const selectedStyle = (e.target as HTMLSelectElement).value as BasemapkitStyle | "custom";

    if (selectedStyle !== "custom") {
      updateUrlStyleId(selectedStyle);
      map.setStyle(
        getStyle(selectedStyle, {
          pmtiles,
          sprite,
          glyphs,
          lang,
          terrain: {
            pmtiles: pmtilesTerrain,
            encoding: terrainTileEncoding,
          },
        }),
        { diff: false },
      );
      styleEditor.classList.add("hidden");
      return;
    }

    styleEditor.classList.remove("hidden");
    // The custom mode always starts with the avenue default style
    map.setStyle(
      getStyle(defaultStyle, {
        pmtiles,
        sprite,
        glyphs,
        lang,
        terrain: {
          pmtiles: pmtilesTerrain,
          encoding: terrainTileEncoding,
        },
      }),
      { diff: false },
    );
  });

  codeEditor.value = defaultCustomStyle;
  let customStyle: CustomStyle | null = JSON.parse(defaultCustomStyle) as CustomStyle;

  // Trying to load style from URL
  const styleFromUrl = getCustomStyleFromUrl();
  if (styleFromUrl) {
    try {
      const style = buildStyle({
        ...styleFromUrl,
        pmtiles,
        sprite,
        glyphs,
        ...(styleFromUrl.hillshading
          ? {
              terrain: {
                pmtiles: pmtilesTerrain,
                encoding: terrainTileEncoding,
                hillshading: true,
              },
            }
          : {}),
        globe: styleFromUrl.globe,
      } as BuildStyleOptions);

      customStyle = styleFromUrl;
      codeEditor.value = JSON.stringify(styleFromUrl, null, 2);
      map.setStyle(style, { diff: false });
      // updateUrlCustomStyle(customStyle);
      styleDD.value = "custom";
      styleEditor.classList.remove("hidden");
    } catch (e) {
      removeUrlCustomStyle();
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
    removeUrlCustomStyle();
    codeEditor.value = defaultCustomStyle;
    customStyle = JSON.parse(defaultCustomStyle) as CustomStyle;

    const style = buildStyle({
      ...customStyle,
      pmtiles,
      sprite,
      glyphs,
      ...(customStyle.hillshading
        ? {
            terrain: {
              pmtiles: pmtilesTerrain,
              encoding: terrainTileEncoding,
              hillshading: true,
            },
          }
        : {}),
      globe: customStyle.globe,
    } as BuildStyleOptions);

    map.setStyle(style, { diff: false });
  });

  validateStyleBt.addEventListener("pointerup", () => {
    if (!customStyle) {
      removeUrlCustomStyle();
      return;
    }

    updateUrlCustomStyle(customStyle);

    const style = buildStyle({
      ...customStyle,
      pmtiles,
      sprite,
      glyphs,
      ...(customStyle.hillshading
        ? {
            terrain: {
              pmtiles: pmtilesTerrain,
              encoding: terrainTileEncoding,
              hillshading: true,
            },
          }
        : {}),
      globe: customStyle.globe,
    } as BuildStyleOptions);

    map.setStyle(style, { diff: false });
  });
})();
