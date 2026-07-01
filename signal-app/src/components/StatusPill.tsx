import type { ReadinessStatus } from '../types'

const LABELS: Record<ReadinessStatus, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
}

export function StatusPill({ status }: { status: ReadinessStatus }) {
  return <span className={`status-pill ${status}`}>{LABELS[status]}</span>
}
