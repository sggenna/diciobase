import { useState } from "react";
import { slideUpStyle } from "@/lib/animation";
import { imgLogoDark2 } from "@/lib/assets";
import { useFade } from "@/lib/hooks";

export function MobileAuthPage({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [showPwd, setShowPwd] = useState(false);
  const vis = useFade("mobile-auth");

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col justify-center px-6 py-8"
      style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 40px)" }}>
      {/* Logo + tagline */}
      <div className="flex flex-col items-center gap-3 mb-8" style={slideUpStyle(vis, 0)}>
        <img src={imgLogoDark2} alt="DICIOBASE" style={{ height: 46, width: "auto" }} />
        <p className="font-['Poppins:Regular'] text-[14px] text-[#8c8a82] text-center leading-[1.5] max-w-[240px]">
          O seu dicionário português, sempre ao seu alcance.
        </p>
      </div>

      {/* Mode switcher */}
      <div className="bg-[#efece6] rounded-[14px] p-[4px] flex mb-6" style={slideUpStyle(vis, 0.06)}>
        {(["entrar", "criar"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 h-[44px] rounded-[10px] font-['Poppins:SemiBold'] text-[15px] transition-all duration-250"
            style={{
              background: mode === m ? "#fff" : "transparent",
              color: mode === m ? "#1c1b19" : "#8c8a82",
              boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
            }}>
            {m === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-5" style={slideUpStyle(vis, 0.1)}>
        <div className="flex flex-col gap-1.5">
          <label className="font-['Poppins:Medium'] text-[13px] text-[#1c1b19]">E-mail</label>
          <input type="email" placeholder="nome@exemplo.com"
            className="w-full h-[52px] px-4 rounded-[12px] border border-[#e0ddd6] bg-white font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#c0bcb4] outline-none focus:border-black transition-colors" />
        </div>
        {mode === "criar" && (
          <div className="flex flex-col gap-1.5">
            <label className="font-['Poppins:Medium'] text-[13px] text-[#1c1b19]">Nome</label>
            <input type="text" placeholder="Seu nome"
              className="w-full h-[52px] px-4 rounded-[12px] border border-[#e0ddd6] bg-white font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#c0bcb4] outline-none focus:border-black transition-colors" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="font-['Poppins:Medium'] text-[13px] text-[#1c1b19]">Senha</label>
            {mode === "entrar" && (
              <button className="font-['Poppins:SemiBold'] text-[13px] text-[#1c1b19]">Esqueceu?</button>
            )}
          </div>
          <div className="relative">
            <input type={showPwd ? "text" : "password"} placeholder="••••••••••••"
              className="w-full h-[52px] px-4 pr-12 rounded-[12px] border border-[#e0ddd6] bg-white font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#c0bcb4] outline-none focus:border-black transition-colors" />
            <button onClick={() => setShowPwd(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8a82] hover:text-black transition-colors">
              {showPwd ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-5 mt-8" style={slideUpStyle(vis, 0.14)}>
        <button onClick={onLogin}
          className="w-full h-[54px] bg-black rounded-[14px] font-['Poppins:SemiBold'] text-[16px] text-white active:scale-[0.97] transition-transform duration-150">
          {mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e0ddd6]" />
          <span className="font-['Poppins:Regular'] text-[12px] text-[#8c8a82]">ou continue com</span>
          <div className="flex-1 h-px bg-[#e0ddd6]" />
        </div>

        <div className="flex gap-3">
          <button className="flex-1 h-[50px] bg-white border border-[#e0ddd6] rounded-[12px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            <span className="font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19]">Google</span>
          </button>
          <button className="flex-1 h-[50px] bg-white border border-[#e0ddd6] rounded-[12px] flex items-center justify-center gap-2 active:scale-[0.97] transition-transform">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.18 1.27-2.15 3.79.03 3.02 2.65 4.03 2.68 4.04l-.08.24zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            <span className="font-['Poppins:SemiBold'] text-[14px] text-[#1c1b19]">Apple</span>
          </button>
        </div>

        <p className="text-center font-['Poppins:Regular'] text-[13px] text-[#8c8a82]">
          {mode === "entrar" ? "Não tem conta? " : "Já tem conta? "}
          <button onClick={() => setMode(mode === "entrar" ? "criar" : "entrar")}
            className="font-['Poppins:SemiBold'] text-[#1c1b19]">
            {mode === "entrar" ? "Crie agora" : "Entrar"}
          </button>
        </p>
      </div>
    </div>
  );
}
