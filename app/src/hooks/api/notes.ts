import {
  createNoteMutationOptions,
  deleteNoteMutationOptions,
  listNotesQueryOptions,
  patchNoteMutationOptions,
  type ListNotesParams,
} from "@/lib/queries/notes"
import { useMutation, useQuery } from "@tanstack/react-query"

export function useListNotesQuery(params?: ListNotesParams, options?: ReturnType<typeof listNotesQueryOptions>) {
  return useQuery({
    ...listNotesQueryOptions(params),
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

export function useDeleteNoteMutation(options?: ReturnType<typeof deleteNoteMutationOptions>) {
  return useMutation({
    ...deleteNoteMutationOptions(),
    ...options,
  })
}
