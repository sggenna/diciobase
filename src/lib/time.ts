/** "há 3 dias", in Portuguese, from an ISO timestamp. */
export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 60) return "agora"
  const m = Math.floor(s / 60)
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h} ${h === 1 ? "hora" : "horas"}`
  const d = Math.floor(h / 24)
  if (d < 7) return `há ${d} ${d === 1 ? "dia" : "dias"}`
  const w = Math.floor(d / 7)
  if (d < 30) return `há ${w} ${w === 1 ? "semana" : "semanas"}`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `há ${mo} ${mo === 1 ? "mês" : "meses"}`
  const y = Math.floor(d / 365)
  return `há ${y} ${y === 1 ? "ano" : "anos"}`
}
