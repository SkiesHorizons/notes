import { type DefaultError, useMutation, type UseMutationOptions } from "@tanstack/react-query"
import type { LoginData, LoginResponse, Options, RegisterData, RegisterResponse } from "@/lib/api"
import { loginMutationOptions, registerMutationOptions } from "@/lib/api"

export function useLoginMutation(options?: UseMutationOptions<LoginResponse, DefaultError, Options<LoginData>>) {
  return useMutation({
    ...loginMutationOptions(),
    ...options,
  })
}

export function useRegisterMutation(
  options?: UseMutationOptions<RegisterResponse, DefaultError, Options<RegisterData>>,
) {
  return useMutation({
    ...registerMutationOptions(),
    ...options,
  })
}
