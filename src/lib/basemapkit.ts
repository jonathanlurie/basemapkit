import { get_country_name, get_multiline_name } from "@protomaps/basemaps";
import Color from "color";
import type { StyleSpecification, LayerSpecification, SymbolLayerSpecification } from "maplibre-gl";
import { applyBrightnessRGB, applyContrastRGB, applyMultiplicationRGB, findColor, type RGBArray } from "./colorchange";
import versatileLayersRaw from "./assets/versatile-layers-raw.txt?raw";
import { getDefaultLanguage, isLanguageSupported } from "./language";

const baseStyles = {
  "versatile": versatileLayersRaw,
} as const;

const stylePresets = {
  "versatile-night": {
    baseStyle: "versatile",
    colorEdit: {
      brightness: -0.3,
      saturation: -0.8,
      multiplyColor: ["#171075", 0.6],
      contrast: [1.6, 160],
    } as ColorEdit,
  },

  "versatile-bright": {
    baseStyle: "versatile",
    colorEdit: {
      exposure: 0.6,
      saturation: -0.1,
      hueRotation: 15,
      contrast: [0.2, 220]
    } as ColorEdit,
  },

  "versatile-bnw": {
    baseStyle: "versatile",
    colorEdit: {
      exposure: -1,
      saturation: -1,
      contrast: [1.2, 160],
    } as ColorEdit,
  },

  "versatile-blueprint": {
    baseStyle: "versatile",
    colorEdit: {
      exposure: -0.7,
      saturation: -1,
      contrast: [1.2, 160],
      mixColor: ["#3355bb", 0.15],
    } as ColorEdit,
  },

  "versatile-warm": {
    baseStyle: "versatile",
    colorEdit: {
      exposure: -0.7,
      contrast: [-0.1, 110],
      mixColor: ["#ff8800", 0.1],
    } as ColorEdit,
  },

  "versatile-vintage": {
    baseStyle: "versatile",
    colorEdit: {
      exposure: -0.25,
      multiplyColor: ["#ff8800", 0.4],
      hueRotation: -5,
    } as ColorEdit,
  },

  "versatile-saturated": {
    baseStyle: "versatile",
    colorEdit: {
      exposure: -1,
      saturation: 0.1,
    } as ColorEdit,
  },
} as const;


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
     * Mixing ratio in [0, 1], where 0 is fully the original color and 1 is fully the multiplication.
     */
    number
  ];

  /**
   * Mix every color with the given one. Tends to yield less natural blending than multiplyColor.
   */
  mixColor?: [
    /**
     * CSS color
     */
    string,

    /**
     * Mixing ratio in [0, 1], where 0 is fully the original color and 1 is fully the one provided.
     */
    number
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
    number
  ];
}

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
  lang?: "ar" | "cs" | "bg" | "da" | "de" | "el" | "en" | "es" | "et" | "fa" | "fi" | "fr" | "ga" | "he" | "hi" | "hr" | "hu" | "id" | "it" | "ja" | "ko" | "lt" | "lv" | "ne" | "nl" | "no" | "mr" | "mt" | "pl" | "pt" | "ro" | "ru" | "sk" | "sl" | "sv" | "tr" | "uk" | "ur" | "vi" | "zh-Hans" | "zh-Hant",
  
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
}


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


export function getStyleList(): string[] {
  return Object.keys(baseStyles).concat(Object.keys(stylePresets));
}

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
    })
  }

  throw new Error(`The style "${styleName}" does not exist as a base style, nor as a preset.`)
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
  else if (typeof options.lang === "string" && isLanguageSupported(options.lang, options.script, true)) {
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
    .replaceAll('"<LANG>"', otherTranslatedTextField)
    .replaceAll('"<LANG_COUNTRY>"', countryTextField);

  let sourceUrl: string;
  if (typeof options.tilejson === "string") {
    sourceUrl = options.tilejson
  } else if (typeof options.pmtiles === "string") {
    sourceUrl = `pmtiles://${options.pmtiles}`
  } else {
    throw new Error(`At least one option of "tilejson" or "pmtiles" must be provided as data source.`)
  }

  let layers = JSON.parse(translatedLayersStr) as unknown as LayerSpecification[];
  const hidePOIs = options.hidePOIs ?? false;
  

  if (hidePOIs) {
    layers = layers.filter(l => l.id !== "pois");
  }

  if (hideLabels) {
    // Keeping the POI layer, yet removing the text field
    const poiLayers = layers.filter(l => l.id === "pois");
    if (poiLayers.length) {
      const poiLayer = poiLayers[0] as SymbolLayerSpecification;
      if (poiLayer.layout !== undefined) {
        const layout = poiLayer.layout;
        if (layout["text-field"] !== undefined) {
          layout["text-field"] = "";
        }
      }
    }

    layers = layers.filter(layer => {
      if (layer.id === "pois") {
        return true;
      }

      if (layer.type !== "symbol") {
        return true;
      }

      if (layer.layout !== undefined) {
        const layout = layer.layout;
        if (layout["text-field"] !== undefined) {
          return false
        }
      }
      return true;
    })
  }

  const colorOptions = options.colorEdit ?? {};
  const brightness = colorOptions.brightness ?? 0;
  const hueRotation = colorOptions.hueRotation ?? 0;
  const saturation = colorOptions.saturation ?? 0;
  const negate = colorOptions.negate ?? false;
  const brightnessShift = colorOptions.brightnessShift ?? 0;
  const exposure = colorOptions.exposure ?? 0;

  const shouldApplyColorTransform = brightness !== 0 || 
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
      let layerColor = Color(color)

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
        hsl[2] += brightnessShift * 100
        layerColor = Color.hsl(...hsl);
      }

      if (Array.isArray(colorOptions.mixColor) && typeof colorOptions.mixColor[0] === "string" && typeof colorOptions.mixColor[1] === "number") {
        layerColor = layerColor.mix(Color(colorOptions.mixColor[0]), colorOptions.mixColor[1]);
      }

      const rgbColorInstance = layerColor.rgb();
      const alpha = rgbColorInstance.alpha();
      let rgbArr = [
        rgbColorInstance.red(),
        rgbColorInstance.green(),
        rgbColorInstance.blue()
      ] as RGBArray;
  
      // Apply exposure
      if (exposure !== 0) {
        rgbArr = applyBrightnessRGB(rgbArr, exposure);
      }
  
      // Apply contrast
      if (Array.isArray(colorOptions.contrast) && typeof colorOptions.contrast[0] === "number" && typeof colorOptions.contrast[1] === "number") {
        rgbArr = applyContrastRGB(rgbArr, colorOptions.contrast[0], colorOptions.contrast[1]);
      }
      
      // Apply color multiplication
      if (Array.isArray(colorOptions.multiplyColor) && typeof colorOptions.multiplyColor[0] === "string" && typeof colorOptions.multiplyColor[1] === "number") {
        const multiplyColor = Color(colorOptions.multiplyColor[0]);
        rgbArr = applyMultiplicationRGB(rgbArr, [multiplyColor.red(), multiplyColor.green(), multiplyColor.blue()], colorOptions.multiplyColor[1])
      }

      // Back to Color lib format
      const outputColor = Color({r: rgbArr[0], g: rgbArr[1], b: rgbArr[2], alpha: alpha})
        
      if (color.startsWith("rgba(") || color.startsWith("rgb(")) {
        return outputColor.rgb().toString()
      }
  
      if (color.startsWith("hsl(") || color.startsWith("hsla(")) {
        return outputColor.hsl().toString()
      }
  
      return outputColor.hexa();
    });
  }

  const style: StyleSpecification = {
    version: 8,
    ...(options.sprite && !hidePOIs ? { sprite: options.sprite } : {}),
    glyphs: options.glyphs,
    sources: {
      __protomaps_source: {
        type: "vector",
        url: sourceUrl,
        attribution: "<a href='https://openstreetmap.org/copyright'>© OpenStreetMap Contributors</a>",
      },
    },
    layers: layers,
  };

  return style;
}
