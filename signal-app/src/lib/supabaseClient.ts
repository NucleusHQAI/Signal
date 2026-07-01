import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

// Phase 1 stores data locally (see src/lib/repository.ts) so the prototype
// runs without a Supabase project. This client is exported for the parts of
// the app that can use it as soon as VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// are set (auth, and later swapping the repository to read/write Postgres
// tables created from supabase/schema.sql).
export const supabase = url && anonKey ? createClient(url, anonKey) : null
