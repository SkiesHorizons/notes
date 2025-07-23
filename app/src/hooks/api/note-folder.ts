import {
    createFolderMutationOptions,
    deleteFolderMutationOptions,
    listFoldersQueryOptions,
    patchFolderMutationOptions,
} from "@/lib/queries/note-folder"
import { useMutation, useQuery } from "@tanstack/react-query"

export function useListFoldersQuery(options?: ReturnType<typeof listFoldersQueryOptions>) {
  return useQuery({
    ...listFoldersQueryOptions(),
    ...options,
  })
}

export function useCreateFolderMutation(options?: ReturnType<typeof createFolderMutationOptions>) {
  return useMutation({
    ...createFolderMutationOptions(),
    ...options,
  })
}

export function usePatchFolderMutation(options?: ReturnType<typeof patchFolderMutationOptions>) {
  return useMutation({
    ...patchFolderMutationOptions(),
    ...options,
  })
}

export function useDeleteFolderMutation(options?: ReturnType<typeof deleteFolderMutationOptions>) {
  return useMutation({
    ...deleteFolderMutationOptions(),
    ...options,
  })
}
