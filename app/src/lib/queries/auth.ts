import { supabase } from "@/lib/supabase"
import type {
  AuthResponse,
  AuthTokenResponsePassword,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js"
import { mutationOptions, type DefaultError } from "@tanstack/react-query"

export const loginMutationOptions = () =>
  mutationOptions<AuthTokenResponsePassword, DefaultError, SignInWithPasswordCredentials>({
    mutationFn: (data) => supabase.auth.signInWithPassword(data),
  })

export const registerMutationOptions = () =>
  mutationOptions<AuthResponse | null, DefaultError, SignUpWithPasswordCredentials>({
    mutationFn: (data) => supabase.auth.signUp(data),
  })
