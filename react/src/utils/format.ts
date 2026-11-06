// "2026-10-20T00:00:00" or "2026-11-15" → "Oct 20, 2026"
export function formatDate(value: string | null): string {
  if (!value) return '—'
  // A date-only string is read as UTC, which shows the previous day in Edmonton.
  // Adding a time makes the browser read it as local time.
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return date.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
}