import { useEffect, useRef, useState } from "react"
import type * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { DICT_LIST, TermsContent } from "@/components/profile/profileMenu"
import { useTips } from "@/components/ui/Tips"
import { useToast } from "@/components/ui/Toast"
import { ApiError, STATIC_SITE, type DictToggles } from "@/lib/api"
import { useSession } from "@/lib/session"
import type { useMobileProfileState } from "@/lib/hooks"

// Profile sits on the same white ground as every other page; groups are outlined, not lifted off gray.
const CARD = "border-t border-hairline"

function Switch({
  on,
  onToggle,
  label,
}: {
  on: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className="relative shrink-0 rounded-full transition-colors duration-[250ms]"
      style={{
        width: 44,
        height: 26,
        background: on ? "var(--color-ink)" : "#e0e0e0",
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-transform duration-[250ms]"
        style={{
          left: 3,
          top: 3,
          width: 20,
          height: 20,
          transform: on ? "translateX(18px)" : "translateX(0)",
          transitionTimingFunction: "cubic-bezier(0.25,0.1,0.25,1)",
        }}
      />
    </button>
  )
}

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C7C7CC"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function Row({
  title,
  sub,
  value,
  onClick,
  trailing,
  last,
  tip,
}: {
  title: string
  sub?: string
  value?: string
  onClick?: () => void
  trailing?: React.ReactNode
  last?: boolean
  tip?: string
}) {
  const content = (
    <>
      <span className="flex-1 text-left">
        <span className="block text-ink" style={{ fontSize: 15, lineHeight: "20px" }}>
          {title}
        </span>
        {sub && (
          <span className="block" style={{ fontSize: 13, lineHeight: "20px", color: "var(--color-muted)" }}>
            {sub}
          </span>
        )}
      </span>
      {value && (
        <span style={{ fontSize: 15, color: "var(--color-muted)" }}>{value}</span>
      )}
      {trailing ?? (onClick ? <Chevron /> : null)}
      {!last && (
        <span className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--color-hairline)" }} />
      )}
    </>
  )
  const cls = "relative flex items-center gap-3 w-full py-2 min-h-14"
  return onClick ? (
    <button data-tip={tip} onClick={onClick} className={`${cls} transition-opacity hover:opacity-60`}>
      {content}
    </button>
  ) : (
    <div data-tip={tip} className={cls}>{content}</div>
  )
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  error,
  autoFocus,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  autoFocus?: boolean
}) {
  const ring = error ? "inset 0 0 0 2px var(--color-danger)" : "inset 0 0 0 1px var(--color-hairline)"
  return (
    <label className="flex flex-col gap-2">
      <span className="font-medium text-ink" style={{ fontSize: 14 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className="w-full h-12 px-6 rounded-full bg-white text-[16px] md:text-[15px] text-ink outline-none transition-shadow duration-200"
        style={{ boxShadow: ring }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.boxShadow = "inset 0 0 0 1px var(--color-field-focus)"
        }}
        onBlur={(e) => (e.currentTarget.style.boxShadow = ring)}
      />
      {error && (
        <span role="alert" style={{ fontSize: 13, color: "var(--color-danger)" }}>
          {error}
        </span>
      )}
    </label>
  )
}

function PrimaryButton({
  label,
  onClick,
  danger,
  disabled,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-12 rounded-full font-medium transition-[background-color,scale,opacity] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
      style={{
        fontSize: 15,
        background: danger ? "var(--color-danger)" : "var(--color-ink)",
        color: "#fff",
      }}
    >
      {label}
    </button>
  )
}

function SubPage({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <div className="max-w-[552px] mx-auto md:mx-0">
      <nav aria-label="Trilha de navegação">
        <ol className="flex items-center justify-center md:justify-start gap-2" style={{ fontSize: 14 }}>
          <li>
            <button
              onClick={onBack}
              className="text-label-secondary hover:text-ink transition-colors py-2 -my-2 pr-1"
            >
              Perfil
            </button>
          </li>
          <li aria-hidden="true" className="text-[#C7C7CC] flex">
            <Chevron />
          </li>
          <li aria-current="page" className="text-ink font-medium">
            {title}
          </li>
        </ol>
      </nav>
      <h1
        data-panel-heading
        tabIndex={-1}
        className="text-ink text-center md:text-left mt-5 mb-8 outline-none"
        style={{ fontFamily: "var(--font-sf)", fontSize: "clamp(40px, 10vw, 56px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 }}
      >
        {title}
      </h1>
      {children}
    </div>
  )
}

const PANEL_EASE_IN = [0.32, 0.72, 0, 1] as const
const PANEL_EASE_OUT = [0.4, 0, 1, 1] as const
const panelVariants = {
  enter: (d: number) => ({ opacity: 0, x: d * 44 }),
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.36, ease: PANEL_EASE_IN },
  },
  exit: (d: number) => ({
    opacity: 0,
    x: d * -28,
    transition: { duration: 0.15, ease: PANEL_EASE_OUT },
  }),
}

const DEFAULT_DICTS: DictToggles = { wikcionario: true, "dicionario-aberto": true, wordnet: true }

const memberSince = (iso: string | null) =>
  iso
    ? new Date(iso)
        .toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
        .replace(".", "")
        .replace(" de ", " ’")
        .replace(/^./, (c) => c.toUpperCase())
    : "—"

export function ProfilePage({
  state: s,
  onLogout,
  onDeleted,
  onTutorial,
  onExplore,
}: {
  state: ReturnType<typeof useMobileProfileState>
  onLogout: () => void
  onDeleted: () => void
  onTutorial: () => void
  /** Leaves for the search, from the first-step nudge a new account sees. */
  onExplore: () => void
}) {
  const { panel, setPanel, avatarSrc, setAvatarSrc } = s
  const { toast } = useToast()
  const tips = useTips()
  const session = useSession()
  const name = session.user?.name ?? ""
  const email = session.user?.email ?? ""
  const dicts = session.settings?.dicts ?? DEFAULT_DICTS
  const notifications = session.settings?.notifications ?? true
  const [busy, setBusy] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteError, setDeleteError] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pwErrors, setPwErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})
  const firstRender = useRef(true)
  const dir = panel === "main" ? -1 : 1

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
  }, [panel])

  useEffect(() => () => setPanel("main"), [setPanel])

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarSrc(URL.createObjectURL(f))
    setPanel("main")
    toast({
      id: "avatar",
      title: "Foto atualizada",
      description: "Sua nova foto de perfil já está visível.",
    })
  }

  function toggleDict(id: keyof DictToggles, dictName: string) {
    const turningOff = dicts[id]
    if (turningOff && Object.values(dicts).filter(Boolean).length === 1) {
      toast({
        id: "dict-min",
        title: "Mantenha um dicionário ativo",
        description: "Sem ao menos uma fonte ativa, as buscas não retornam definições.",
        variant: "info",
      })
      return
    }
    session.updateSettings({ dicts: { ...dicts, [id]: !dicts[id] } }).catch(() => undefined)
    toast({
      id: `dict-${id}`,
      title: `${dictName} ${turningOff ? "desativado" : "ativado"}`,
      description: turningOff
        ? "Ele deixa de aparecer nas definições."
        : "Ele volta a aparecer nas definições.",
      variant: turningOff ? "info" : "success",
    })
  }

  async function savePassword() {
    const errors: typeof pwErrors = {}
    if (!s.pwCurrent) errors.current = "Digite sua senha atual."
    if (s.pwNew.length < 8) errors.next = "Use ao menos 8 caracteres."
    if (s.pwConfirm !== s.pwNew) errors.confirm = "As senhas não coincidem."
    setPwErrors(errors)
    if (Object.keys(errors).length || busy) return
    setBusy(true)
    try {
      await session.changePassword(s.pwCurrent, s.pwNew)
    } catch (e) {
      if (e instanceof ApiError && e.code === "wrong_password") setPwErrors({ current: "Senha atual incorreta." })
      else if (e instanceof ApiError && e.status === 429) setPwErrors({ current: "Muitas tentativas. Aguarde alguns minutos." })
      else if (e instanceof ApiError && e.status === 400) setPwErrors({ next: "Use de 8 a 128 caracteres." })
      else if (!(e instanceof ApiError && e.status === 401))
        toast({ id: "password", title: "Não foi possível alterar a senha", description: "Tente novamente em instantes.", variant: "info" })
      return
    } finally {
      setBusy(false)
    }
    s.setPwCurrent("")
    s.setPwNew("")
    s.setPwConfirm("")
    setPanel("main")
    toast({
      id: "password",
      title: "Senha alterada",
      description: "Você foi desconectado dos outros dispositivos.",
    })
  }

  async function deleteAccount() {
    if (!deletePassword || busy) {
      if (!deletePassword) setDeleteError("Digite sua senha para confirmar.")
      return
    }
    setBusy(true)
    try {
      await session.deleteAccount(deletePassword)
    } catch (e) {
      if (e instanceof ApiError && e.code === "wrong_password") setDeleteError("Senha incorreta.")
      else if (e instanceof ApiError && e.status === 429) setDeleteError("Muitas tentativas. Aguarde alguns minutos.")
      else if (!(e instanceof ApiError && e.status === 401)) setDeleteError("Não foi possível excluir agora. Tente novamente.")
      return
    } finally {
      setBusy(false)
    }
    setDeletePassword("")
    onDeleted()
  }

  const activeDicts = Object.values(dicts).filter(Boolean).length

  const avatar = (size: number, font: number) =>
    avatarSrc ? (
      <img
        src={avatarSrc}
        alt=""
        className="img-edge rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full border border-hairline text-meta flex items-center justify-center uppercase font-medium"
        style={{ width: size, height: size, fontSize: font }}
      >
        {name[0]}
      </div>
    )

  const fluidAvatar = avatarSrc ? (
    <img src={avatarSrc} alt="" className="img-edge size-full rounded-full object-cover" />
  ) : (
    <div className="size-full rounded-full border border-hairline text-meta flex items-center justify-center uppercase font-medium text-[34px]">
      {name[0]}
    </div>
  )

  // A new account has nothing to count yet: "0 palavras, 0 pesquisas" reads as broken, so it gets a first step instead.
  // The static site keeps no search history, so its only number is the saved words.
  const fresh = session.saved.length === 0 && (STATIC_SITE || session.searches === 0)
  const stats = STATIC_SITE
    ? [{ value: String(session.saved.length), label: "Palavras salvas" }]
    : [
        { value: String(session.saved.length), label: "Palavras salvas" },
        { value: String(session.searches), label: "Pesquisas" },
        { value: memberSince(session.createdAt), label: "Membro desde" },
      ]
  const renderStats = (className: string, desktopBorder?: boolean) =>
    fresh ? (
      <div
        data-tip="profile-stats"
        className={`${className.replace("md:grid", "md:flex").replace("grid-cols-3", "").replace(/^grid\b/, "flex")} flex-col items-center text-center md:items-start md:text-left gap-4`}
        style={desktopBorder ? { borderTop: "1px solid var(--color-hairline)" } : undefined}
      >
        <p className="text-meta" style={{ fontFamily: "var(--font-sf)", fontSize: 17, lineHeight: "27px" }}>
          {STATIC_SITE ? "Suas palavras salvas aparecem aqui." : "Suas palavras salvas e pesquisas aparecem aqui."}
        </p>
        <button
          onClick={onExplore}
          className="h-12 px-6 rounded-full bg-ink text-on-ink font-medium transition-[background-color,scale] hover:bg-ink-hover active:scale-[0.97]"
          style={{ fontSize: 15 }}
        >
          Pesquisar uma palavra
        </button>
      </div>
    ) : (
    <div
      data-tip="profile-stats"
      className={STATIC_SITE ? className.replace("grid-cols-3", "grid-cols-1") : className}
      style={desktopBorder ? { borderTop: "1px solid var(--color-hairline)" } : undefined}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center text-center md:items-start md:text-left gap-1"
        >
          <span className="text-ink" style={{ fontFamily: "var(--font-sf)", fontSize: 22, fontWeight: 600, lineHeight: "32px", letterSpacing: "-0.02em" }}>
            {stat.value}
          </span>
          <span style={{ fontSize: 12, lineHeight: "16px", color: "var(--color-muted)" }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
    )

  return (
    <div
      className="min-h-dvh bg-white"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <main className="max-w-[1056px] mx-auto px-6 pt-6 md:pt-16 pb-28 md:pb-20">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={panel}
            custom={dir}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            onAnimationComplete={(def) => {
              if (def !== "center" || firstRender.current) return
              const active = document.activeElement
              if (active && active !== document.body && active.closest("main")) return
              document
                .querySelector<HTMLElement>("[data-panel-heading]")
                ?.focus({ preventScroll: true })
            }}
          >
        {panel === "main" && (
          <>
            <h1
              data-panel-heading
              tabIndex={-1}
              className="text-ink outline-none text-center md:text-left leading-[1.1] tracking-[-0.035em] text-[clamp(40px,10vw,56px)]"
              style={{ fontFamily: "var(--font-sf)", fontWeight: 600 }}
            >
              Perfil
            </h1>

            <div className="flex flex-col gap-8 mt-6 max-w-[552px] mx-auto md:max-w-none md:mx-0 md:mt-10 md:grid md:gap-8 md:items-start md:grid-cols-[minmax(0,320px)_minmax(0,552px)] md:justify-between">
              <section className="flex flex-col items-center text-center md:items-start md:text-left">
                {STATIC_SITE ? (
                  <p className="text-meta" style={{ fontSize: 15, lineHeight: "24px" }}>
                    Sem conta e sem login. Suas preferências e palavras salvas ficam guardadas neste navegador.
                  </p>
                ) : (
                  <>
                <div className="relative size-[88px]">
                  {fluidAvatar}
                  <button
                    onClick={() => setPanel("edit-avatar")}
                    aria-label="Alterar foto"
                    className="absolute flex items-center justify-center rounded-full text-ink transition-colors hover:bg-[#dcdce1] border-[3px] border-white"
                    style={{
                      right: -4,
                      bottom: -4,
                      width: 32,
                      height: 32,
                      background: "#e8e8ed",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                      <circle cx="12" cy="13" r="3.5" />
                    </svg>
                  </button>
                </div>
                <h2
                  className="text-ink mt-4 text-[28px] leading-[36px] tracking-[-0.025em]"
                  style={{ fontFamily: "var(--font-sf)", fontWeight: 600 }}
                >
                  {name}
                </h2>
                <p className="mt-1 text-meta max-w-full [overflow-wrap:anywhere]" style={{ fontSize: 15, lineHeight: "24px" }}>
                  {email}
                </p>
                <button
                  onClick={() => {
                    s.setNameEdit(name)
                    setPanel("edit-name")
                  }}
                  className="mt-4 h-10 px-5 rounded-full border border-hairline text-ink font-medium transition-[border-color,scale] hover:border-ink active:scale-[0.97]"
                  style={{ fontSize: 14 }}
                >
                  Editar perfil
                </button>
                  </>
                )}
                {renderStats("hidden md:grid self-stretch grid-cols-3 gap-4 mt-8 pt-4", true)}
              </section>

              <div className="md:hidden border-t border-hairline pt-4">
                {renderStats("grid grid-cols-3 gap-2")}
              </div>

              <section className="flex flex-col gap-8">
                <div>
                  <p className="sec-label mb-3">{STATIC_SITE ? "Preferências" : "Conta"}</p>
                  <div className={CARD}>
                    {!STATIC_SITE && <Row
                      title="Notificações"
                      sub={notifications ? "Ativadas" : "Desativadas"}
                      trailing={
                        <Switch
                          on={notifications}
                          onToggle={() => {
                            const next = !notifications
                            session.updateSettings({ notifications: next }).catch(() => undefined)
                            toast({
                              id: "notif",
                              title: next ? "Notificações ativadas" : "Notificações desativadas",
                              description: next
                                ? "Você receberá a palavra do dia e novidades."
                                : "Você não receberá mais avisos do Diciobase.",
                              variant: next ? "success" : "info",
                            })
                          }}
                          label="Notificações"
                        />
                      }
                    />}
                    <Row
                      tip="profile-dicts"
                      title="Dicionários ativos"
                      sub="Gerenciar fontes"
                      value={String(activeDicts)}
                      onClick={() => setPanel("dicts")}
                      last={STATIC_SITE}
                    />
                    {!STATIC_SITE && <Row
                      title="Alterar senha"
                      onClick={() => setPanel("change-password")}
                      last
                    />}
                  </div>
                </div>

                <div>
                  <p className="sec-label mb-3">Ajuda</p>
                  <div className={CARD}>
                    <Row
                      title="Como funciona"
                      onClick={onTutorial}
                    />
                    <Row
                      tip="profile-tips"
                      title="Dicas de uso"
                      sub={tips.enabled ? "Ativadas" : "Desativadas"}
                      trailing={
                        <Switch
                          on={tips.enabled}
                          onToggle={() => {
                            const next = !tips.enabled
                            tips.setEnabled(next)
                            session.updateSettings({ tips: next }).catch(() => undefined)
                            toast({
                              id: "tips",
                              title: next ? "Dicas ativadas" : "Dicas desativadas",
                              description: next
                                ? "As explicações voltam a aparecer enquanto você usa o app."
                                : "Você não verá mais explicações durante o uso.",
                              variant: next ? "success" : "info",
                            })
                          }}
                          label="Dicas de uso"
                        />
                      }
                    />
                    <Row
                      title="Termos de uso"
                      onClick={() => setPanel("terms")}
                      last
                    />
                  </div>
                </div>

                {!STATIC_SITE && (
                  <>
                    <button
                      onClick={onLogout}
                      className="h-12 rounded-full border border-hairline font-medium transition-colors hover:border-danger"
                      style={{ fontSize: 15, color: "var(--color-danger)" }}
                    >
                      Sair da conta
                    </button>
                    <button
                      onClick={() => setPanel("delete-account")}
                      className="self-center hover:underline underline-offset-2"
                      style={{ fontSize: 14, color: "var(--color-label-secondary)" }}
                    >
                      Excluir conta
                    </button>
                  </>
                )}
              </section>
            </div>
          </>
        )}

        {panel === "delete-account" && (
          <SubPage onBack={() => setPanel("main")} title="Excluir conta">
            <div className="flex flex-col gap-5">
              <p
                className="rounded-lg px-5 py-4"
                style={{
                  fontSize: 15,
                  lineHeight: 1.6,
                  background: "var(--color-danger-tint)",
                  color: "var(--color-ink)",
                }}
              >
                Esta ação é permanente. Todas as suas palavras salvas e
                preferências serão perdidas e não poderão ser recuperadas.
              </p>
              <Field
                label="Confirme sua senha"
                type="password"
                value={deletePassword}
                onChange={(v) => {
                  setDeletePassword(v)
                  setDeleteError(undefined)
                }}
                error={deleteError}
              />
              <PrimaryButton
                label={busy ? "Excluindo…" : "Excluir minha conta"}
                danger
                disabled={busy}
                onClick={deleteAccount}
              />
            </div>
          </SubPage>
        )}

        {panel === "edit-avatar" && (
          <SubPage onBack={() => setPanel("main")} title="Foto de perfil">
            <div className="flex flex-col gap-8">
              <div className="self-center md:self-start">{avatar(120, 46)}</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickFile}
              />
              <div className={CARD}>
                <Row
                  title="Escolher da galeria"
                  onClick={() => fileRef.current?.click()}
                />
                <Row
                  title="Remover foto atual"
                  onClick={() => {
                    const had = !!avatarSrc
                    setAvatarSrc(undefined)
                    setPanel("main")
                    toast({
                      id: "avatar",
                      title: had ? "Foto removida" : "Você já está sem foto",
                      description: had ? "Mostrando a inicial do seu nome." : undefined,
                      variant: "info",
                    })
                  }}
                  last
                />
              </div>
            </div>
          </SubPage>
        )}

        {panel === "edit-name" && (
          <SubPage onBack={() => setPanel("main")} title="Editar perfil">
            <div className="flex flex-col gap-6">
              <Field
                label="Nome"
                value={s.nameEdit}
                onChange={s.setNameEdit}
                autoFocus
              />
              <PrimaryButton
                label="Salvar"
                disabled={busy || !s.nameEdit.trim() || s.nameEdit.trim() === name}
                onClick={async () => {
                  const next = s.nameEdit.trim()
                  setBusy(true)
                  try {
                    await session.updateName(next)
                  } catch (e) {
                    if (!(e instanceof ApiError && e.status === 401))
                      toast({ id: "name", title: "Não foi possível atualizar o nome", description: "Tente novamente em instantes.", variant: "info" })
                    return
                  } finally {
                    setBusy(false)
                  }
                  setPanel("main")
                  toast({
                    id: "name",
                    title: "Nome atualizado",
                    description: `Agora você aparece como “${next}”.`,
                  })
                }}
              />
            </div>
          </SubPage>
        )}

        {panel === "change-password" && (
          <SubPage onBack={() => setPanel("main")} title="Alterar senha">
            <div className="flex flex-col gap-6">
              <Field
                label="Senha atual"
                type="password"
                value={s.pwCurrent}
                onChange={(v) => {
                  s.setPwCurrent(v)
                  setPwErrors((e) => ({ ...e, current: undefined }))
                }}
                error={pwErrors.current}
                autoFocus
              />
              <Field
                label="Nova senha"
                type="password"
                value={s.pwNew}
                onChange={(v) => {
                  s.setPwNew(v)
                  setPwErrors((e) => ({ ...e, next: undefined }))
                }}
                error={pwErrors.next}
              />
              <Field
                label="Confirmar nova senha"
                type="password"
                value={s.pwConfirm}
                onChange={(v) => {
                  s.setPwConfirm(v)
                  setPwErrors((e) => ({ ...e, confirm: undefined }))
                }}
                error={pwErrors.confirm}
              />
              <PrimaryButton label="Salvar senha" onClick={savePassword} />
            </div>
          </SubPage>
        )}

        {panel === "dicts" && (
          <SubPage onBack={() => setPanel("main")} title="Dicionários ativos">
            <div className={CARD}>
              {DICT_LIST.map((d, i) => (
                <div
                  key={d.id}
                  className="relative flex items-center gap-4 px-5 py-3 min-h-[60px]"
                >
                  <span className="size-3 rounded-full shrink-0" style={{ background: d.c }} />
                  <span className="flex-1">
                    <span className="block text-ink" style={{ fontSize: 16, letterSpacing: "-0.01em" }}>
                      {d.name}
                    </span>
                    <span className="block mt-1" style={{ fontSize: 13, color: "var(--color-label-secondary)" }}>
                      {d.tag}
                    </span>
                  </span>
                  <Switch
                    on={dicts[d.id]}
                    onToggle={() => toggleDict(d.id, d.name)}
                    label={d.name}
                  />
                  {i < DICT_LIST.length - 1 && (
                    <span className="absolute bottom-0 right-0 h-px" style={{ left: 48, background: "#e8e8ed" }} />
                  )}
                </div>
              ))}
            </div>
          </SubPage>
        )}

        {panel === "terms" && (
          <SubPage onBack={() => setPanel("main")} title="Termos de uso">
            <TermsContent />
          </SubPage>
        )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
