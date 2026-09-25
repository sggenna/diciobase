import { useState } from "react"
import { slideUpStyle } from "@/lib/animation"
import { imgLogoDark2 } from "@/lib/assets"
import { useFade } from "@/lib/hooks"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const SUBMIT_DELAY_MS = 600

export function MobileAuthPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar")
  const [showPwd, setShowPwd] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [pending, setPending] = useState(false)
  const vis = useFade("mobile-auth")

  function validate() {
    const next: typeof errors = {}
    if (mode === "criar" && !name.trim()) next.name = "Informe seu nome"
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
    setTimeout(() => {
      setPending(false)
      onLogin()
    }, SUBMIT_DELAY_MS)
  }

  return (
    <div
      className="min-h-screen bg-paper-warm flex flex-col justify-center px-6 py-8"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 40px)" }}
    >
      {/* Logo + tagline */}
      <div
        className="flex flex-col items-center gap-3 mb-8"
        style={slideUpStyle(vis, 0)}
      >
        <img
          src={imgLogoDark2}
          alt="DICIOBASE"
          style={{ height: 46, width: "auto" }}
        />
        <p className="font-['Poppins:Regular'] text-[14px] text-muted text-center leading-[1.5] max-w-[240px]">
          O seu dicionário português, sempre ao seu alcance.
        </p>
      </div>

      {/* Mode switcher */}
      <div
        className="bg-surface rounded-lg p-[4px] flex mb-6"
        style={slideUpStyle(vis, 0.06)}
      >
        {(["entrar", "criar"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              setErrors({})
            }}
            className="flex-1 h-[44px] rounded-md font-['Poppins:SemiBold'] text-[15px] transition-colors duration-250"
            style={{
              background: mode === m ? "#fff" : "transparent",
              color: mode === m ? "var(--color-ink)" : "var(--color-muted)",
              boxShadow: mode === m ? "var(--shadow-sm)" : "none",
            }}
          >
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5" style={slideUpStyle(vis, 0.1)}>
        <div className="flex flex-col gap-1.5">
          <label className="font-['Poppins:Medium'] text-[13px] text-ink">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nome@exemplo.com"
            aria-invalid={!!errors.email}
            className="w-full h-[52px] px-4 rounded-md border bg-white font-['Poppins:Regular'] text-[15px] text-ink placeholder-[color:var(--color-border-strong)] outline-none focus:border-ink transition-colors"
            style={{ borderColor: errors.email ? "var(--color-danger)" : "var(--color-border)" }}
          />
          {errors.email && (
            <span className="font-['Poppins:Regular'] text-[12px]" style={{ color: "var(--color-danger)" }}>
              {errors.email}
            </span>
          )}
        </div>
        {mode === "criar" && (
          <div className="flex flex-col gap-1.5">
            <label className="font-['Poppins:Medium'] text-[13px] text-ink">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              aria-invalid={!!errors.name}
              className="w-full h-[52px] px-4 rounded-md border bg-white font-['Poppins:Regular'] text-[15px] text-ink placeholder-[color:var(--color-border-strong)] outline-none focus:border-ink transition-colors"
              style={{ borderColor: errors.name ? "var(--color-danger)" : "var(--color-border)" }}
            />
            {errors.name && (
              <span className="font-['Poppins:Regular'] text-[12px]" style={{ color: "var(--color-danger)" }}>
                {errors.name}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-['Poppins:Medium'] text-[13px] text-ink">
              Senha
            </label>
            {mode === "entrar" && (
              <button className="font-['Poppins:SemiBold'] text-[13px] text-ink">
                Esqueceu?
              </button>
            )}
          </div>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              aria-invalid={!!errors.password}
              className="w-full h-[52px] px-4 pr-12 rounded-md border bg-white font-['Poppins:Regular'] text-[15px] text-ink placeholder-[color:var(--color-border-strong)] outline-none focus:border-ink transition-colors"
              style={{ borderColor: errors.password ? "var(--color-danger)" : "var(--color-border)" }}
            />
            <button
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
            >
              {showPwd ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <span className="font-['Poppins:Regular'] text-[12px]" style={{ color: "var(--color-danger)" }}>
              {errors.password}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-5 mt-8" style={slideUpStyle(vis, 0.14)}>
        <button
          onClick={submit}
          disabled={pending}
          className="w-full h-[54px] bg-ink rounded-lg font-['Poppins:SemiBold'] text-[16px] text-on-ink active:scale-[0.97] transition-transform duration-150 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {pending && (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-['Poppins:Regular'] text-[12px] text-muted">
            ou continue com
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-3">
          <button className="flex-1 h-[50px] bg-white border border-border rounded-md flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            <span className="font-['Poppins:SemiBold'] text-[14px] text-ink">
              Google
            </span>
          </button>
          <button className="flex-1 h-[50px] bg-white border border-border rounded-md flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.15 3.79.03 3.02 2.65 4.03 2.68 4.04l-.08.24zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span className="font-['Poppins:SemiBold'] text-[14px] text-ink">
              Apple
            </span>
          </button>
        </div>

        <p className="text-center font-['Poppins:Regular'] text-[13px] text-muted">
          {mode === "entrar" ? "Não tem conta? " : "Já tem conta? "}
          <button
            onClick={() => {
              setMode(mode === "entrar" ? "criar" : "entrar")
              setErrors({})
            }}
            className="font-['Poppins:SemiBold'] text-ink"
          >
            {mode === "entrar" ? "Crie agora" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  )
}
