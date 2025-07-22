import { loginMutationOptions, registerMutationOptions } from "@/lib/queries"
import { useMutation } from "@tanstack/react-query"

export function useLoginMutation(options?: ReturnType<typeof loginMutationOptions>) {
  return useMutation({
    ...loginMutationOptions(),
    ...options,
  })
}

export function useRegisterMutation(options?: ReturnType<typeof registerMutationOptions>) {
  return useMutation({
    ...registerMutationOptions(),
    ...options,
  })
}
