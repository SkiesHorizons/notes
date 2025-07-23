import { noteFolderMapper } from "@/lib/mappers/note-folder"
import type { NoteFolder, NoteFolderCreate, NoteFolderPatch, NoteFolderTree } from "@/lib/models/note-folder"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { mutationOptions, queryOptions, type DefaultError } from "@tanstack/react-query"

export const listFoldersQueryKey = () => ["folders"]

export const listFoldersQueryOptions = () =>
  queryOptions<NoteFolderTree[]>({
    queryKey: listFoldersQueryKey(),
    queryFn: async () => {
      const user = await getCurrentUser()
      const { data: folders, error: foldersError } = await supabase
        .from("note_folders")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("name")

      if (foldersError) {
        throw foldersError
      }

      // Get note counts per folder
      const { data: noteCounts, error: noteCountsError } = await supabase
        .from("notes")
        .select("folder_id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .not("folder_id", "is", null)

      if (noteCountsError) {
        throw noteCountsError
      }

      // Count notes per folder
      const notesByFolder: Record<string, number> = {}
      noteCounts.forEach((note) => {
        if (note.folder_id) {
          notesByFolder[note.folder_id] = (notesByFolder[note.folder_id] || 0) + 1
        }
      })

      const folderModels = noteFolderMapper.toModels(folders)
      return noteFolderMapper.buildTree(folderModels, notesByFolder)
    },
  })

export const createFolderMutationOptions = () =>
  mutationOptions<NoteFolder, DefaultError, NoteFolderCreate>({
    mutationFn: async (data) => {
      const user = await getCurrentUser()
      const { data: created, error } = await supabase
        .from("note_folders")
        .insert(noteFolderMapper.toDbInsert(data, user.id))
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteFolderMapper.toModel(created)
    },
  })

export const patchFolderMutationOptions = () =>
  mutationOptions<NoteFolder, DefaultError, { folderId: string; data: NoteFolderPatch }>({
    mutationFn: async ({ folderId, data }) => {
      const user = await getCurrentUser()
      const { data: updated, error } = await supabase
        .from("note_folders")
        .update(noteFolderMapper.toDbUpdate(data))
        .eq("id", folderId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteFolderMapper.toModel(updated)
    },
  })

export const deleteFolderMutationOptions = () =>
  mutationOptions<void, DefaultError, { folderId: string }>({
    mutationFn: async ({ folderId }) => {
      const user = await getCurrentUser()
      const { error } = await supabase
        .from("note_folders")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", folderId)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }
    },
  })
