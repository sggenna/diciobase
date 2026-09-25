import { useRef } from "react"
import type * as React from "react"
import { AvatarBubble } from "@/components/profile/AvatarBubble"
import { ProfileBackBtn } from "@/components/profile/ProfileBackBtn"
import { ProfileCTA } from "@/components/profile/ProfileCTA"
import { ProfileInput } from "@/components/profile/ProfileInput"
import { ProfileMenuCard } from "@/components/profile/ProfileMenuCard"
import { ProfileSubHeader } from "@/components/profile/ProfileSubHeader"
import { Toggle } from "@/components/profile/Toggle"
import {
  DICT_LIST,
  PROFILE_MENU_ROWS,
  TERMS_SECTIONS,
} from "@/components/profile/profileMenu"
import { P } from "@/components/profile/profileTheme"
import { fadeStyle } from "@/lib/animation"
import { SAVED_WORDS } from "@/lib/data"
import { useFade, useMobileProfileState } from "@/lib/hooks"

export function ProfilePage({
  onLogout,
  onBack,
}: {
  onLogout: () => void
  onBack: () => void
}) {
  const s = useMobileProfileState()
  const panel = s.panel
  const setPanel = s.setPanel
  const name = s.name
  const avatarSrc = s.avatarSrc
  const setAvatarSrc = s.setAvatarSrc
  const notifs = s.notifs
  const setNotifs = s.setNotifs
  const dictToggles = s.dictToggles
  const setDictToggles = s.setDictToggles
  const pwCurrent = s.pwCurrent
  const setPwCurrent = s.setPwCurrent
  const pwNew = s.pwNew
  const setPwNew = s.setPwNew
  const pwConfirm = s.pwConfirm
  const setPwConfirm = s.setPwConfirm
  const pwSaved = s.pwSaved
  const setPwSaved = s.setPwSaved
  const nameEdit = s.nameEdit
  const setNameEdit = s.setNameEdit
  const vis = useFade(panel)
  const fileRef = useRef<HTMLInputElement>(null)

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setAvatarSrc(URL.createObjectURL(f))
    setPanel("main")
  }

  const menuRows = PROFILE_MENU_ROWS(setPanel, onLogout)

  return (
    <div
      className="min-h-screen"
      style={{ background: P.bg, ...fadeStyle(vis) }}
    >
      <main className="max-w-[520px] mx-auto px-6 pt-10 pb-16">
        <div className="mb-8">
          <ProfileBackBtn
            onClick={panel === "main" ? onBack : () => setPanel("main")}
          />
        </div>

        {panel === "main" && (
          <div style={fadeStyle(vis)}>
            <div
              className="rounded-[28px] flex flex-col items-center gap-2 py-10 mb-5"
              style={{ background: P.card, border: `1px solid ${P.border}` }}
            >
              <p
                style={{
                  fontFamily: "'Poppins:ExtraBold'",
                  fontSize: 20,
                  color: P.text,
                  letterSpacing: "-0.4px",
                  marginBottom: 16,
                }}
              >
                Perfil
              </p>
              <div className="relative">
                <AvatarBubble size={96} initials={name[0]} src={avatarSrc} />
                <button
                  onClick={() => setPanel("edit-avatar")}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${P.borderMid}`,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                  onPointerEnter={(e) =>
                    (e.currentTarget.style.background = "#f0ede6")
                  }
                  onPointerLeave={(e) =>
                    (e.currentTarget.style.background = "#ffffff")
                  }
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={P.text}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
              </div>
              <p
                style={{
                  fontFamily: "'Poppins:Bold'",
                  fontSize: 20,
                  color: P.text,
                  marginTop: 8,
                }}
              >
                {name}
              </p>
              <p
                style={{
                  fontFamily: "'Poppins:Regular'",
                  fontSize: 13,
                  color: P.sub,
                }}
              >
                maria@email.com
              </p>
              <div
                className="flex gap-6 mt-5 pt-5 w-full justify-center"
                style={{ borderTop: `1px solid ${P.border}` }}
              >
                {[
                  {
                    label: "Palavras salvas",
                    value: String(SAVED_WORDS.length),
                  },
                  { label: "Pesquisas", value: "47" },
                  { label: "Membro desde", value: "Set '26" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-0.5 px-5"
                    style={{
                      borderLeft: i > 0 ? `1px solid ${P.border}` : undefined,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Poppins:ExtraBold'",
                        fontSize: 22,
                        color: P.text,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins:Regular'",
                        fontSize: 11,
                        color: P.sub,
                      }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <ProfileMenuCard rows={menuRows} />
          </div>
        )}

        {panel === "edit-avatar" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader
              title="Foto de Perfil"
              onBack={() => setPanel("main")}
            />
            <div className="flex flex-col items-center gap-8">
              <AvatarBubble size={120} initials={name[0]} src={avatarSrc} />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickFile}
              />
              <div className="w-full flex flex-col gap-3">
                {[
                  {
                    label: "Escolher da galeria",
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={P.icon}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                      </svg>
                    ),
                    action: () => fileRef.current?.click(),
                  },
                  {
                    label: "Remover foto atual",
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={P.danger}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    ),
                    action: () => {
                      setAvatarSrc(undefined)
                      setPanel("main")
                    },
                    danger: true,
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex items-center gap-4 px-6 py-4 rounded-[16px] transition-colors text-left"
                    style={{
                      background: (item as { danger?: boolean }).danger
                        ? P.dangerBg
                        : P.card,
                      border: `1px solid ${P.border}`,
                      color: (item as { danger?: boolean }).danger
                        ? P.danger
                        : P.text,
                    }}
                    onPointerEnter={(e) =>
                      (e.currentTarget.style.background = (item as {
                        danger?: boolean
                      }).danger
                        ? "rgba(224,92,75,0.18)"
                        : P.cardAlt)
                    }
                    onPointerLeave={(e) =>
                      (e.currentTarget.style.background = (item as {
                        danger?: boolean
                      }).danger
                        ? P.dangerBg
                        : P.card)
                    }
                  >
                    {item.icon}
                    <span
                      style={{ fontFamily: "'Poppins:Medium'", fontSize: 15 }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {panel === "edit-name" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader
              title="Editar Nome"
              onBack={() => setPanel("main")}
            />
            <div className="flex flex-col gap-5">
              <ProfileInput
                label="Nome"
                value={nameEdit}
                onChange={(v) => setNameEdit(v)}
              />
              <ProfileCTA
                label="Salvar"
                onClick={() => {
                  s.setName(nameEdit)
                  setPanel("main")
                }}
              />
            </div>
          </div>
        )}

        {panel === "change-password" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader
              title="Alterar Senha"
              onBack={() => setPanel("main")}
            />
            <div className="flex flex-col gap-5">
              {pwSaved && (
                <div
                  className="px-5 py-3.5 rounded-[14px]"
                  style={{
                    background: P.successBg,
                    border: `1px solid ${P.successBd}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Poppins:Medium'",
                      fontSize: 13,
                      color: P.successTx,
                    }}
                  >
                    Senha alterada com sucesso!
                  </span>
                </div>
              )}
              <ProfileInput
                label="Senha atual"
                type="password"
                value={pwCurrent}
                onChange={setPwCurrent}
              />
              <ProfileInput
                label="Nova senha"
                type="password"
                value={pwNew}
                onChange={setPwNew}
              />
              <ProfileInput
                label="Confirmar nova senha"
                type="password"
                value={pwConfirm}
                onChange={setPwConfirm}
              />
              <ProfileCTA
                label="Salvar senha"
                onClick={() => {
                  setPwSaved(true)
                  setPwCurrent("")
                  setPwNew("")
                  setPwConfirm("")
                  setTimeout(() => setPwSaved(false), 3000)
                }}
              />
            </div>
          </div>
        )}

        {panel === "notifications" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader
              title="Notificações"
              onBack={() => setPanel("main")}
            />
            <div
              className="rounded-[20px] overflow-hidden"
              style={{ background: P.card, border: `1px solid ${P.border}` }}
            >
              {[
                {
                  label: "Novas palavras",
                  sub: "Palavra do dia e vocabulário novo",
                  on: notifs,
                  toggle: () => setNotifs((n) => !n),
                },
                {
                  label: "Dicas de uso",
                  sub: "Como usar o DICIOBASE melhor",
                  on: true,
                  toggle: () => {},
                },
                {
                  label: "Novidades da plataforma",
                  sub: "Atualizações e melhorias",
                  on: false,
                  toggle: () => {},
                },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between px-6 py-4"
                  style={{
                    borderTop: i > 0 ? `1px solid ${P.border}` : undefined,
                  }}
                >
                  <div className="flex flex-col gap-0.5 flex-1 pr-6">
                    <span
                      style={{
                        fontFamily: "'Poppins:Medium'",
                        fontSize: 14,
                        color: P.text,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Poppins:Regular'",
                        fontSize: 12,
                        color: P.sub,
                      }}
                    >
                      {row.sub}
                    </span>
                  </div>
                  <Toggle on={row.on} onToggle={row.toggle} />
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === "dicts" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader
              title="Dicionários Ativos"
              onBack={() => setPanel("main")}
            />
            <div
              className="rounded-[20px] overflow-hidden"
              style={{ background: P.card, border: `1px solid ${P.border}` }}
            >
              {DICT_LIST.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between px-6 py-4"
                  style={{
                    borderTop: i > 0 ? `1px solid ${P.border}` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: d.c }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: "'Poppins:Medium'",
                          fontSize: 14,
                          color: P.text,
                        }}
                      >
                        {d.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "'Poppins:Regular'",
                          fontSize: 11,
                          color: P.sub,
                        }}
                      >
                        {d.tag}
                      </div>
                    </div>
                  </div>
                  <Toggle
                    on={dictToggles[d.id]}
                    onToggle={() =>
                      setDictToggles((t) => ({ ...t, [d.id]: !t[d.id] }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {panel === "terms" && (
          <div style={fadeStyle(vis)}>
            <ProfileSubHeader
              title="Termos de Uso"
              onBack={() => setPanel("main")}
            />
            <div className="flex flex-col gap-6">
              {TERMS_SECTIONS.map((sec) => (
                <div key={sec.title}>
                  <p
                    style={{
                      fontFamily: "'Poppins:SemiBold'",
                      fontSize: 14,
                      color: P.text,
                      marginBottom: 5,
                    }}
                  >
                    {sec.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Poppins:Regular'",
                      fontSize: 13,
                      color: P.sub,
                      lineHeight: 1.65,
                    }}
                  >
                    {sec.body}
                  </p>
                </div>
              ))}
              <p
                style={{
                  fontFamily: "'Poppins:Regular'",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                  marginTop: 8,
                }}
              >
                Última atualização: Setembro de 2026
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
