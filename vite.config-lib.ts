import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  mode: "production",
  build: {
    copyPublicDir: false,
    minify: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/basemapkit.ts'),
      name: 'basemapkit',
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled into your library
      external: [
        "@protomaps/basemaps",
        "maplibre-gl",
        "pmtiles",
      ],
      output: {
        // Provide global variables to use in the UMD build for externalized deps
        globals: {},
      },
    },
  },
  plugins:[
    dts({
      insertTypesEntry: true,
      entryRoot: "src/lib",
    }),
  ],
});