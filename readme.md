<p align="center">
  <img src="./public/logo.svg" alt="Basemapkit logo" width="400px"></img>
</p>
<p align="center">
Basemaps for <a href="https://maplibre.org/maplibre-gl-js/docs/">Maplibre GL JS</a> + <a href="https://protomaps.com/">Protomaps</a>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/basemapkit"></img>
</p>

Basemapkit generates customizable styles compatible with **Maplibre GL JS** that relies on the **Protomaps** Planet schemas when it comes to [vector layers and feature properties](https://docs.protomaps.com/basemaps/layers). You can download your own PMtiles copy of the planet on the official [Protomaps build page](https://maps.protomaps.com/builds/). 

![Showing the Basemapkit's Versatile style](./public/versatile.jpg)

## Getting started
### Install
On an existing ES project:
```bash
npm install basemapkit
```

### Add some style
The following example add a Maplibre `Map`, add the Protomaps protocol and then generates a style:

```ts
import "maplibre-gl/dist/maplibre-gl.css";

import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { getStyle, getStyleList } from "basemapkit";

// Adds the Protomaps protocol:
maplibregl.addProtocol("pmtiles", new Protocol().tile);

// Build the Basemapkit style
const style = getStyle(
  // One of the main syle:
  "versatile", 
  {
    // URL to the pmtiles
    pmtiles: "https://my-s3-bucket.com/planet.pmtiles",

    // URL to the sprites (for POIs)
    sprite: "https://raw.githubusercontent.com/jonathanlurie/phosphor-mlgl-sprite/refs/heads/main/sprite/phosphor-diecut",

    // URL to the glyphs (for labels)
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf";

    // Language (you can ommit to use the platform language)
    lang: "en",
  }),

// Instantiate the Map:
const map = new maplibregl.Map({
  container: "map",
  center: [0, 0],
  zoom: 3,
  
  // Add the Basemapkit style:
  style,
});
```

## Language
Basemakit styles are compatible with Protomaps languages properties and under the hood even uses [`@protomaps/basemaps`](https://docs.protomaps.com/basemaps/flavors). 

The only addition from **Basemapkit** is the capability to detect the end user's platform language, so if the `lang` option is omitted, it will automatically use the language set by the user at the browser or OS level.

Here is the list of supported languages:
```ts
"ar" | "cs" | "bg" | "da" | "de" | "el" | "en" | "es" | "et" | "fa" | "fi" | "fr" | "ga" | "he" | "hi" | "hr" | "hu" | "id" | "it" | "ja" | "ko" | "lt" | "lv" | "ne" | "nl" | "no" | "mr" | "mt" | "pl" | "pt" | "ro" | "ru" | "sk" | "sl" | "sv" | "tr" | "uk" | "ur" | "vi" | "zh-Hans" | "zh-Hant"
```

## Styles available
### 


### `versatile` ⤵️
```ts
// Create the style
const style = getStyle("versatile", options);
```
![](./public/screenshots/usa-versatile.jpeg)
![](./public/screenshots/alps-versatile.jpeg)
![](./public/screenshots/manhattan-versatile.jpeg)
![](./public/screenshots/na-versatile.jpeg)
![](./public/screenshots/paris-versatile.jpeg)
 
### `versatile-night` ⤵️
```ts
// Create the style
const style = getStyle("versatile-night", options);
```
![](./public/screenshots/usa-versatile-night.jpeg)
![](./public/screenshots/alps-versatile-night.jpeg)
![](./public/screenshots/manhattan-versatile-night.jpeg)
![](./public/screenshots/na-versatile-night.jpeg)
![](./public/screenshots/paris-versatile-night.jpeg)
 
### `versatile-bright` ⤵️
```ts
// Create the style
const style = getStyle("versatile-bright", options);
```
![](./public/screenshots/usa-versatile-bright.jpeg)
![](./public/screenshots/alps-versatile-bright.jpeg)
![](./public/screenshots/manhattan-versatile-bright.jpeg)
![](./public/screenshots/na-versatile-bright.jpeg)
![](./public/screenshots/paris-versatile-bright.jpeg)

### `versatile-saturated` ⤵️
```ts
// Create the style
const style = getStyle("versatile-saturated", options);
```
![](./public/screenshots/usa-versatile-saturated.jpeg)
![](./public/screenshots/alps-versatile-saturated.jpeg)
![](./public/screenshots/manhattan-versatile-saturated.jpeg)
![](./public/screenshots/na-versatile-saturated.jpeg)
![](./public/screenshots/paris-versatile-saturated.jpeg)

### `versatile-warm` ⤵️
```ts
// Create the style
const style = getStyle("versatile-warm", options);
```
![](./public/screenshots/usa-versatile-warm.jpeg)
![](./public/screenshots/alps-versatile-warm.jpeg)
![](./public/screenshots/manhattan-versatile-warm.jpeg)
![](./public/screenshots/na-versatile-warm.jpeg)
![](./public/screenshots/paris-versatile-warm.jpeg)

### `versatile-vintage` ⤵️
```ts
// Create the style
const style = getStyle("versatile-vintage", options);
```
![](./public/screenshots/usa-versatile-vintage.jpeg)
![](./public/screenshots/alps-versatile-vintage.jpeg)
![](./public/screenshots/manhattan-versatile-vintage.jpeg)
![](./public/screenshots/na-versatile-vintage.jpeg)
![](./public/screenshots/paris-versatile-vintage.jpeg)
 
### `versatile-bnw` ⤵️
```ts
// Create the style
const style = getStyle("versatile-bnw", options);
```
![](./public/screenshots/usa-versatile-bnw.jpeg)
![](./public/screenshots/alps-versatile-bnw.jpeg)
![](./public/screenshots/manhattan-versatile-bnw.jpeg)
![](./public/screenshots/na-versatile-bnw.jpeg)
![](./public/screenshots/paris-versatile-bnw.jpeg)

### `versatile-blueprint` ⤵️
```ts
// Create the style
const style = getStyle("versatile-blueprint", options);
```
![](./public/screenshots/usa-versatile-blueprint.jpeg)
![](./public/screenshots/alps-versatile-blueprint.jpeg)
![](./public/screenshots/manhattan-versatile-blueprint.jpeg)
![](./public/screenshots/na-versatile-blueprint.jpeg)
![](./public/screenshots/paris-versatile-blueprint.jpeg)