// Thin generic localStorage collection helper used by the Phase 1 repository.
// Keeps the same shape as the entities in src/types so swapping in a real
// Supabase-backed repository later is a drop-in replacement (see
// supabase/schema.sql for the matching Postgres tables).

const PREFIX = 'signal:'

function readList<T>(key: string): T[] {
  const raw = localStorage.getItem(PREFIX + key)
  if (!raw) return []
  try {
    return JSON.parse(raw) as T[]
  } catch {
    return []
  }
}

function writeList<T>(key: string, items: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(items))
}

export function listAll<T>(key: string): T[] {
  return readList<T>(key)
}

export function upsert<T extends { id: string }>(key: string, item: T): T {
  const items = readList<T>(key)
  const index = items.findIndex((existing) => existing.id === item.id)
  if (index === -1) {
    items.push(item)
  } else {
    items[index] = item
  }
  writeList(key, items)
  return item
}

export function remove(key: string, id: string): void {
  const items = readList<{ id: string }>(key)
  writeList(
    key,
    items.filter((existing) => existing.id !== id),
  )
}

export function replaceAll<T>(key: string, items: T[]): void {
  writeList(key, items)
}

export function clear(key: string): void {
  localStorage.removeItem(PREFIX + key)
}

export function generateId(): string {
  return crypto.randomUUID()
}
