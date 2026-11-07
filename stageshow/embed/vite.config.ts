import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { homedir } from 'node:os'

const repo = path.resolve(__dirname, '../..')

// Builds the demos as standalone pages inside the portfolio, which frames them: the tour and feature visuals on the case study, the search story on its card.
export default defineConfig({
  root: repo,
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@/lib/assets', replacement: path.resolve(__dirname, 'assets.ts') },
      { find: '@', replacement: path.resolve(repo, 'src') },
    ],
  },
  publicDir: false,
  build: {
    outDir: path.join(process.env.PORTFOLIO_DIR ?? path.join(homedir(), 'product_portfolio'), 'public/assets/diciobase/demos'),
    emptyOutDir: true,
    rollupOptions: { input: [path.resolve(repo, 'tour-embed.html'), path.resolve(repo, 'search-embed.html'), path.resolve(repo, 'feature-embed.html')] },
  },
})
