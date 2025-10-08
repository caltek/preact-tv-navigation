import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      plugins: [preact()],
      build: {
        lib: {
          entry: resolve(__dirname, 'lib/index.ts'),
          name: 'PreactSpatialNavigation',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
          // Externalize dependencies that shouldn't be bundled
          external: ['preact', 'preact/hooks', 'mitt', 'js-spatial-navigation'],
          output: {
            globals: {
              preact: 'preact',
              'preact/hooks': 'preactHooks',
            },
          },
        },
        sourcemap: true,
        emptyOutDir: true,
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
