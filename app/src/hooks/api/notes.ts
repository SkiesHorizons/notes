import { useMutation, useQuery } from "@tanstack/react-query"
import {
  createNoteMutationOptions,
  getNoteByIdQueryOptions,
  listNotesQueryOptions,
  patchNoteMutationOptions,
} from "@/lib/api"

export function useGetNoteQuery(noteId: string, options?: ReturnType<typeof getNoteByIdQueryOptions>) {
  return useQuery({
    ...getNoteByIdQueryOptions({
      path: {
        noteId: noteId,
      },
    }),
    ...options,
  })
}

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
