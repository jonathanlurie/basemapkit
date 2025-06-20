import { get_country_name, get_multiline_name, language_script_pairs } from "@protomaps/basemaps";
import versatileLayersRaw from "./assets/versatile-layers-raw.txt?raw";
import type { StyleSpecification, LayerSpecification } from "maplibre-gl";

export type MakeStyleOptions = {
  pmtiles: string;
  sprite: string;
  glyphs: string;

  lang?: undefined | "none" | "ar" | "cs" | "bg" | "da" | "de" | "el" | "en" | "es" | "et" | "fa" | "fi" | "fr" | "ga" | "he" | "hi" | "hr" | "hu" | "id" | "it" | "ja" | "ko" | "lt" | "lv" | "ne" | "nl" | "no" | "mr" | "mt" | "pl" | "pt" | "ro" | "ru" | "sk" | "sl" | "sv" | "tr" | "uk" | "ur" | "vi" | "zh-Hans" | "zh-Hant",
  script?: string;
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

  const style: StyleSpecification = {
    version: 8,
    sprite: options.sprite,
    glyphs: options.glyphs,
    sources: {
      pmbm_protomaps_planet: {
        type: "vector",
        url: `pmtiles://${options.pmtiles}`,
        attribution: "<a href='https://openstreetmap.org/copyright'>© OpenStreetMap Contributors</a>",
      },
    },
    layers: JSON.parse(translatedLayersStr) as unknown as LayerSpecification[],
  };

  return style;
}
