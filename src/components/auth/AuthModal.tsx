import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AuthInput } from "@/components/auth/AuthInput"
import { TermsContent } from "@/components/profile/profileMenu"
import { ApiError } from "@/lib/api"
import { EASE_OUT } from "@/lib/motion"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
// Hidden until the server supports them; the UI below is ready to switch back on.
const SOCIAL_SIGN_IN_ENABLED: boolean = false
const PASSWORD_RESET_ENABLED: boolean = false
const TITLE_STYLE = { fontFamily: "var(--font-sf)", fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: "36px" }

function focusableIn(el: HTMLElement) {
  return Array.from(
    el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((n) => !n.hasAttribute("disabled"))
}

export function AuthModal({
  defaultMode,
  word,
  onSubmit,
  onClose,
}: {
  defaultMode: "login" | "signup"
  /** The word they tried to save, when that's what opened this. */
  word?: string
  /** Resolves on success; rejects with an ApiError the modal turns into a message. */
  onSubmit: (mode: "login" | "signup", values: { name: string; email: string; password: string }) => Promise<void>
  onClose: () => void
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showTerms, setShowTerms] = useState(false)
  const backRef = useRef<HTMLButtonElement>(null)
  const termsLinkRef = useRef<HTMLButtonElement>(null)
  const returningFromTerms = useRef(false)

  const modalRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const openerRef = useRef<Element | null>(null)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true // StrictMode runs effects twice: setup must undo the first cleanup
    openerRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
      alive.current = false
    }
  }, [])

  useEffect(() => {
    // On short screens a plain focus scrolls the sheet and cuts off the title.
    firstFieldRef.current?.focus({ preventScroll: true })
  }, [mode])

  useEffect(() => {
    if (showTerms) {
      modalRef.current?.scrollTo({ top: 0 })
      backRef.current?.focus({ preventScroll: true })
      returningFromTerms.current = true
    } else if (returningFromTerms.current) {
      returningFromTerms.current = false
      termsLinkRef.current?.focus()
    }
  }, [showTerms])

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

  async function submit() {
    if (!validate() || pending) return
    setPending(true)
    setFormError(null)
    try {
      await onSubmit(mode, { name: name.trim(), email: email.trim(), password })
    } catch (e) {
      if (!alive.current) return
      const code = e instanceof ApiError ? e.code : "network"
      const status = e instanceof ApiError ? e.status : 0
      if (code === "invalid_credentials") setFormError("E-mail ou senha incorretos.")
      else if (code === "email_taken") setErrors({ email: "Este e-mail já está cadastrado. Tente entrar." })
      else if (status === 429) setFormError("Muitas tentativas. Aguarde alguns minutos e tente de novo.")
      else if (status === 400) setFormError("Confira os dados informados e tente de novo.")
      else if (status === 0) setFormError("Não foi possível conectar ao servidor. Tente de novo.")
      else setFormError("Algo deu errado. Tente novamente em instantes.")
    } finally {
      if (alive.current) setPending(false)
    }
  }

  function switchMode(m: "login" | "signup") {
    setMode(m)
    setErrors({})
    setFormError(null)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-6"
      style={{
        background: "rgba(255,255,255,0.56)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
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
        className="relative w-full sm:max-w-[440px] max-h-full overflow-y-auto overscroll-contain bg-white rounded-t-lg sm:rounded-lg px-6 pt-8 sm:p-10"
        style={{
          boxShadow: "0 0 0 1px var(--color-hairline), 0 16px 48px rgba(0,0,0,0.06)",
          paddingBottom: "max(24px, env(safe-area-inset-bottom))",
        }}
      >
        <button
          onClick={onClose}
          className="hit-area absolute top-4 right-4 size-8 rounded-full flex items-center justify-center text-muted hover:text-ink transition-[color,scale] duration-150 active:scale-[0.94]"
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11" />
          </svg>
        </button>

        {showTerms ? (
          <>
            <button
              ref={backRef}
              type="button"
              onClick={() => setShowTerms(false)}
              className="hit-area absolute top-4 left-4 size-8 rounded-full flex items-center justify-center text-muted hover:text-ink transition-[color,scale] duration-150 active:scale-[0.94]"
              aria-label="Voltar"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 1L3 6l5 5" />
              </svg>
            </button>
            <h2 id="auth-modal-title" className="text-ink text-center pb-6 px-6" style={TITLE_STYLE}>
              Termos de uso
            </h2>
            <TermsContent />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2 pb-8 px-6 text-center">
              <h2 id="auth-modal-title" className="text-ink text-balance" style={TITLE_STYLE}>
                {mode === "login" ? (
                  "Bem-vindo de volta"
                ) : word ? (
                  <>
                    Salve <em style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}>{word}</em> na sua lista
                  </>
                ) : (
                  "Crie sua conta gratuita"
                )}
              </h2>
              <p className="text-muted text-pretty" style={{ fontSize: 15, lineHeight: "24px" }}>
                {mode === "login" ? "Insira seus dados para acessar sua conta." : "Crie uma conta para guardar palavras e voltar a elas quando quiser."}
              </p>
            </div>

            {SOCIAL_SIGN_IN_ENABLED && (
              <>
                <div className="flex flex-col gap-2">
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
                      type="button"
                      className="w-full h-12 rounded-full border border-hairline flex items-center justify-center gap-2 text-ink text-[15px] font-medium hover:border-ink transition-[border-color,scale] duration-150 active:scale-[0.97]"
                    >
                      {s.icon}
                      Continuar com {s.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 py-6">
                  <div className="flex-1 h-px bg-hairline" />
                  <span className="text-[14px] text-muted">ou</span>
                  <div className="flex-1 h-px bg-hairline" />
                </div>
              </>
            )}

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault()
                void submit()
              }}
            >
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
                        ref={firstFieldRef}
                        label="Nome"
                        placeholder="Seu nome"
                        autoComplete="name"
                        value={name}
                        onChange={setName}
                        error={errors.name}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AuthInput
                  ref={mode === "login" ? firstFieldRef : undefined}
                  label="E-mail"
                  placeholder="seu@email.com"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={setEmail}
                  error={errors.email}
                />
                <AuthInput
                  label="Senha"
                  placeholder="Sua senha"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={setPassword}
                  hint={PASSWORD_RESET_ENABLED && mode === "login" ? "Esqueceu a senha?" : undefined}
                  error={errors.password}
                />
              </div>

              {formError && (
                <p role="alert" className="text-center mt-4" style={{ fontSize: 14, color: "var(--color-danger)" }}>
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full h-12 mt-4 rounded-full bg-ink text-[15px] font-medium text-on-ink hover:bg-ink-hover transition-[background-color,scale] duration-150 active:scale-[0.97] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {pending && (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <p className="text-center text-muted pt-6" style={{ fontSize: 14, lineHeight: "20px" }}>
              {mode === "login" ? "Ainda não tem conta? " : "Já tem uma conta? "}
              <button type="button" onClick={() => switchMode(mode === "login" ? "signup" : "login")} className="text-ink font-medium hover:opacity-60 transition-opacity">
                {mode === "login" ? "Criar conta" : "Entrar"}
              </button>
            </p>

            <p className="text-center text-[12px] text-muted pt-2">
              Ao continuar, você aceita nossos{" "}
              <button
                ref={termsLinkRef}
                type="button"
                onClick={() => setShowTerms(true)}
                className="hit-area relative underline underline-offset-2 hover:text-ink transition-colors"
              >
                Termos de Uso
              </button>
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
