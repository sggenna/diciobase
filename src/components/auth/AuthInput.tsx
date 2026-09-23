import { useState } from "react";

export function AuthInput({
  label, placeholder, type = "text", hint, hintAction,
}: {
  label: string; placeholder: string; type?: string;
  hint?: string; hintAction?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="font-['Poppins:SemiBold'] text-[15px] text-white">{label}</span>
        {hint && (
          <button onClick={hintAction}
            className="font-['Poppins:Regular'] text-[13px] text-white/60 underline hover:text-white/90 transition-colors">
            {hint}
          </button>
        )}
      </div>
      <input
        type={type} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-[52px] px-5 rounded-[14px] bg-[#d9d9d9] font-['Poppins:Regular'] text-[15px] text-[#1c1b19] placeholder-[#7e7676] outline-none transition-all duration-200"
        style={{ boxShadow: focused ? "0 0 0 2px rgba(255,255,255,0.3)" : "none" }}
      />
    </div>
  );
}
