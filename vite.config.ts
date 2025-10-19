import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import legacy from '@vitejs/plugin-legacy'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      plugins: [preact()],
      build: {
        target: 'es2015', // Support Chrome 35+ (ES6/ES2015)
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: 'PreactSpatialNavigation',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
          // Externalize dependencies that shouldn't be bundled
          external: ['preact', 'preact/hooks', 'mitt', '@bam.tech/lrud', 'lodash.uniqueid'],
          output: {
            globals: {
              preact: 'preact',
              'preact/hooks': 'preactHooks',
              '@bam.tech/lrud': 'Lrud',
              'lodash.uniqueid': 'uniqueId',
            },
          },
        },
        sourcemap: true,
        emptyOutDir: true,
      },
    };
  }
  
  // Legacy demo mode
  if (mode === 'legacy') {
    return {
      plugins: [
        preact(),
        legacy({
          targets: ['chrome >= 38', 'firefox >= 31', 'safari >= 8', 'edge >= 12'],
          additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
          modernPolyfills: true,
          renderLegacyChunks: true,
        }),
      ],
      resolve: {
        alias: {
          '@lib': resolve(__dirname, 'lib'),
        },
      },
      build: {
        target: 'es2015', // Ensure compatibility with older browsers
        cssTarget: 'chrome38', // CSS compatibility for Chrome 38
        outDir: 'dist-legacy',
      },
    };
  }
  
  // Demo app mode (default)
  return {
    plugins: [preact()],
    resolve: {
      alias: {
        '@lib': resolve(__dirname, 'lib'),
      },
    },
  };
})
