import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import { Protocol, PMTiles } from "pmtiles";
import packagejson from "../package.json";
import { BASEMAPKIT_TERRAIN_SOURCE_ID, buildStyle, getStyle, getStyleList, type ColorEdit, type Lang } from "./lib/basemapkit";

type CustomStyle = {
  baseStyleName: string;
  lang: Lang;
  hidePOIs: boolean;
  hideLabels: boolean;
  colorEdit: ColorEdit;
  hillshading: boolean;
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
  },
  "hillshading": true
}
`;

function getStyleIdFromUrl(): string | null {
  const url = new URL(window.location.href);
  const searchParams = url.searchParams;
  const styleId = searchParams.get("styleid");

  if (!styleId) return null;

  const styleIdFormatted = styleId.trim().toLowerCase();
  return getStyleList().includes(styleIdFormatted) ? styleIdFormatted : null;
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
  const appDiv = document.querySelector<HTMLDivElement>("#app");

  const styleDD = document.getElementById("style-dd") as HTMLSelectElement;
  const styleEditor = document.getElementById("style-editor") as HTMLDivElement;
  const validateStyleBt = document.getElementById("validate-style-bt") as HTMLButtonElement;
  const codeEditor = document.getElementById("code-editor") as HTMLTextAreaElement;
  const resetButton = document.getElementById("reset-style-bt") as HTMLButtonElement;
  const basemapkitVersionDiv = document.getElementById("basemapkit-version") as HTMLDivElement;

  let currentStyleId = getStyleIdFromUrl() || "avenue"

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
  });

  console.log(style);
  

  const map = new maplibregl.Map({
    container: appDiv,
    maxPitch: 89,
    hash: true,
    style,
    center: [0, 0],
    zoom: 3,
  });

  // map.showTileBoundaries = true;










  // map.on('load', () => {
  //   console.log("showing building");
    
  //   // const pbfSourceBuilding = "building"
  //   const pbfSourceBuilding = "buildings_intersecting_precip"

  //   // 1) Vector source pointing at your MVT tiles
  //   map.addSource('my-mvt', {
  //     type: 'vector',
  //     // url: "http://127.0.0.1:8000/metadata.json",
  //     // url: "https://api.maptiler.com/tiles/v3/tiles.json?key=2HjmsNaDXvgEkf4RQLaS",
  //     // tiles: ["https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=2HjmsNaDXvgEkf4RQLaS"],
  //     tiles: ['http://127.0.0.1:8080/{z}/{x}/{y}.pbf'],
  //     minzoom: 6,
  //     maxzoom: 16,              // match what you exported
  //     attribution: '© Your Data',
  //   });

  //   // // 2a) Fill polygons
  //   map.addLayer({
  //     id: 'my-fill',
  //     type: 'fill',
  //     source: 'my-mvt',
  //     'source-layer': pbfSourceBuilding,
  //     paint: {
  //       'fill-color': '#ff0000',
  //       'fill-opacity': 0.8
  //     }
  //   });

  //   // 2b) Outline (for polygons) or use as a line layer for linework
  //   // map.addLayer({
  //   //   id: 'my-outline',
  //   //   type: 'line',
  //   //   source: 'my-mvt',
  //   //   'source-layer': pbfSourceBuilding,
  //   //   paint: {
  //   //     'line-color': '#00ff00',
  //   //     'line-width': 1
  //   //   }
  //   // });

  //   // 2c) Labels (if you have a name property)
  //   // map.addLayer({
  //   //   id: 'my-labels',
  //   //   type: 'symbol',
  //   //   source: 'my-mvt',
  //   //   'source-layer': 'buildings_intersecting_precip',
  //   //   layout: { 'text-field': ['get', 'name'], 'text-size': 12 }
  //   // });
  // });














  // Update the style based on the dropdown
  styleDD.addEventListener("change", (e: Event) => {
    removeUrlCustomStyle();
    removeUrlStyleId();
    const selectedStyle = (e.target as HTMLSelectElement).value;

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
      getStyle("avenue", {
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
      });

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
    });

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
    });

    map.setStyle(style, { diff: false });
  });
})();

const pmtileTerrain = new PMTiles("https://fsn1.your-objectstorage.com/public-map-data/pmtiles/terrain-mapterhorn.pmtiles");

async function debugTile(z: number, x: number, y: number) {
  

  const tileData = await pmtileTerrain.getZxy(z, x, y);

  const header = await pmtileTerrain.getHeader();
  console.log(header);
  

   if (!tileData) return null;
    
    // Create a blob from the tile data
    const blob = new Blob([tileData.data]);
    const imageUrl = URL.createObjectURL(blob);
    
    // Create and load image
    const img = new Image();
    await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
    });
    
    // Create canvas to extract pixel data
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0);
    
    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    
    // Clean up
    URL.revokeObjectURL(imageUrl);
    
    console.log(imageData);
    
    return {
    image: img,
    imageData,
    getPixelValue: (x: number, y: number) => {
      if (!imageData) return null;
      const index = (y * canvas.width + x) * 4;
      const r = imageData.data[index];
      const g = imageData.data[index + 1];
      const b = imageData.data[index + 2];
      // Terrarium encoding formula
      const elevation = r*256 + g + b/256 - 32768;
      return { r, g, b, elevation };
    }
    };
  console.log(tileData);
  

}

console.log(debugTile);
