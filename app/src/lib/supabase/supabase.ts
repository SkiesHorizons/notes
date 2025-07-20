import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types.ts"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("User not authenticated")
  }
  return session.user
}
