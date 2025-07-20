import {
  type DefaultError,
  useMutation,
  type UseMutationOptions,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query"
import { getCurrentUser, supabase } from "@/lib/supabase"
import type { Note, NoteCreate, NotePatch } from "@/lib/types"

export function useListNotesQuery(options?: UseQueryOptions<Note[]>) {
  return useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const user = await getCurrentUser()
      const { data, error } = await supabase.from("notes").select().eq("user_id", user.id)
      if (error) {
        throw error
      }
      return data.map((note) => ({
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      }))
    },
    ...options,
  })
}

export function useCreateNoteMutation(options?: UseMutationOptions<Note, DefaultError, NoteCreate>) {
  return useMutation({
    mutationFn: async (data) => {
      const user = await getCurrentUser()
      const { data: note, error } = await supabase
        .from("notes")
        .insert({
          title: data.title,
          content: data.content,
          user_id: user.id,
        })
        .select()
        .single()
      if (error) {
        throw error
      }
      return {
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      }
    },
    ...options,
  })
}

export function usePatchNoteMutation(
  options?: UseMutationOptions<
    Note,
    DefaultError,
    {
      noteId: string
      data: NotePatch
    }
  >,
) {
  return useMutation({
    mutationFn: async ({ noteId, data }) => {
      const user = await getCurrentUser()
      const { data: note, error } = await supabase
        .from("notes")
        .update({
          title: data.title,
          content: data.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", user.id)
        .select()
        .single()
      if (error) {
        throw error
      }
      return {
        id: note.id,
        userId: note.user_id,
        title: note.title,
        content: note.content,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
      }
    },
    ...options,
  })
}
