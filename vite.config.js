import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      exclude: ['fs', 'net', 'tls', 'child_process'],
    }),
  ],
  resolve: {
    alias: {
      "node:stream/web": "stream-browserify",
      "node:fs": path.resolve(__dirname, 'src/mocks/node-modules.js'),
      "node:net": path.resolve(__dirname, 'src/mocks/node-modules.js'),
      "node:tls": path.resolve(__dirname, 'src/mocks/node-modules.js'),
      "node:child_process": path.resolve(__dirname, 'src/mocks/node-modules.js'),
      "gcp-metadata": path.resolve(__dirname, 'src/mocks/gcp-metadata.js'),
      stream: 'readable-stream',
      buffer: 'buffer',
      "readable-stream": "readable-stream",
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
    exclude: ['google-spreadsheet'],
  },
  define: {
    'process.env': {},
    global: 'window',
  },
})
