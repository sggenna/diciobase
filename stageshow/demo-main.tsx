import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import { EntryDemo } from './EntryDemo'
import { HeroTour } from './HeroTour'

// /demo.html: the case study's cover and the homepage card; ?v=hero (the tour), ?v=search (the search-bar story, large) or ?v=card for one alone. Vite serves this in dev; the site's build
// only takes index.html, so it never ships with the product.
const v = new URLSearchParams(location.search).get('v')

const page: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64, padding: 40, background: '#fff', minHeight: '100dvh' }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main style={page}>
      {v === 'search' && (
        // The search-bar story at full size
        <div id="search" style={{ width: 'min(1200px, 100%)' }}>
          <EntryDemo variant="hero" />
        </div>
      )}
      {(v === 'hero' || !v) && (
        <div id="hero" style={{ width: 'min(1440px, 100%)' }}>
          <HeroTour />
        </div>
      )}
      {(v === 'card' || !v) && (
        // The portfolio's tile: a 16:9 media slot
        <div id="card" style={{ width: 'min(600px, 100%)' }}>
          <EntryDemo />
        </div>
      )}
    </main>
  </React.StrictMode>,
)
