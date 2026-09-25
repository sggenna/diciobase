export function Chevron({ color = "var(--color-muted)" }: {
  color?: string
} = {}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
