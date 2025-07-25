import { noteFolderMapper } from "@/lib/mappers/note-folder"
import type { NoteFolder, NoteFolderCreate, NoteFolderPatch } from "@/lib/models/note-folder"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { createQueryKeys } from "@lukemorales/query-key-factory"
import { type DefaultError, mutationOptions } from "@tanstack/react-query"

interface ListFoldersParams {
  parentId?: string | null
}

interface DetailFolderParams {
  noteCount?: boolean
  path?: boolean
}

export const folders = createQueryKeys("folders", {
  detail: (folderId?: string, params?: DetailFolderParams) => ({
    queryKey: [folderId, { params }],
    queryFn: async () => {
      if (!folderId) {
        return null
      }
      const user = await getCurrentUser()

      if (params?.path) {
        const { data, error } = await supabase.rpc("get_folder_with_path", { folder_id: folderId })
        if (error) {
          throw error
        }

        return noteFolderMapper.toModel(data[0])
      }

      let query
      if (params?.noteCount) {
        query = supabase.from("note_folders").select("*, notes(count)")
      } else {
        query = supabase.from("note_folders").select()
      }

      query = query.eq("id", folderId).eq("user_id", user.id).is("deleted_at", null).single()

      const { data, error } = await query

      if (error) {
        throw error
      }

      return noteFolderMapper.toModel(data)
    },
  }),
  list: (listParams?: ListFoldersParams, detailParams?: Omit<DetailFolderParams, "path">) => ({
    queryKey: [{ listParams, detailParams }],
    queryFn: async () => {
      const user = await getCurrentUser()

      let query
      if (detailParams?.noteCount) {
        query = supabase.from("note_folders").select("*, notes(count)")
      } else {
        query = supabase.from("note_folders").select()
      }
      query = query.eq("user_id", user.id).is("deleted_at", null).order("name").order("depth")

      if (listParams?.parentId === null) {
        query = query.is("parent_id", null)
      } else if (listParams?.parentId) {
        query = query.eq("parent_id", listParams.parentId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return noteFolderMapper.toModels(data)
    },
  }),
})

export const folderMutations = {
  create: () =>
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
    }),
  patch: () =>
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
    }),
  delete: () =>
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
    }),
}
