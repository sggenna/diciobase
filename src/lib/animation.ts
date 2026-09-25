import type * as React from "react"

export function fadeStyle(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(10px)",
    transition: `opacity var(--dur-slow) var(--ease-out) ${delay}s, transform var(--dur-slow) var(--ease-out) ${delay}s`,
  }
}

export function slideUpStyle(vis: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(20px)",
    transition: `opacity var(--dur-slow) var(--ease-out) ${delay}s, transform var(--dur-slow) var(--ease-out) ${delay}s`,
  }
}
