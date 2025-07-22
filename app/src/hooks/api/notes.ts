import { createNoteMutationOptions, listNotesQueryOptions, patchNoteMutationOptions } from "@/lib/queries"
import { useMutation, useQuery } from "@tanstack/react-query"

export function useListNotesQuery(options?: ReturnType<typeof listNotesQueryOptions>) {
  return useQuery({
    ...listNotesQueryOptions(),
    ...options,
  })
}

export function useCreateNoteMutation(options?: ReturnType<typeof createNoteMutationOptions>) {
  return useMutation({
    ...createNoteMutationOptions(),
    ...options,
  })
}

export function usePatchNoteMutation(options?: ReturnType<typeof patchNoteMutationOptions>) {
  return useMutation({
    ...patchNoteMutationOptions(),
    ...options,
  })
}
