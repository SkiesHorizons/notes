import { noteMapper } from "@/lib/mappers/notes"
import type { Note, NoteCreate, NotePatch } from "@/lib/models/notes"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { mutationOptions, queryOptions, type DefaultError } from "@tanstack/react-query"

export interface ListNotesParams {
  folderId?: string | null
}

export const listNotesQueryKey = (params?: ListNotesParams) => ["notes", "list", params]

export const listNotesQueryOptions = (params?: ListNotesParams) =>
  queryOptions<Note[]>({
    queryKey: listNotesQueryKey(params),
    queryFn: async () => {
      const user = await getCurrentUser()
      let query = supabase
        .from("notes")
        .select()
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })

      if (params?.folderId === null) {
        query = query.is("folder_id", null)
      } else if (params?.folderId) {
        query = query.eq("folder_id", params.folderId)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return noteMapper.toModels(data)
    },
  })

export const createNoteMutationOptions = () =>
  mutationOptions<Note, DefaultError, NoteCreate>({
    mutationFn: async (data) => {
      const user = await getCurrentUser()
      const { data: created, error } = await supabase
        .from("notes")
        .insert(noteMapper.toDbInsert(data, user.id))
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteMapper.toModel(created)
    },
  })

export const patchNoteMutationOptions = () =>
  mutationOptions<Note, DefaultError, { noteId: string; data: NotePatch }>({
    mutationFn: async ({ noteId, data }) => {
      const user = await getCurrentUser()
      const { data: updated, error } = await supabase
        .from("notes")
        .update(noteMapper.toDbUpdate(data))
        .eq("id", noteId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteMapper.toModel(updated)
    },
  })

export const deleteNoteMutationOptions = () =>
  mutationOptions<void, DefaultError, { noteId: string }>({
    mutationFn: async ({ noteId }) => {
      const user = await getCurrentUser()
      const { error } = await supabase
        .from("notes")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", noteId)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }
    },
  })
