import { useState } from "react";
import { AuthInput } from "@/components/auth/AuthInput";
import { fadeStyle } from "@/lib/animation";
import { imgLogoDark } from "@/lib/assets";
import { useFade } from "@/lib/hooks";

export function AuthModal({
  defaultMode,
  onAuth,
  onClose,
}: {
  defaultMode: "login" | "signup";
  onAuth: () => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const vis = useFade(mode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-[460px] bg-[#0f0e0c] rounded-[32px] p-8 sm:p-10 flex flex-col gap-5 shadow-2xl my-auto"
        style={fadeStyle(vis)}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          aria-label="Fechar"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l10 10M11 1L1 11"/>
          </svg>
        </button>

        {/* Logo */}
        <div className="flex justify-center pt-1">
          <img src={imgLogoDark} alt="DICIOBASE" className="h-8 w-auto" />
        </div>

        {/* Mode tabs */}
        <div className="flex bg-white/10 rounded-full p-1">
          {(["login","signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 h-9 rounded-full font-['Poppins:SemiBold'] text-[13px] transition-all duration-200"
              style={{
                background: mode === m ? "white" : "transparent",
                color: mode === m ? "#0f0e0c" : "rgba(255,255,255,0.55)",
              }}
            >
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          {mode === "signup" && (
            <AuthInput label="Nome" placeholder="Seu nome" />
          )}
          <AuthInput label="E-mail" placeholder="seu@email.com" />
          <AuthInput
            label="Senha"
            placeholder="••••••••••••"
            type="password"
            hint={mode === "login" ? "Esqueceu?" : undefined}
          />
          {mode === "signup" && (
            <AuthInput label="Confirme a senha" placeholder="••••••••••••" type="password" />
          )}
        </div>

        {/* CTA */}
        <button
          onClick={onAuth}
          className="w-full h-[52px] bg-white rounded-[16px] font-['Poppins:SemiBold'] text-[16px] text-[#0f0e0c] hover:bg-[#f0ede6] transition-all duration-200 active:scale-[0.98]"
        >
          {mode === "login" ? "Entrar" : "Criar conta gratuita"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/15" />
          <span className="font-['Poppins:Regular'] text-[12px] text-white/40">ou continue com</span>
          <div className="flex-1 h-px bg-white/15" />
        </div>

        {/* Social */}
        <div className="flex gap-3">
          {[
            { label: "Google", icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )},
            { label: "Apple", icon: (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.42.07 2.41.83 3.22.86 1.22-.25 2.39-1.02 3.68-.88 1.56.18 2.73.84 3.48 2.1-3.2 1.96-2.43 6.01.29 7.24-.56 1.55-1.27 3.09-2.67 4.56zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            )},
          ].map(s => (
            <button key={s.label}
              className="flex-1 h-11 rounded-[12px] bg-white/10 flex items-center justify-center gap-2 hover:bg-white/20 transition-colors font-['Poppins:Medium'] text-[13px] text-white/80">
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <p className="text-center font-['Poppins:Regular'] text-[12px] text-white/35 -mt-2">
          Ao continuar, você aceita nossos{" "}
          <span className="underline cursor-pointer text-white/55 hover:text-white/75 transition-colors">Termos de Uso</span>
        </p>
      </div>
    </div>
  );
}
