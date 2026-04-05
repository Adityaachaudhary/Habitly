/** Monday of the calendar week for `d`, as local YYYY-MM-DD (ISO date). */
export function getWeekMondayIso(d = new Date()): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = x.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + mondayOffset)
  const y = x.getFullYear()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const dayNum = String(x.getDate()).padStart(2, '0')
  return `${y}-${m}-${dayNum}`
}

/** Human label: "Mon, Apr 1 – Sun, Apr 7" in en-US. */
export function formatWeekRangeLabel(weekStartIso: string): string {
  const start = new Date(`${weekStartIso}T12:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`
}

/** Most recent Monday first; `count` weeks including current week. */
export function listRecentWeekMondays(count: number, from = new Date()): string[] {
  const out: string[] = []
  let cur = getWeekMondayIso(from)
  for (let i = 0; i < count; i++) {
    out.push(cur)
    const d = new Date(`${cur}T12:00:00`)
    d.setDate(d.getDate() - 7)
    cur = getWeekMondayIso(d)
  }
  return out
}

/** Thu–Sun: gentle nudge to submit a review for the current week. */
export function isEndOfWeekNudgeDay(d = new Date()): boolean {
  const day = d.getDay()
  return day === 0 || day === 4 || day === 5 || day === 6
}
