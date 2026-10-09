import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AuthInput } from "@/components/auth/AuthInput"
import { imgLogoHero } from "@/lib/assets"
import { EASE_OUT } from "@/lib/motion"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const SUBMIT_DELAY_MS = 600

function focusableIn(el: HTMLElement) {
  return Array.from(
    el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((n) => !n.hasAttribute("disabled"))
}

export function AuthModal({
  defaultMode,
  onAuth,
  onClose,
}: {
  defaultMode: "login" | "signup"
  onAuth: () => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [pending, setPending] = useState(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const openerRef = useRef<Element | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    openerRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
      clearTimeout(timerRef.current)
    }
  }, [])

  useEffect(() => {
    firstFieldRef.current?.focus()
  }, [mode])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key !== "Tab" || !modalRef.current) return
      const items = focusableIn(modalRef.current)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  function validate() {
    const next: typeof errors = {}
    if (mode === "signup" && !name.trim()) next.name = "Informe seu nome"
    if (!email.trim()) next.email = "Informe seu e-mail"
    else if (!EMAIL_RE.test(email)) next.email = "Informe um e-mail válido"
    if (!password) next.password = "Informe sua senha"
    else if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function submit() {
    if (!validate() || pending) return
    setPending(true)
    timerRef.current = setTimeout(() => {
      setPending(false)
      onAuth()
    }, SUBMIT_DELAY_MS)
  }

  function switchMode(m: "login" | "signup") {
    setMode(m)
    setErrors({})
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6"
      style={{
        background: "rgba(29,29,31,0.38)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        fontFamily: "var(--font-sf)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99, transition: { duration: 0.16 } }}
        transition={{ duration: 0.36, ease: EASE_OUT }}
        className="relative w-full sm:max-w-[420px] max-h-full overflow-y-auto overscroll-contain bg-white rounded-t-[28px] sm:rounded-[24px] px-6 pt-8 sm:p-9 flex flex-col gap-5"
        style={{
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 80px -20px rgba(0,0,0,0.35)",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 rounded-full bg-black/[0.06] flex items-center justify-center text-ink hover:bg-black/10 transition-colors"
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>

        <div className="flex flex-col items-center gap-2 pt-1 text-center">
          <img src={imgLogoHero} alt="DICIOBASE" className="h-6 w-auto" />
          <h2
            id="auth-modal-title"
            className="text-ink mt-3"
            style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.15 }}
          >
            {mode === "login" ? "Bem-vindo de volta." : "Crie sua conta gratuita."}
          </h2>
          <p className="text-muted" style={{ fontSize: 15 }}>
            {mode === "login"
              ? "Insira seus dados para acessar sua conta."
              : "Salve palavras e acesse de qualquer lugar."}
          </p>
        </div>

        <div role="tablist" className="relative flex rounded-full bg-black/[0.06] p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className="relative flex-1 h-9 rounded-full text-[14px] font-medium transition-colors duration-200"
              style={{ color: mode === m ? "var(--color-ink)" : "var(--color-muted)" }}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-thumb"
                  className="absolute inset-0 rounded-full bg-white"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }}
                  transition={{ duration: 0.34, ease: EASE_OUT }}
                />
              )}
              <span className="relative">{m === "login" ? "Entrar" : "Criar conta"}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {mode === "signup" && (
              <motion.div
                key="name"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: EASE_OUT }}
                className="overflow-hidden -mx-1 px-1 -my-1 py-1"
              >
                <AuthInput
                  label="Nome"
                  placeholder="Seu nome"
                  value={name}
                  onChange={setName}
                  error={errors.name}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AuthInput
            ref={firstFieldRef}
            label="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <AuthInput
            label="Senha"
            placeholder="Sua senha"
            type="password"
            value={password}
            onChange={setPassword}
            hint={mode === "login" ? "Esqueceu a senha?" : undefined}
            error={errors.password}
          />
        </div>

        <button
          onClick={submit}
          disabled={pending}
          className="w-full h-[52px] rounded-full bg-ink text-[16px] font-medium text-on-ink hover:bg-[#333] transition-[background-color,scale] duration-150 active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {pending && (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {mode === "login" ? "Entrar" : "Criar conta"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-black/10" />
          <span className="text-[12px] text-muted">ou</span>
          <div className="flex-1 h-px bg-black/10" />
        </div>

        <div className="flex gap-3">
          {[
            {
              label: "Google",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              ),
            },
            {
              label: "Apple",
              icon: (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.41.83 3.22.86 1.22-.25 2.39-1.02 3.68-.88 1.56.18 2.73.84 3.48 2.1-3.2 1.96-2.43 6.01.29 7.24-.56 1.55-1.27 3.09-2.67 4.56zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              ),
            },
          ].map((s) => (
            <button
              key={s.label}
              className="flex-1 h-11 rounded-full bg-surface flex items-center justify-center gap-2 text-ink text-[14px] font-medium hover:bg-[#ebebef] transition-colors active:scale-[0.98]"
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <p className="text-center text-[12px] text-muted">
          Ao continuar, você aceita nossos{" "}
          <span className="underline underline-offset-2 cursor-pointer text-label-secondary hover:text-ink transition-colors">
            Termos de Uso
          </span>
        </p>
      </motion.div>
    </motion.div>
  )
}
