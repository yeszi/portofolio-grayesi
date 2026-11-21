import { createClient } from '@supabase/supabase-js'

// Anon key memang bersifat publik (dibatasi oleh RLS di Supabase).
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://owqdtbzhnxbxdsjrlzsa.supabase.co'
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWR0YnpobnhieGRzanJsenNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA1MjMsImV4cCI6MjA2NjQ0NjUyM30.cNmvpc_pBV89o9GHMU2CL0bSdgkdavAZuxB_w0Gv4gA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export const ADMIN_EMAIL = 'grayesi.silitonga@gmail.com'

export async function isAdminSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session && !!session.user && session.user.email === ADMIN_EMAIL
}

/** Berlangganan perubahan realtime sebuah tabel; mengembalikan fungsi untuk berhenti. */
export function subscribeTable(channelName, table, handler) {
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table }, handler)
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
