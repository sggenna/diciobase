import { useRef } from "react";
import type * as React from "react";
import { AvatarBubble } from "@/components/profile/AvatarBubble";
import { ProfileCTA } from "@/components/profile/ProfileCTA";
import { ProfileInput } from "@/components/profile/ProfileInput";
import { ProfileMenuCard } from "@/components/profile/ProfileMenuCard";
import { Toggle } from "@/components/profile/Toggle";
import { DICT_LIST, PROFILE_MENU_ROWS, TERMS_SECTIONS } from "@/components/profile/profileMenu";
import { P } from "@/components/profile/profileTheme";
import { slideUpStyle } from "@/lib/animation";
import { SAVED_WORDS } from "@/lib/data";
import { useFade, useMobileProfileState } from "@/lib/hooks";

export function MobileProfilePage({ onLogout }: { onLogout: () => void }) {
  const s = useMobileProfileState();
  const vis = useFade(s.panel);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    s.setAvatarSrc(URL.createObjectURL(f));
    s.setPanel("main");
  }

  const topPad = { paddingTop: "max(env(safe-area-inset-top,0px),20px)" };

  const SubPage = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="min-h-screen flex flex-col" style={{ background: P.bg, ...topPad }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
        <button onClick={() => s.setPanel("main")} className="p-1 -ml-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.sub} strokeWidth="2.2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 16, color: P.text }}>{title}</span>
      </div>
      <div className="flex-1 px-5 pt-6 pb-28 overflow-y-auto">{children}</div>
    </div>
  );

  if (s.panel === "edit-avatar") return (
    <SubPage title="Foto de Perfil">
      <div className="flex flex-col items-center gap-6 pt-4">
        <AvatarBubble size={110} initials={s.name[0]} src={s.avatarSrc} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        <div className="w-full flex flex-col gap-3">
          {[
            { label: "Escolher da galeria", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.icon} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>, action: () => fileRef.current?.click() },
            { label: "Tirar foto", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.icon} strokeWidth="1.8" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>, action: () => fileRef.current?.click() },
            { label: "Remover foto atual", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={P.danger} strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>, action: () => { s.setAvatarSrc(undefined); s.setPanel("main"); }, danger: true },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="flex items-center gap-4 px-5 py-4 rounded-[16px] active:scale-[0.98] transition-transform"
              style={{ background: (item as {danger?:boolean}).danger ? P.dangerBg : P.card, border: `1px solid ${P.border}`, color: (item as {danger?:boolean}).danger ? P.danger : P.text }}>
              {item.icon}
              <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 15 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </SubPage>
  );

  if (s.panel === "edit-name") return (
    <SubPage title="Editar Nome">
      <div className="flex flex-col gap-5">
        <ProfileInput label="Nome" value={s.nameEdit} onChange={v => s.setNameEdit(v)} />
        <ProfileCTA label="Salvar" onClick={() => { s.setName(s.nameEdit); s.setPanel("main"); }} />
      </div>
    </SubPage>
  );

  if (s.panel === "change-password") return (
    <SubPage title="Alterar Senha">
      <div className="flex flex-col gap-5">
        {s.pwSaved && (
          <div className="px-4 py-3 rounded-[12px]" style={{ background: P.successBg, border: `1px solid ${P.successBd}` }}>
            <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 13, color: P.successTx }}>Senha alterada com sucesso!</span>
          </div>
        )}
        <ProfileInput label="Senha atual" type="password" value={s.pwCurrent} onChange={s.setPwCurrent} />
        <ProfileInput label="Nova senha" type="password" value={s.pwNew} onChange={s.setPwNew} />
        <ProfileInput label="Confirmar nova senha" type="password" value={s.pwConfirm} onChange={s.setPwConfirm} />
        <ProfileCTA label="Salvar senha" onClick={() => { s.setPwSaved(true); s.setPwCurrent(""); s.setPwNew(""); s.setPwConfirm(""); setTimeout(() => s.setPwSaved(false), 3000); }} />
      </div>
    </SubPage>
  );

  if (s.panel === "notifications") return (
    <SubPage title="Notificações">
      <div className="rounded-[18px] overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
        {[
          { label: "Novas palavras", sub: "Palavra do dia e vocabulário novo", on: s.notifs, toggle: () => s.setNotifs(n => !n) },
          { label: "Dicas de uso", sub: "Como usar o DICIOBASE melhor", on: true, toggle: () => {} },
          { label: "Novidades da plataforma", sub: "Atualizações e melhorias", on: false, toggle: () => {} },
        ].map((row, i) => (
          <div key={row.label} className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}>
            <div className="flex flex-col gap-0.5 flex-1 pr-4">
              <span style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: P.text }}>{row.label}</span>
              <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 12, color: P.sub }}>{row.sub}</span>
            </div>
            <Toggle on={row.on} onToggle={row.toggle} />
          </div>
        ))}
      </div>
    </SubPage>
  );

  if (s.panel === "dicts") return (
    <SubPage title="Dicionários Ativos">
      <div className="rounded-[18px] overflow-hidden" style={{ background: P.card, border: `1px solid ${P.border}` }}>
        {DICT_LIST.map((d, i) => (
          <div key={d.id} className="flex items-center justify-between px-5 py-4"
            style={{ borderTop: i > 0 ? `1px solid ${P.border}` : undefined }}>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.c }} />
              <div>
                <div style={{ fontFamily: "'Poppins:Medium'", fontSize: 14, color: P.text }}>{d.name}</div>
                <div style={{ fontFamily: "'Poppins:Regular'", fontSize: 11, color: P.sub }}>{d.tag}</div>
              </div>
            </div>
            <Toggle on={s.dictToggles[d.id]} onToggle={() => s.setDictToggles(t => ({ ...t, [d.id]: !t[d.id] }))} />
          </div>
        ))}
      </div>
    </SubPage>
  );

  if (s.panel === "terms") return (
    <SubPage title="Termos de Uso">
      <div className="flex flex-col gap-5">
        {TERMS_SECTIONS.map(sec => (
          <div key={sec.title}>
            <p style={{ fontFamily: "'Poppins:SemiBold'", fontSize: 13, color: P.text, marginBottom: 4 }}>{sec.title}</p>
            <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 12, color: P.sub, lineHeight: 1.65 }}>{sec.body}</p>
          </div>
        ))}
        <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Última atualização: Setembro de 2026</p>
      </div>
    </SubPage>
  );

  // ── Main ─────────────────────────────────────────────────────────────────
  const menuRows = PROFILE_MENU_ROWS(s.setPanel, onLogout);
  return (
    <div className="min-h-screen flex flex-col overflow-y-auto pb-28" style={{ background: P.bg }}>
      {/* Hero section */}
      <div className="relative flex flex-col items-center pb-6"
        style={{ paddingTop: "max(env(safe-area-inset-top,0px),48px)" }}>

        {/* Edit avatar button */}
        <div className="relative mb-5">
          {s.avatarSrc ? (
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden"
              style={{ border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <img src={s.avatarSrc} alt="" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
              style={{ background: P.avatarBg, border: "3px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
              <span style={{ fontFamily: "'Poppins:ExtraBold'", fontSize: 42, color: P.text }}>{s.name[0]}</span>
            </div>
          )}
          <button onClick={() => s.setPanel("edit-avatar")}
            className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "#ffffff", border: `1.5px solid ${P.borderMid}`, boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={P.text} strokeWidth="2.2" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
        </div>

        <p style={{ fontFamily: "'Poppins:Bold'", fontSize: 24, color: P.text, letterSpacing: "-0.4px", marginBottom: 2 }}>{s.name}</p>
        <p style={{ fontFamily: "'Poppins:Regular'", fontSize: 13, color: P.sub }}>maria@email.com</p>

        {/* Stats strip */}
        <div className="flex gap-0 mt-6 w-full px-4">
          {[{ label: "Palavras salvas", value: String(SAVED_WORDS.length) }, { label: "Pesquisas", value: "47" }, { label: "Membro desde", value: "Set '26" }].map((stat, i) => (
            <div key={stat.label} className="flex-1 flex flex-col items-center py-3"
              style={{ borderLeft: i > 0 ? `1px solid ${P.border}` : undefined, borderTop: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}`,
                borderRight: i === 2 ? `1px solid ${P.border}` : undefined,
                background: P.card,
                borderRadius: i === 0 ? "12px 0 0 12px" : i === 2 ? "0 12px 12px 0" : undefined }}>
              <span style={{ fontFamily: "'Poppins:ExtraBold'", fontSize: 20, color: P.text, lineHeight: 1 }}>{stat.value}</span>
              <span style={{ fontFamily: "'Poppins:Regular'", fontSize: 10, color: P.sub, marginTop: 3 }}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4" style={slideUpStyle(vis, 0.06)}>
        <ProfileMenuCard rows={menuRows} />
      </div>
    </div>
  );
}
