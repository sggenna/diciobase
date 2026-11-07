import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'
import { EntryDemo } from '../EntryDemo'

// The search-bar story alone, for the portfolio's card. The card is what's hovered and this frame is inert, so the
// page says when; the stage then plays and settles exactly as if the pointer were on it.
window.addEventListener('message', (e) => {
  if (e.origin !== location.origin || (e.data !== 'play' && e.data !== 'stop')) return
  document.querySelector('.ss-fit')?.dispatchEvent(new PointerEvent(e.data === 'play' ? 'pointerenter' : 'pointerleave'))
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EntryDemo variant="card" />
  </React.StrictMode>,
)
