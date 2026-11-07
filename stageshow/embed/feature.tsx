import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import { FeatureDemo } from '../FeatureDemo'

// One case study visual, named by ?f=.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FeatureDemo feature={new URLSearchParams(location.search).get('f') ?? ''} />
  </React.StrictMode>,
)
