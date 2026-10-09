import { forwardRef, useId, useState } from "react"

export const AuthInput = forwardRef<
  HTMLInputElement,
  {
    label: string
    placeholder: string
    type?: string
    value: string
    onChange: (v: string) => void
    hint?: string
    hintAction?: () => void
    error?: string
  }
>(function AuthInput(
  { label, placeholder, type = "text", value, onChange, hint, hintAction, error },
  ref,
) {
  const [focused, setFocused] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const id = useId()
  const errorId = `${id}-error`
  const isPassword = type === "password"
  const inputType = isPassword && showPwd ? "text" : type

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-[14px] font-medium text-ink"
        >
          {label}
        </label>
        {hint && (
          <button
            type="button"
            onClick={hintAction}
            className="text-[13px] text-label-secondary underline underline-offset-2 hover:text-ink transition-colors"
          >
            {hint}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className="w-full h-[52px] px-4 rounded-xl bg-surface text-[17px] text-ink placeholder-muted outline-none transition-shadow duration-200"
          style={{
            boxShadow: error
              ? "0 0 0 2px var(--color-danger)"
              : focused
                ? "0 0 0 2px var(--color-ink)"
                : "0 0 0 1px rgba(0,0,0,0.06)",
          }}
        />
        {isPassword && (
          <button
            type="button"
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
        )}
      </div>
      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-[13px]"
          style={{ color: "var(--color-danger)" }}
        >
          {error}
        </span>
      )}
    </div>
  )
})
