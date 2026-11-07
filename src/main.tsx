import React from "react"
import ReactDOM from "react-dom/client"
import { Analytics } from "@vercel/analytics/react"
import { MotionConfig } from "motion/react"
import App from "./App"
import { withoutWords } from "./lib/analytics"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
      <Analytics beforeSend={withoutWords} />
    </MotionConfig>
  </React.StrictMode>,
)
