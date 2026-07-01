export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayISODate(): string {
  return toISODate(new Date())
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return toISODate(d)
}

export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(b + 'T00:00:00Z').getTime() - new Date(a + 'T00:00:00Z').getTime()) / msPerDay)
}

export function formatDateLabel(date: string): string {
  return new Date(date + 'T00:00:00Z').toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function lastNDates(n: number, endDate: string = todayISODate()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(endDate, -i))
}
