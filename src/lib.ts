import type { StyleSpecification, LayerSpecification } from 'maplibre-gl';
// import versatileStyle from "./assets/versatile.json";
import versatileLayers from "./assets/versatile-layers.json";
import versatileLayersRaw from "./assets/versatile-layers-raw.txt?raw";
import { get_country_name, get_multiline_name, language_script_pairs } from '@protomaps/basemaps';

export type MakeStyleOptions = {
  pmtiles: string,
  sprite: string,
  glyphs: string,
  lang?: string,
  script?: string,
};


export function makeStyle(options: MakeStyleOptions): StyleSpecification {
  let lang = "en";

  if (typeof options.lang === "string") {
    const candidates = language_script_pairs.filter(l => l.lang === options.lang);

    if (candidates.length === 0) {
      throw new Error(`The lang ${options.lang} is not available.`)
    }

    lang = options.lang;
  }
  
  const countryTextField = get_country_name(lang, options.script);
  const otherTranslatedTextField = get_multiline_name(lang, options.script);
  
  const translatedLayersStr = versatileLayersRaw
    .replaceAll('"<LANG>"', JSON.stringify(otherTranslatedTextField))
    .replaceAll('"<LANG_COUNTRY>"', JSON.stringify(countryTextField))

  const style: StyleSpecification = {
    version: 8,
    sprite: options.sprite,
    glyphs: options.glyphs,
    sources: {
      protomaps_planet: {
        type: "vector",
        url: `pmtiles://${options.pmtiles}`,
        attribution: "<a href='https://openstreetmap.org/copyright'>© OpenStreetMap Contributors</a>"
      },
    },
    // layers: basemaps.layers("example_source",  basemaps.LIGHT, {lang:"english"})
    layers: JSON.parse(translatedLayersStr) as unknown as LayerSpecification[],
  }

  return style;
}

