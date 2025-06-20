import { get_country_name, get_multiline_name, language_script_pairs } from "@protomaps/basemaps";
import versatileLayersRaw from "./assets/versatile-layers-raw.txt?raw";
import type { StyleSpecification, LayerSpecification } from "maplibre-gl";

export type MakeStyleOptions = {
  pmtiles: string;
  sprite: string;
  glyphs: string;
  lang?: string;
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
  let lang = getDefaultLanguage();

  if (typeof options.lang === "string") {
    const isSupported = isLanguageSupported(options.lang, options.script, true);

    if (isSupported) {
      lang = options.lang;
    } else {
      console.warn(`Using language "${lang}" as fallback.`);
    }
  }

  const countryTextField = get_country_name(lang, options.script);
  const otherTranslatedTextField = get_multiline_name(lang, options.script);

  const translatedLayersStr = versatileLayersRaw
    .replaceAll('"<LANG>"', JSON.stringify(otherTranslatedTextField))
    .replaceAll('"<LANG_COUNTRY>"', JSON.stringify(countryTextField));

  const style: StyleSpecification = {
    version: 8,
    sprite: options.sprite,
    glyphs: options.glyphs,
    sources: {
      protomaps_planet: {
        type: "vector",
        url: `pmtiles://${options.pmtiles}`,
        attribution: "<a href='https://openstreetmap.org/copyright'>© OpenStreetMap Contributors</a>",
      },
    },
    layers: JSON.parse(translatedLayersStr) as unknown as LayerSpecification[],
  };

  return style;
}
