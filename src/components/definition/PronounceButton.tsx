import { useEffect, useRef, useState } from "react"
import type * as React from "react"
import { api, type ApiRecording } from "@/lib/api"
import "./PronounceButton.css"

type PronounceState = "idle" | "loading" | "playing" | "error"

/** Whose voice is playing: the recording's credit is a condition of its licence, and a synthetic voice has to say so. */
export type PronounceSource = { kind: "recording"; recording: ApiRecording } | { kind: "synthetic" }

const BARS = [0.4, 0.75, 0.5, 1, 0.6]

// A tiny silent WAV. iPhones only let audio start inside the tap itself, but the recording's address
// arrives after a request, so the tap starts this on the same element and the recording then takes over.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA="

/** Remembered per visit, so a replay doesn't ask the server again. Transient failures are not kept. */
const known = new Map<string, ApiRecording | null>()

async function findRecording(word: string): Promise<ApiRecording | null> {
  const hit = known.get(word)
  if (hit !== undefined) return hit
  const { recording } = await api.words.audio(word)
  known.set(word, recording)
  return recording
}

function brazilianVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null
  const voices = speechSynthesis.getVoices()
  const of = (lang: string) => voices.find((v) => v.lang.replace("_", "-").toLowerCase().startsWith(lang))
  return of("pt-br") ?? of("pt") ?? null
}

export function PronounceButton({
  word,
  variant = "pill",
  height = 34,
  onSource,
}: {
  word: string
  variant?: "pill" | "circle" | "inline"
  height?: number
  onSource?: (source: PronounceSource | null) => void
}) {
  const [state, setState] = useState<PronounceState>("idle")
  const audioRef = useRef<HTMLAudioElement | undefined>(undefined)
  // Bumped by every press and word change, so a late answer can't start sound nobody is waiting for.
  const run = useRef(0)

  function stop() {
    run.current++
    audioRef.current?.pause()
    audioRef.current = undefined
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel()
  }

  useEffect(() => {
    stop()
    setState("idle")
    onSource?.(null)
    return stop
  }, [word])

  function speak(mine: number) {
    const voice = brazilianVoice()
    if (!voice) {
      setState("error")
      return
    }
    const line = new SpeechSynthesisUtterance(word)
    line.voice = voice
    line.lang = voice.lang
    line.onstart = () => {
      if (run.current !== mine) return
      setState("playing")
      onSource?.({ kind: "synthetic" })
    }
    line.onend = () => run.current === mine && setState("idle")
    line.onerror = () => run.current === mine && setState("error")
    speechSynthesis.speak(line)
  }

  async function handleClick() {
    if (state === "loading") return
    if (state === "playing") {
      stop()
      setState("idle")
      return
    }
    stop()
    const mine = run.current
    setState("loading")

    const audio = new Audio(SILENCE)
    audioRef.current = audio
    const unlocked = audio.play().catch(() => undefined)

    let recording: ApiRecording | null = null
    try {
      recording = await findRecording(word)
    } catch {
      // Commons or our server is out of reach: the device's voice is still better than silence.
    }
    await unlocked
    if (run.current !== mine) return
    if (!recording) {
      speak(mine)
      return
    }

    const found = recording
    audio.onplaying = () => {
      if (run.current !== mine) return
      setState("playing")
      onSource?.({ kind: "recording", recording: found })
    }
    audio.onended = () => run.current === mine && setState("idle")
    audio.onerror = () => run.current === mine && speak(mine)
    audio.src = found.url
    audio.play().catch(() => run.current === mine && speak(mine))
  }

  const label =
    state === "playing"
      ? "Parar pronúncia"
      : state === "error"
        ? "Pronúncia indisponível"
        : "Ouvir pronúncia"

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={state === "error"}
        aria-label={label}
        title={label}
        aria-live="polite"
        className="hit-area relative inline-flex items-center justify-center size-4 self-center text-meta hover:text-ink disabled:opacity-40 transition-colors"
        data-state={state}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          {state === "playing" ? <path d="M2.5 2h2.5v8H2.5zM7 2h2.5v8H7z" /> : <path d="M3 1.5 10.5 6 3 10.5z" />}
        </svg>
      </button>
    )
  }

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
