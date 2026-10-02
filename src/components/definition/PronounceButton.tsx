import { useEffect, useRef, useState } from "react"
import type * as React from "react"
import "./PronounceButton.css"

type PronounceState = "idle" | "loading" | "playing" | "error"

const BARS = [0.4, 0.75, 0.5, 1, 0.6]

function audioUrlFor(word: string) {
  return `/assets/audio/${word}.mp3`
}

export function PronounceButton({
  word,
  variant = "pill",
  height = 34,
}: {
  word: string
  variant?: "pill" | "circle"
  height?: number
}) {
  const [state, setState] = useState<PronounceState>("idle")
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined)

  useEffect(() => {
    audioRef.current?.pause()
    audioRef.current = undefined
    setState("idle")
  }, [word])

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
    }
  }, [])

  function handleClick() {
    if (state === "loading" || state === "playing" || state === "error") return
    setState("loading")
    const audio = new Audio(audioUrlFor(word))
    audioRef.current = audio
    audio.onplaying = () => setState("playing")
    audio.onended = () => setState("idle")
    audio.onerror = () => setState("error")
    audio.play().catch(() => setState("error"))
  }

  const label =
    state === "playing"
      ? "Reproduzindo…"
      : state === "error"
        ? "Pronúncia indisponível"
        : "Ouvir pronúncia"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === "error"}
      aria-label={variant === "circle" ? label : undefined}
      aria-live="polite"
      className={`pronounce-button pronounce-button--${variant}`}
      data-state={state}
      style={{ "--pb-h": `${height}px` } as React.CSSProperties}
    >
      <span className="pronounce-button__bars" aria-hidden="true">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="pronounce-button__bar"
            style={
              {
                "--bar-h": h,
                "--bar-delay": `${i * 0.09}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </span>
      {variant === "pill" && (
        <span className="pronounce-button__label">{label}</span>
      )}
    </button>
  )
}
