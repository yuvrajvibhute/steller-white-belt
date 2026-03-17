import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for Buffer, process, and other Node.js globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Polyfill Node.js core modules used by Stellar SDK
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      // Some Stellar SDK internals use 'crypto'
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    include: ['@stellar/stellar-sdk', '@stellar/freighter-api'],
  },
})
