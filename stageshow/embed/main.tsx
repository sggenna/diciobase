import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import { HeroTour } from '../HeroTour'

// The tour alone, on nothing, for the portfolio to frame. `pnpm build:demos` writes it there.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroTour />
  </React.StrictMode>,
)
