import { type DefaultError, useMutation, type UseMutationOptions } from "@tanstack/react-query"
import type { AuthResponse, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

export function useLoginMutation(
  options?: UseMutationOptions<AuthResponse, DefaultError, SignInWithPasswordCredentials>,
) {
  return useMutation({
    mutationFn: (data) => supabase.auth.signInWithPassword(data),
    ...options,
  })
}

export function useRegisterMutation(
  options?: UseMutationOptions<AuthResponse | null, DefaultError, SignUpWithPasswordCredentials>,
) {
  return useMutation({
    mutationFn: (data) => supabase.auth.signUp(data),
    ...options,
  })
}
