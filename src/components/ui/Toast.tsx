import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { EASE_OUT } from "@/lib/motion"

export type ToastVariant = "success" | "info"

export interface ToastInput {
  id?: string
  title: string
  description?: string
  variant?: ToastVariant
  action?: { label: string; onClick: () => void }
}

interface ToastItem extends ToastInput {
  id: string
  variant: ToastVariant
}

interface ToastApi {
  toast: (t: ToastInput) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const MAX_VISIBLE = 3
const DURATION = 4200
const DURATION_WITH_ACTION = 6500

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((input: ToastInput) => {
    const id = input.id ?? `toast-${++counter.current}`
    const next: ToastItem = { ...input, id, variant: input.variant ?? "success" }
    setItems((prev) => {
      const without = prev.filter((t) => t.id !== id)
      return [...without, next].slice(-MAX_VISIBLE)
    })
    return id
  }, [])

  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <section
        aria-label="Notificações"
        className="toast-region fixed left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((t) => (
            <ToastCard key={t.id} item={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </section>
    </ToastContext.Provider>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--color-accent)" />
      <motion.path
        d="M7.5 12.5l3 3 6-6.5"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, delay: 0.14, ease: EASE_OUT }}
      />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="var(--color-ink)" />
      <path d="M12 11v5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="7.8" r="1.2" fill="#fff" />
    </svg>
  )
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  const [paused, setPaused] = useState(false)
  const remaining = useRef(item.action ? DURATION_WITH_ACTION : DURATION)
  const startedAt = useRef(0)

  useEffect(() => {
    if (paused) return
    startedAt.current = performance.now()
    const timer = window.setTimeout(() => onDismiss(item.id), remaining.current)
    return () => {
      window.clearTimeout(timer)
      remaining.current = Math.max(
        800,
        remaining.current - (performance.now() - startedAt.current),
      )
    }
  }, [paused, item.id, onDismiss])

  return (
    <motion.div
      layout="position"
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.18, ease: EASE_OUT } }}
      transition={{ duration: 0.34, ease: EASE_OUT }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.6 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 36 || info.velocity.y > 400) onDismiss(item.id)
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto w-full max-w-[380px] flex items-start gap-3 rounded-2xl bg-white py-3.5 pl-4 pr-3 touch-none"
      style={{
        fontFamily: "var(--font-sf)",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 14px 36px -8px rgba(0,0,0,0.18)",
      }}
    >
      <span className="mt-[1px] shrink-0">
        {item.variant === "success" ? <CheckIcon /> : <InfoIcon />}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-ink font-semibold" style={{ fontSize: 15, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
          {item.title}
        </p>
        {item.description && (
          <p className="mt-0.5" style={{ fontSize: 14, lineHeight: 1.4, color: "var(--color-label-secondary)" }}>
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            onClick={() => {
              onDismiss(item.id)
              item.action!.onClick()
            }}
            className="mt-2 text-ink font-semibold underline underline-offset-2 hover:opacity-60 transition-opacity"
            style={{ fontSize: 14 }}
          >
            {item.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(item.id)}
        aria-label="Fechar notificação"
        className="shrink-0 size-7 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-black/5 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </motion.div>
  )
}
