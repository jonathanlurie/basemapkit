import { get_country_name, get_multiline_name } from "@protomaps/basemaps";
import Color from "color";
import type {
  StyleSpecification,
  LayerSpecification,
  SymbolLayerSpecification,
  RasterDEMSourceSpecification,
} from "maplibre-gl";
import { applyBrightnessRGB, applyContrastRGB, applyMultiplicationRGB, findColor, type RGBArray } from "./colorchange";
import avenueLayersRaw from "./assets/avenue-layers-raw.txt?raw";
import bureauLayersRaw from "./assets/bureau-layers-raw.txt?raw";
import journalLayersRaw from "./assets/journal-layers-raw.txt?raw";
import spectreLayersRaw from "./assets/spectre-layers-raw.txt?raw";
import { getDefaultLanguage, isLanguageSupported } from "./language";

const baseStyles = {
  avenue: avenueLayersRaw,
  bureau: bureauLayersRaw,
  journal: journalLayersRaw,
  spectre: spectreLayersRaw,
} as const;

type PresetDefinition = {
  baseStyle: string;
  colorEdit: ColorEdit;
};

const stylePresets = {
  "avenue-pop": {
    baseStyle: "avenue",
    colorEdit: {
      negate: false,
      brightness: 0,
      brightnessShift: 0,
      exposure: 0,
      contrast: [0.4, 220],
      hueRotation: -8,
      saturation: -0.1,
      multiplyColor: ["#ff0000", 0],
      mixColor: ["#ff0000", 0.02],
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-saturated": {
    baseStyle: "avenue",
    colorEdit: {
      exposure: -1,
      saturation: 0.1,
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-night": {
    baseStyle: "avenue",
    colorEdit: {
      brightness: -0.3,
      saturation: -0.8,
      multiplyColor: ["#171075", 0.6],
      contrast: [0.8, 160],
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-bright": {
    baseStyle: "avenue",
    colorEdit: {
      exposure: 0.6,
      saturation: -0.25,
      hueRotation: 15,
      contrast: [0.4, 220],
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-bnw": {
    baseStyle: "avenue",
    colorEdit: {
      exposure: -1,
      saturation: -1,
      contrast: [0.6, 160],
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-blueprint": {
    baseStyle: "avenue",
    colorEdit: {
      exposure: -0.7,
      saturation: -1,
      contrast: [0.75, 160],
      mixColor: ["#3355bb", 0.15],
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-warm": {
    baseStyle: "avenue",
    colorEdit: {
      exposure: -0.7,
      mixColor: ["#ff8800", 0.1],
      contrast: [0.1, 200],
    } as ColorEdit,
  } as PresetDefinition,

  "avenue-vintage": {
    baseStyle: "avenue",
    colorEdit: {
      exposure: -0.25,
      multiplyColor: ["#ff8800", 0.4],
      hueRotation: -5,
      contrast: [0.2, 200],
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-negative": {
    baseStyle: "bureau",
    colorEdit: {
      negate: true,
      hueRotation: 180,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-bnw": {
    baseStyle: "bureau",
    colorEdit: {
      saturation: -1,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-purple": {
    baseStyle: "bureau",
    colorEdit: {
      negate: false,
      brightness: -0.2,
      hueRotation: 40,
      saturation: -0.4,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-bnw-negative": {
    baseStyle: "bureau",
    colorEdit: {
      negate: true,
      saturation: -1,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-bnw-dark": {
    baseStyle: "bureau",
    colorEdit: {
      brightness: -0.6,
      saturation: -1,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-bnw-bright": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: 0.3,
      saturation: -1,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-bnw-negative-bright": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: 0.35,
      exposure: 0.8,
      saturation: -1,
      negate: true,
      contrast: [0.5, 245],
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-bnw-negative-dark": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: -0.2,
      brightness: -0.3,
      saturation: -1,
      negate: true,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-sand": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: 0.2,
      exposure: 0.2,
      saturation: -1,
      negate: false,
      multiplyColor: ["#ffeeab", 0.45],
      mixColor: ["#ffeeab", 0.1],
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-sand-negative": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: 0.2,
      exposure: 0.2,
      saturation: -1,
      negate: true,
      multiplyColor: ["#ffeeab", 0.45],
      mixColor: ["#ffeeab", 0.1],
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-ivory": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: 0.2,
      exposure: 0.2,
      saturation: -1,
      negate: false,
      multiplyColor: ["#f0e9d1", 0.45],
      mixColor: ["#f0e9d1", 0.1],
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-ivory-negative": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: -0.4,
      exposure: -0.2,
      saturation: 1,
      contrast: [0.5, 50],
      negate: true,
    } as ColorEdit,
  } as PresetDefinition,

  "bureau-navy": {
    baseStyle: "bureau",
    colorEdit: {
      brightnessShift: -0.4,
      exposure: -0.2,
      saturation: 1,
      contrast: [0.5, 50],
    } as ColorEdit,
  } as PresetDefinition,

  "journal-night": {
    baseStyle: "journal",
    colorEdit: {
      brightnessShift: -0.15,
      exposure: -2,
      saturation: -0.6,
      multiplyColor: ["#4444ff", 0.2],
    } as ColorEdit,
  } as PresetDefinition,

  "journal-teal": {
    baseStyle: "journal",
    colorEdit: {
      brightnessShift: 0.02,
      exposure: -1.2,
      hueRotation: -5,
      saturation: -0.35,
      multiplyColor: ["#ff9900", 0.05],
    } as ColorEdit,
  } as PresetDefinition,

  "journal-vintage": {
    baseStyle: "journal",
    colorEdit: {
      brightness: 0.02,
      brightnessShift: 0.03,
      exposure: -1.4,
      saturation: -0.3,
      contrast: [0.2, 180],
      multiplyColor: ["#ffc963", 0.25],
      mixColor: ["#ffc963", 0.08],
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-mild-green": {
    baseStyle: "spectre",
    colorEdit: {
      saturation: -0.2,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-red": {
    baseStyle: "spectre",
    colorEdit: {
      hueRotation: -120,
      saturation: -0.3,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-blue": {
    baseStyle: "spectre",
    colorEdit: {
      hueRotation: 90,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-purple": {
    baseStyle: "spectre",
    colorEdit: {
      hueRotation: 150,
      saturation: -0.3,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-pink": {
    baseStyle: "spectre",
    colorEdit: {
      hueRotation: 190,
      saturation: -0.2,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-orange": {
    baseStyle: "spectre",
    colorEdit: {
      hueRotation: 260,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-yellow": {
    baseStyle: "spectre",
    colorEdit: {
      hueRotation: 290,
      saturation: 0.1,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 180,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-mild-green": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 180,
      saturation: -0.2,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-red": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 60,
      saturation: -0.3,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-blue": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 270,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-purple": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 270,
      saturation: -0.3,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-pink": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 10,
      saturation: -0.2,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-orange": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 80,
    } as ColorEdit,
  } as PresetDefinition,

  "spectre-reverse-yellow": {
    baseStyle: "spectre",
    colorEdit: {
      negate: true,
      hueRotation: 110,
      saturation: 0.1,
    } as ColorEdit,
  } as PresetDefinition,
} as const;

/**
 * Options to modify colors of a base style
 */
export type ColorEdit = {
  /**
   * Invert the image color
   */
  negate?: boolean;

  /**
   * Ratio relative to current brightness.
   * Value in [-1, 1] but the range is actually open
   */
  brightness?: number;

  /**
   * Absolute brightness shift
   * Value in [-1, 1] but the range is actually open
   */
  brightnessShift?: number;

  /**
   * Exposure, like brightness but more preserving
   * Value in [-1, 1] but the range is actually open
   */
  exposure?: number;

  /**
   * Rotate the hue wheel
   * Value in [-180, 180] but the range is actually open
   */
  hueRotation?: number;

  /**
   * Modifiy color saturation
   * Value in [-1, 1] but the range is actually open
   */
  saturation?: number;

  /**
   * Multiply every color with the given one.
   */
  multiplyColor?: [
    /**
     * CSS color
     */
    string,
    /**
     * Mixing ratio in [0, 1], where 0 is fully the original color and 1 is fully the provided one.
     */
    number,
  ];

  /**
   * Mix every color with the given one.
   */
  mixColor?: [
    /**
     * CSS color
     */
    string,
    /**
     * Mixing ratio in [0, 1], where 0 is fully the original color and 1 is fully the one provided.
     */
    number,
  ];

  /**
   * Apply contrast, providing a contrast intensity and a mid (inflection) point
   */
  contrast?: [
    /**
     * Contrast intensity. Value in [-1, 1] but is actually an open range
     */
    number,
    /**
     * Color intensity mid point in the range [0, 255]
     */
    number,
  ];
};

export type Lang =
  | "ar"
  | "cs"
  | "bg"
  | "da"
  | "de"
  | "el"
  | "en"
  | "es"
  | "et"
  | "fa"
  | "fi"
  | "fr"
  | "ga"
  | "he"
  | "hi"
  | "hr"
  | "hu"
  | "id"
  | "it"
  | "ja"
  | "ko"
  | "lt"
  | "lv"
  | "ne"
  | "nl"
  | "no"
  | "mr"
  | "mt"
  | "pl"
  | "pt"
  | "ro"
  | "ru"
  | "sk"
  | "sl"
  | "sv"
  | "tr"
  | "uk"
  | "ur"
  | "vi"
  | "zh-Hans"
  | "zh-Hant";

export type GetStyleOptions = {
  /**
   * The public URL of a pmtiles files. To use if sourcing tiles directly with
   * range-request using the `pmtiles`'s protocol. Alternatively, the option `tileJson` can be used and will take precedence.
   */
  pmtiles?: string;

  /**
   * The public URL to a tile JSON file. To use if classic z/x/y MVT tiles are served through
   * Maplibre's Martin or the pmtiles CLI. Will take precedence on the option `pmtiles` if both are provided.
   */
  tilejson?: string;

  /**
   * URL of the sprites
   */
  sprite?: string;

  /**
   * URL of the glyphs
   */
  glyphs: string;

  /**
   * Language to apply to the basemap. Leaving this undefined will set to auto mode and use the platform language of the end user.
   */
  lang?: Lang;

  /**
   * Language script to apply to the basemap
   */
  script?: string;

  /**
   * Points Of Interests are shown by default, requiring a sprite URL. Passing this option as `true` will remove the POIs layer
   * and make the `sprite` option unnecessary.
   */
  hidePOIs?: boolean;

  /**
   * Labels are shown by default, requiring a glyphs URL. Passing this options as `true` will remove the label layers and make the
   * `glyphs` option unnecessary.
   */
  hideLabels?: boolean;

  /**
   * Adding terrain to the style. This includes options for both hillshading and bumpy terrain
   */
  terrain?: {
    /**
     * The public URL of a pmtiles files for raster terrain, encoded on RGB channels of either PNG or WebP. To use if sourcing tiles directly with
     * range-request using the `pmtiles`'s protocol. Alternatively, the option `tileJson` can be used and will take precedence.
     */
    pmtiles?: string;

    /**
     * The public URL to a tile JSON file for raster terrain tiles, encoded on RGB channels of either PNG or WebP. To use if classic z/x/y MVT tiles are served through
     * Maplibre's Martin or the pmtiles CLI. Will take precedence on the option `pmtiles` if both are provided.
     */
    tilejson?: string;

    /**
     * Encoding of the terrain raster data. Default: "mapbox"
     */
    encoding?: "mapbox" | "terrarium";

    /**
     * Enable or disable the hillshading. Enabled by default if one of the source options `terrain.pmtiles` or `terrain.tilejson` is provided.
     * It cannot be enabled if none of the source option is provided.
     */
    hillshading?: boolean;

    /**
     * The terrain exaggeration is disabled by default, making the terrain flat even if one of the source options `terrain.pmtiles` or `terrain.tilejson` is provided.
     * A value of `1` produces at-scale realistic terrain elevation.
     * It cannot be enabled if none of the source option is provided.
     */
    exaggeration?: number;
  };
};

/**
 * Identifier of the terrain source within the Basemapkit source definition
 */
export const BASEMAPKIT_BASEMAP_SOURCE_ID = "__bmk_bm_src";

/**
 * Identifier of the terrain source within the Basemapkit style definition.
 */
export const BASEMAPKIT_TERRAIN_SOURCE_ID = "__bmk_tr_src";

/**
 * Options relative to building a style
 */
export type BuildStyleOptions = GetStyleOptions & {
  /**
   * Name of the style to start from
   */
  baseStyleName: string;

  /**
   * Optional color modification to apply to the provided style
   */
  colorEdit?: ColorEdit;
};

/**
 * Returns the list of styles available.
 */
export function getStyleList(): string[] {
  const list = [];

  for (const baseStyle of Object.keys(baseStyles)) {
    list.push(baseStyle);

    const presetsForBaseStyle = Object.entries(stylePresets)
      .filter(([_, preset]) => preset.baseStyle === baseStyle)
      .map(([presetId]) => presetId);

    list.push(...presetsForBaseStyle);
  }

  return list;
}

/**
 * Get a style.
 */
export function getStyle(styleName: string, options: GetStyleOptions): StyleSpecification {
  // Check is style is raw
  if (styleName in baseStyles) {
    return buildStyle({
      ...options,
      baseStyleName: styleName,
    });
  }

  // Or if it's a preset
  if (styleName in stylePresets) {
    const presetInfo = stylePresets[styleName as keyof typeof stylePresets];
    return buildStyle({
      ...options,
      baseStyleName: presetInfo.baseStyle,
      colorEdit: presetInfo.colorEdit,
    });
  }

  throw new Error(`The style "${styleName}" does not exist as a base style, nor as a preset.`);
}

/**
 * Build your own style, using one of the base style as starting point.
 */
export function buildStyle(options: BuildStyleOptions): StyleSpecification {
  let countryTextField: string;
  let otherTranslatedTextField: string;
  const hideLabels = options.hideLabels ?? false;

  // Not displaying any label
  if (hideLabels) {
    countryTextField = '""';
    otherTranslatedTextField = '""';
  }

  // Displaying a label that is supported
  else if (typeof options.lang === "string" && isLanguageSupported(options.lang, options.script)) {
    countryTextField = JSON.stringify(get_country_name(options.lang, options.script));
    otherTranslatedTextField = JSON.stringify(get_multiline_name(options.lang, options.script));
  }

  // Not providing any language: using platform language
  else {
    const lang = getDefaultLanguage();
    countryTextField = JSON.stringify(get_country_name(lang));
    otherTranslatedTextField = JSON.stringify(get_multiline_name(lang));
  }

  if (!(options.baseStyleName in baseStyles)) {
    throw new Error(`The base style ${options.baseStyleName} does not exist.`);
  }

  const baseStyleLayers = baseStyles[options.baseStyleName as keyof typeof baseStyles];

  const translatedLayersStr = baseStyleLayers
    .replaceAll("<BMK_BM_SRC>", BASEMAPKIT_BASEMAP_SOURCE_ID)
    .replaceAll("<BMK_TR_SRC>", BASEMAPKIT_TERRAIN_SOURCE_ID)
    .replaceAll('"<LANG>"', otherTranslatedTextField)
    .replaceAll('"<LANG_COUNTRY>"', countryTextField);

  let sourceUrl: string;
  if (typeof options.tilejson === "string") {
    sourceUrl = options.tilejson;
  } else if (typeof options.pmtiles === "string") {
    sourceUrl = `pmtiles://${options.pmtiles}`;
  } else {
    throw new Error(`At least one option of "tilejson" or "pmtiles" must be provided as data source.`);
  }

  let terrainSourceUrl: string = "";
  let hillshading = false;
  let terrainEncoding = "";
  let terrainExaggeration = 0;
  if (options.terrain) {
    if (typeof options.terrain.tilejson === "string") {
      terrainSourceUrl = options.terrain.tilejson;
    } else if (typeof options.terrain.pmtiles === "string") {
      terrainSourceUrl = `pmtiles://${options.terrain.pmtiles}`;
    }

    if (terrainSourceUrl) {
      hillshading = options.terrain.hillshading ?? true;
      terrainExaggeration = options.terrain.exaggeration ?? 0;
    }

    terrainEncoding = options.terrain.encoding ?? "mapbox";
  }

  let layers = JSON.parse(translatedLayersStr) as unknown as LayerSpecification[];
  const hidePOIs = options.hidePOIs ?? false;

  // Remove hillshader layer if unnecessary
  if (!hillshading) {
    layers = layers.filter((l) => l.id !== "hillshader");
  }

  // Removing the POIs layer
  if (hidePOIs) {
    layers = layers.filter((l) => l.id !== "pois");
  }

  if (hideLabels) {
    // Keeping the POI layer, yet removing the text field
    const poiLayers = layers.filter((l) => l.id === "pois");
    if (poiLayers.length) {
      const poiLayer = poiLayers[0] as SymbolLayerSpecification;
      if (poiLayer.layout !== undefined) {
        const layout = poiLayer.layout;
        if (layout["text-field"] !== undefined) {
          layout["text-field"] = "";
        }
      }
    }

    layers = layers.filter((layer) => {
      if (layer.id === "pois") {
        return true;
      }

      if (layer.type !== "symbol") {
        return true;
      }

      if (layer.layout !== undefined) {
        const layout = layer.layout;
        if (layout["text-field"] !== undefined) {
          return false;
        }
      }
      return true;
    });
  }

  const colorOptions = options.colorEdit ?? {};
  const brightness = colorOptions.brightness ?? 0;
  const hueRotation = colorOptions.hueRotation ?? 0;
  const saturation = colorOptions.saturation ?? 0;
  const negate = colorOptions.negate ?? false;
  const brightnessShift = colorOptions.brightnessShift ?? 0;
  const exposure = colorOptions.exposure ?? 0;

  const shouldApplyColorTransform =
    brightness !== 0 ||
    hueRotation !== 0 ||
    saturation !== 0 ||
    negate === true ||
    colorOptions.multiplyColor !== undefined ||
    colorOptions.mixColor !== undefined ||
    brightnessShift !== 0 ||
    colorOptions.contrast !== undefined ||
    exposure !== 0;

  if (shouldApplyColorTransform) {
    findColor(layers, (color: string) => {
      // Using the Color lib for saturation and hue rotation
      let layerColor = Color(color);

      if (negate) {
        layerColor = layerColor.negate();
      }

      if (hueRotation !== 0) {
        layerColor = layerColor.rotate(hueRotation);
      }

      if (saturation !== 0) {
        layerColor = layerColor.saturate(saturation);
      }

      if (brightness > 0) {
        layerColor = layerColor.lighten(brightness);
      } else if (brightness < 0) {
        layerColor = layerColor.darken(brightness * -1);
      }

      if (brightnessShift !== 0) {
        const hsl = layerColor.hsl().array();
        hsl[2] += brightnessShift * 100;
        layerColor = Color.hsl(...hsl);
      }

      if (
        Array.isArray(colorOptions.mixColor) &&
        typeof colorOptions.mixColor[0] === "string" &&
        typeof colorOptions.mixColor[1] === "number" &&
        colorOptions.mixColor[1] !== 0
      ) {
        layerColor = layerColor.mix(Color(colorOptions.mixColor[0]), colorOptions.mixColor[1]);
      }

      const rgbColorInstance = layerColor.rgb();
      const alpha = rgbColorInstance.alpha();
      let rgbArr = [rgbColorInstance.red(), rgbColorInstance.green(), rgbColorInstance.blue()] as RGBArray;

      // Apply exposure
      if (exposure !== 0) {
        rgbArr = applyBrightnessRGB(rgbArr, exposure);
      }

      // Apply contrast
      if (
        Array.isArray(colorOptions.contrast) &&
        typeof colorOptions.contrast[0] === "number" &&
        typeof colorOptions.contrast[1] === "number" &&
        colorOptions.contrast[0] !== 0
      ) {
        rgbArr = applyContrastRGB(rgbArr, colorOptions.contrast[0], colorOptions.contrast[1]);
      }

      // Apply color multiplication
      if (
        Array.isArray(colorOptions.multiplyColor) &&
        typeof colorOptions.multiplyColor[0] === "string" &&
        typeof colorOptions.multiplyColor[1] === "number" &&
        colorOptions.multiplyColor[1] !== 0
      ) {
        const multiplyColor = Color(colorOptions.multiplyColor[0]);
        rgbArr = applyMultiplicationRGB(
          rgbArr,
          [multiplyColor.red(), multiplyColor.green(), multiplyColor.blue()],
          colorOptions.multiplyColor[1],
        );
      }

      // Back to Color lib format
      const outputColor = Color({ r: rgbArr[0], g: rgbArr[1], b: rgbArr[2], alpha: alpha });

      if (color.startsWith("rgba(") || color.startsWith("rgb(")) {
        return outputColor.rgb().toString();
      }

      if (color.startsWith("hsl(") || color.startsWith("hsla(")) {
        return outputColor.hsl().toString();
      }

      return outputColor.hexa();
    });
  }

  const style: StyleSpecification = {
    version: 8,
    ...(options.sprite && !hidePOIs ? { sprite: options.sprite } : {}),
    glyphs: options.glyphs,
    sources: {
      [BASEMAPKIT_BASEMAP_SOURCE_ID]: {
        type: "vector",
        url: sourceUrl,
        attribution: "<a href='https://openstreetmap.org/copyright'>© OpenStreetMap Contributors</a>",
      },

      // Add the terrain source if terrain source is provided and the hillshading
      // or terrain is enabled.
      ...(terrainSourceUrl && (terrainExaggeration || hillshading)
        ? {
            [BASEMAPKIT_TERRAIN_SOURCE_ID]: {
              url: terrainSourceUrl,
              type: "raster-dem",
              encoding: terrainEncoding,
            } as RasterDEMSourceSpecification,
          }
        : {}),
    },
    layers: layers,
    projection: { type: ["interpolate", ["linear"], ["zoom"], 7, "vertical-perspective", 8, "mercator"] },

    // Add the terrain if the terrain source is provided and the exaggeration is superior to 0
    ...(terrainSourceUrl && terrainExaggeration
      ? {
          terrain: {
            source: BASEMAPKIT_TERRAIN_SOURCE_ID,
            exaggeration: terrainExaggeration,
          },
        }
      : {}),
  };

  return style;
}
