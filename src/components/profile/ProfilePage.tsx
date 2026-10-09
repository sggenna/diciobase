import { useEffect, useRef, useState } from "react"
import type * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { DICT_LIST, TERMS_SECTIONS } from "@/components/profile/profileMenu"
import { useToast } from "@/components/ui/Toast"
import { SAVED_WORDS } from "@/lib/data"
import type { useMobileProfileState } from "@/lib/hooks"

const CARD = "rounded-[18px] bg-white overflow-hidden"
const LABEL_STYLE: React.CSSProperties = {
  fontSize: 13,
  letterSpacing: "0.04em",
  color: "var(--color-label-secondary)",
}

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
        width: 51,
        height: 31,
        background: on ? "var(--color-ink)" : "#e5e5ea",
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-transform duration-[250ms]"
        style={{
          left: 2,
          top: 2,
          width: 27,
          height: 27,
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          transform: on ? "translateX(20px)" : "translateX(0)",
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

function RowIcon({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="shrink-0 flex items-center justify-center rounded-[10px]"
      style={{ width: 36, height: 36, background: "#f2f2f4" }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </span>
  )
}

function Row({
  icon,
  title,
  sub,
  value,
  onClick,
  trailing,
  last,
}: {
  icon: React.ReactNode
  title: string
  sub?: string
  value?: string
  onClick?: () => void
  trailing?: React.ReactNode
  last?: boolean
}) {
  const content = (
    <>
      <RowIcon>{icon}</RowIcon>
      <span className="flex-1 text-left">
        <span className="block text-ink" style={{ fontSize: 17, letterSpacing: "-0.02em" }}>
          {title}
        </span>
        {sub && (
          <span className="block mt-0.5" style={{ fontSize: 13, color: "var(--color-label-secondary)" }}>
            {sub}
          </span>
        )}
      </span>
      {value && (
        <span style={{ fontSize: 15, color: "var(--color-label-secondary)" }}>{value}</span>
      )}
      {trailing ?? (onClick ? <Chevron /> : null)}
      {!last && (
        <span
          className="absolute bottom-0 right-0 h-px"
          style={{ left: 72, background: "#e8e8ed" }}
        />
      )}
    </>
  )
  const cls = "relative flex items-center gap-3.5 w-full px-5 py-2.5 min-h-[60px]"
  return onClick ? (
    <button onClick={onClick} className={`${cls} transition-colors hover:bg-surface`}>
      {content}
    </button>
  ) : (
    <div className={cls}>{content}</div>
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
  const ring = error ? "0 0 0 2px var(--color-danger)" : "0 0 0 1px rgba(0,0,0,0.08)"
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
        className="h-[52px] px-4 rounded-xl bg-white text-ink outline-none transition-shadow"
        style={{ fontSize: 17, boxShadow: ring }}
        onFocus={(e) =>
          (e.currentTarget.style.boxShadow = error
            ? "0 0 0 2px var(--color-danger)"
            : "0 0 0 2px var(--color-ink)")
        }
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
      className="h-[52px] rounded-full font-medium transition-[background-color,scale,opacity] active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
      style={{
        fontSize: 16,
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
    <div className="max-w-[560px]">
      <nav aria-label="Trilha de navegação">
        <ol className="flex items-center gap-1.5" style={{ fontSize: 14 }}>
          <li>
            <button
              onClick={onBack}
              className="text-label-secondary hover:text-ink transition-colors"
            >
              Perfil
            </button>
          </li>
          <li aria-hidden="true" className="text-[#C7C7CC] flex">
            <Chevron />
          </li>
          <li aria-current="page" className="text-ink font-medium">
            {title.replace(/\.$/, "")}
          </li>
        </ol>
      </nav>
      <h1
        data-panel-heading
        tabIndex={-1}
        className="text-ink mt-5 mb-8 outline-none"
        style={{ fontSize: "clamp(32px, 9vw, 44px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05 }}
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

export function ProfilePage({
  state: s,
  onLogout,
  onTutorial,
}: {
  state: ReturnType<typeof useMobileProfileState>
  onLogout: () => void
  onTutorial: () => void
}) {
  const { panel, setPanel, name, avatarSrc, setAvatarSrc } = s
  const { toast } = useToast()
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

  function toggleDict(id: "aurelio" | "houaiss" | "michaelis", dictName: string) {
    const turningOff = s.dictToggles[id]
    if (turningOff && Object.values(s.dictToggles).filter(Boolean).length === 1) {
      toast({
        id: "dict-min",
        title: "Mantenha um dicionário ativo",
        description: "Sem ao menos uma fonte ativa, as buscas não retornam definições.",
        variant: "info",
      })
      return
    }
    s.setDictToggles((t) => ({ ...t, [id]: !t[id] }))
    toast({
      id: `dict-${id}`,
      title: `${dictName} ${turningOff ? "desativado" : "ativado"}`,
      description: turningOff
        ? "Ele deixa de aparecer nas definições."
        : "Ele volta a aparecer nas definições.",
      variant: turningOff ? "info" : "success",
    })
  }

  function savePassword() {
    const errors: typeof pwErrors = {}
    if (!s.pwCurrent) errors.current = "Digite sua senha atual."
    if (s.pwNew.length < 8) errors.next = "Use ao menos 8 caracteres."
    if (s.pwConfirm !== s.pwNew) errors.confirm = "As senhas não coincidem."
    setPwErrors(errors)
    if (Object.keys(errors).length) return
    s.setPwCurrent("")
    s.setPwNew("")
    s.setPwConfirm("")
    setPanel("main")
    toast({
      id: "password",
      title: "Senha alterada",
      description: "Use a nova senha no seu próximo acesso.",
    })
  }

  const activeDicts = Object.values(s.dictToggles).filter(Boolean).length

  const avatar = (size: number, font: number) =>
    avatarSrc ? (
      <img
        src={avatarSrc}
        alt=""
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    ) : (
      <div
        className="rounded-full bg-ink text-on-ink flex items-center justify-center font-semibold"
        style={{ width: size, height: size, fontSize: font, letterSpacing: "-0.02em" }}
      >
        {name[0]}
      </div>
    )

  const fluidAvatar = avatarSrc ? (
    <img src={avatarSrc} alt="" className="size-full rounded-full object-cover" />
  ) : (
    <div
      className="size-full rounded-full bg-ink text-on-ink flex items-center justify-center font-semibold text-[34px] md:text-[40px]"
      style={{ letterSpacing: "-0.02em" }}
    >
      {name[0]}
    </div>
  )

  const renderStats = (className: string, desktopBorder?: boolean) => (
    <div
      className={className}
      style={desktopBorder ? { borderTop: "1px solid #e8e8ed" } : undefined}
    >
      {[
        { value: String(SAVED_WORDS.length), label: "Palavras salvas" },
        { value: "47", label: "Pesquisas" },
        { value: "Set ’26", label: "Membro desde" },
      ].map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-1 py-1"
          style={{ borderLeft: i > 0 ? "1px solid #e8e8ed" : undefined }}
        >
          <span
            className="text-ink font-semibold text-[20px] md:text-[24px]"
            style={{ letterSpacing: "-0.03em" }}
          >
            {stat.value}
          </span>
          <span style={{ fontSize: 12, color: "var(--color-label-secondary)" }}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div
      className="min-h-screen bg-surface"
      style={{ fontFamily: "var(--font-sf)" }}
    >
      <main className="max-w-[980px] mx-auto px-4 md:px-8 pt-14 md:pt-10 pb-28 md:pb-20">
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
              className="text-ink outline-none ml-1 md:ml-0 text-[34px] font-bold tracking-[-0.02em] md:text-[56px] md:font-semibold md:leading-[1.05] md:tracking-[-0.03em]"
            >
              Perfil<span className="hidden md:inline">.</span>
            </h1>

            <div className="flex flex-col gap-[22px] mt-5 md:mt-9 md:grid md:gap-6 md:items-start md:grid-cols-[360px_minmax(0,1fr)]">
              <section className="flex flex-col items-center text-center md:rounded-[18px] md:bg-white md:px-7 md:pt-9 md:pb-7">
                <div className="relative size-[88px] md:size-[104px]">
                  {fluidAvatar}
                  <button
                    onClick={() => setPanel("edit-avatar")}
                    aria-label="Alterar foto"
                    className="absolute flex items-center justify-center rounded-full text-ink transition-colors hover:bg-[#dcdce1] border-[3px] border-surface md:border-white"
                    style={{
                      right: -2,
                      bottom: -2,
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
                  className="text-ink mt-3.5 md:mt-5 text-[22px] md:text-[28px] font-semibold tracking-[-0.02em]"
                >
                  {name}
                </h2>
                <p className="mt-0.5" style={{ fontSize: 15, color: "var(--color-label-secondary)" }}>
                  maria@email.com
                </p>
                <button
                  onClick={() => {
                    s.setNameEdit(name)
                    setPanel("edit-name")
                  }}
                  className="mt-3 md:mt-[18px] h-9 px-[18px] rounded-full text-ink font-medium transition-[background-color,scale] hover:bg-[#dcdce1] active:scale-[0.97]"
                  style={{ fontSize: 14, background: "#e8e8ed" }}
                >
                  Editar perfil
                </button>
                {renderStats("hidden md:grid self-stretch grid-cols-3 mt-7 pt-6", true)}
              </section>

              <div className="md:hidden rounded-[18px] bg-white py-4">
                {renderStats("grid grid-cols-3")}
              </div>

              <section className="flex flex-col gap-6">
                <div>
                  <p className="uppercase mb-2 ml-5" style={LABEL_STYLE}>Conta</p>
                  <div className={CARD}>
                    <Row
                      icon={
                        <>
                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </>
                      }
                      title="Notificações"
                      sub={s.notifs ? "Ativadas" : "Desativadas"}
                      trailing={
                        <Switch
                          on={s.notifs}
                          onToggle={() => {
                            const next = !s.notifs
                            s.setNotifs(next)
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
                    />
                    <Row
                      icon={
                        <>
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
                          <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
                        </>
                      }
                      title="Dicionários ativos"
                      sub="Gerenciar fontes"
                      value={String(activeDicts)}
                      onClick={() => setPanel("dicts")}
                    />
                    <Row
                      icon={
                        <>
                          <rect x="4" y="11" width="16" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </>
                      }
                      title="Alterar senha"
                      onClick={() => setPanel("change-password")}
                      last
                    />
                  </div>
                </div>

                <div>
                  <p className="uppercase mb-2 ml-5" style={LABEL_STYLE}>Ajuda</p>
                  <div className={CARD}>
                    <Row
                      icon={
                        <>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M9.5 9a2.5 2.5 0 0 1 4.9.7c0 1.7-2.4 2.3-2.4 3.8" />
                          <path d="M12 17h.01" />
                        </>
                      }
                      title="Como funciona"
                      onClick={onTutorial}
                    />
                    <Row
                      icon={
                        <>
                          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                          <path d="M14 3v5h5" />
                          <path d="M9 13h6M9 17h6" />
                        </>
                      }
                      title="Termos de uso"
                      onClick={() => setPanel("terms")}
                      last
                    />
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="h-14 rounded-[18px] bg-white font-normal transition-colors hover:bg-[#fafafa]"
                  style={{ fontSize: 17, letterSpacing: "-0.02em", color: "#d70015" }}
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
              </section>
            </div>
          </>
        )}

        {panel === "delete-account" && (
          <SubPage onBack={() => setPanel("main")} title="Excluir conta.">
            <div className="flex flex-col gap-5">
              <p
                className="rounded-2xl px-5 py-4"
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
              <PrimaryButton
                label="Excluir minha conta"
                danger
                onClick={() => {
                  onLogout()
                  toast({
                    id: "auth",
                    title: "Conta excluída",
                    description: "Seus dados foram removidos do Diciobase.",
                    variant: "info",
                  })
                }}
              />
            </div>
          </SubPage>
        )}

        {panel === "edit-avatar" && (
          <SubPage onBack={() => setPanel("main")} title="Foto de perfil.">
            <div className="flex flex-col gap-8">
              {avatar(120, 46)}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickFile}
              />
              <div className={CARD}>
                <Row
                  icon={
                    <>
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </>
                  }
                  title="Escolher da galeria"
                  onClick={() => fileRef.current?.click()}
                />
                <Row
                  icon={
                    <>
                      <path d="M3 6h18" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </>
                  }
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
          <SubPage onBack={() => setPanel("main")} title="Editar perfil.">
            <div className="flex flex-col gap-6">
              <Field
                label="Nome"
                value={s.nameEdit}
                onChange={s.setNameEdit}
                autoFocus
              />
              <PrimaryButton
                label="Salvar"
                disabled={!s.nameEdit.trim() || s.nameEdit.trim() === name}
                onClick={() => {
                  const next = s.nameEdit.trim()
                  s.setName(next)
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
          <SubPage onBack={() => setPanel("main")} title="Alterar senha.">
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
          <SubPage onBack={() => setPanel("main")} title="Dicionários ativos.">
            <div className={CARD}>
              {DICT_LIST.map((d, i) => (
                <div
                  key={d.id}
                  className="relative flex items-center gap-3.5 px-5 py-3 min-h-[60px]"
                >
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: d.c }} />
                  <span className="flex-1">
                    <span className="block text-ink" style={{ fontSize: 17, letterSpacing: "-0.02em" }}>
                      {d.name}
                    </span>
                    <span className="block mt-0.5" style={{ fontSize: 13, color: "var(--color-label-secondary)" }}>
                      {d.tag}
                    </span>
                  </span>
                  <Switch
                    on={s.dictToggles[d.id]}
                    onToggle={() => toggleDict(d.id, d.name)}
                    label={d.name}
                  />
                  {i < DICT_LIST.length - 1 && (
                    <span className="absolute bottom-0 right-0 h-px" style={{ left: 54, background: "#e8e8ed" }} />
                  )}
                </div>
              ))}
            </div>
          </SubPage>
        )}

        {panel === "terms" && (
          <SubPage onBack={() => setPanel("main")} title="Termos de uso.">
            <div className="flex flex-col gap-6">
              {TERMS_SECTIONS.map((sec) => (
                <div key={sec.title}>
                  <p className="text-ink font-semibold mb-1" style={{ fontSize: 16 }}>
                    {sec.title}
                  </p>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--color-label-secondary)" }}>
                    {sec.body}
                  </p>
                </div>
              ))}
              <p className="text-muted" style={{ fontSize: 12 }}>
                Última atualização: Setembro de 2026
              </p>
            </div>
          </SubPage>
        )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
