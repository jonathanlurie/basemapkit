import { get_country_name, get_multiline_name, language_script_pairs } from "@protomaps/basemaps";
import versatileLayersRaw from "./assets/versatile-layers-raw.txt?raw";
import type { StyleSpecification, LayerSpecification } from "maplibre-gl";
import Color from "color";
import { applyBrightnessRGB, applyContrastRGB, applyMultiplicationRGB, findColor, type RGBArray } from "./colorchange";

export type MakeStyleOptions = {
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


  sprite: string;
  glyphs: string;
  lang?: undefined | "none" | "ar" | "cs" | "bg" | "da" | "de" | "el" | "en" | "es" | "et" | "fa" | "fi" | "fr" | "ga" | "he" | "hi" | "hr" | "hu" | "id" | "it" | "ja" | "ko" | "lt" | "lv" | "ne" | "nl" | "no" | "mr" | "mt" | "pl" | "pt" | "ro" | "ru" | "sk" | "sl" | "sv" | "tr" | "uk" | "ur" | "vi" | "zh-Hans" | "zh-Hant",
  script?: string;

  negate?: boolean;

  /**
   * Ratio relative to current brightness
   */
  brightness?: number;
  brightnessShift?: number;
  hueRotation?: number;
  saturation?: number;
  multiplyColor?: [string, number];
  mixColor?: [string, number];
  contrast?: [
    /**
     * Contrast intensity
     */
    number, 

    /**
     * mid point brightness (127 is middle)
     */
    number
  ];
};

export function isLanguageSupported(lang: string, script: string | undefined, verbose: boolean): boolean {
  const candidates = language_script_pairs.filter((l) => l.lang === lang);

  if (candidates.length === 0) {
    verbose &&
      console.warn(
        `The language "${lang}". The languages available are: ${language_script_pairs.map((l) => l.lang).join(", ")}.`,
      );
    return false;
  }

  if (script) {
    const candidatesWithScript = candidates.filter((l) => l.script === script);

    if (candidatesWithScript.length) {
      return true;
    }

    verbose &&
      console.warn(
        `The script "${script}" for the language "${lang}" is unsupported. Script available for this language: ${candidates.map((l) => l.script).join(", ")}.`,
      );
    return false;
  }

  return true;
}

export function getDefaultLanguage(): string {
  const systemLang = Intl.DateTimeFormat().resolvedOptions().locale.split("-")[0];
  if (isLanguageSupported(systemLang, undefined, false)) {
    return systemLang;
  }
  return "en";
}

export function makeStyle(options: MakeStyleOptions): StyleSpecification {
  let countryTextField: string;
  let otherTranslatedTextField: string;

  // Not displaying any label
  if (options.lang === "none") {
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

  const translatedLayersStr = versatileLayersRaw
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

  const brightness = options.brightness ?? 0;
  const hueRotation = options.hueRotation ?? 0;
  const saturation = options.saturation ?? 0;
  const negate = options.negate ?? false;
  const brightnessShift = options.brightnessShift ?? 0;

  const shouldApplyColorTransform = brightness !== 0 || 
    hueRotation !== 0 || 
    saturation !== 0 || 
    negate === true ||
    options.multiplyColor !== undefined ||
    options.mixColor !== undefined ||
    brightnessShift !== 0 ||
    options.contrast !== undefined;


  if (shouldApplyColorTransform) {
    findColor(layers, (color: string) => {
      // Using the Color lib for saturation and hue rotation
      let layerColor = Color(color)

      if (negate) {
        layerColor = layerColor.negate();
      }

      if (saturation !== 0) {
        layerColor = layerColor.saturate(saturation);
      }

      if (hueRotation !== 0) {
        layerColor = layerColor.rotate(hueRotation);
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

      // if (Array.isArray(options.mixColor) && typeof options.mixColor[0] === "string" && typeof options.mixColor[1] === "number") {
      //   console.log("mixing");
        
      //   inputColor = inputColor.mix(Color(options.mixColor[0]), options.mixColor[1]);
      // }
        

      const rgbColorInstance = layerColor.rgb();
      const alpha = rgbColorInstance.alpha();
      let rgbArr = [
        rgbColorInstance.red(),
        rgbColorInstance.green(),
        rgbColorInstance.blue()
      ] as RGBArray;
  
      // Apply brightness
      // rgbArr = applyBrightnessRGB(rgbArr, brightness);
  
      // // Apply contrast
      if (options.contrast) {
        rgbArr = applyContrastRGB(rgbArr, options.contrast[0], options.contrast[1]);
      }
      

      if (Array.isArray(options.multiplyColor) && typeof options.multiplyColor[0] === "string" && typeof options.multiplyColor[1] === "number") {
        const multiplyColor = Color(options.multiplyColor[0]);

        rgbArr = applyMultiplicationRGB(rgbArr, [multiplyColor.red(), multiplyColor.green(), multiplyColor.blue()], options.multiplyColor[1])
      }

      
  
      
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
    sprite: options.sprite,
    glyphs: options.glyphs,
    sources: {
      pmbm_protomaps_planet: {
        type: "vector",
        url: sourceUrl,
        attribution: "<a href='https://openstreetmap.org/copyright'>© OpenStreetMap Contributors</a>",
      },
    },
    layers: layers,
  };

  return style;
}
