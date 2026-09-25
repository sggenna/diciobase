import type * as React from "react"

export function fadeStyle(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(10px)",
    transition: `opacity 0.36s ease ${delay}s, transform 0.36s ease ${delay}s`,
  }
}

export function slideUpStyle(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.4s ease ${delay}s, transform 0.4s ease ${delay}s`,
  }
}
