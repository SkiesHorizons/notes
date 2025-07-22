import { noteMapper } from "@/lib/mappers"
import type { Note, NoteCreate, NotePatch } from "@/lib/models"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { mutationOptions, queryOptions, type DefaultError } from "@tanstack/react-query"

export const listNotesQueryKey = () => ["notes"]

export const listNotesQueryOptions = () =>
  queryOptions<Note[]>({
    queryKey: listNotesQueryKey(),
    queryFn: async () => {
      const user = await getCurrentUser()
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("userId", user.id)
        .order("updatedAt", { ascending: false })

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
        .eq("userId", user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteMapper.toModel(updated)
    },
  })
