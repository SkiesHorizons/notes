import { folderMutations, folders } from "@/lib/queries/note-folder"
import { noteMutations, notes } from "@/lib/queries/notes"
import { mergeQueryKeys } from "@lukemorales/query-key-factory"

export * from "./auth"
export * from "./note-folder"
export * from "./notes"

export const queries = mergeQueryKeys(notes, folders)

export const mutations = {
  notes: noteMutations,
  folders: folderMutations,
}
