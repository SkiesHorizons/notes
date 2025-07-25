import { noteMapper } from "@/lib/mappers/notes"
import type { Note, NoteCreate, NotePatch } from "@/lib/models/notes"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { createQueryKeys } from "@lukemorales/query-key-factory"
import { mutationOptions, type DefaultError } from "@tanstack/react-query"

export interface ListNotesParams {
  folderId?: string | null
}

export const notes = createQueryKeys("notes", {
  list: (params?: ListNotesParams) => ({
    queryKey: [{ params }],
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
  }),
  detail: (noteId: string) => ({
    queryKey: [noteId],
    queryFn: async () => {
      const user = await getCurrentUser()
      const { data, error } = await supabase
        .from("notes")
        .select()
        .eq("id", noteId)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single()

      if (error) {
        throw error
      }

      return noteMapper.toModel(data)
    },
  }),
})

export const noteMutations = {
  create: () =>
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
    }),
  patch: () =>
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
    }),
  delete: () =>
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
    }),
}
