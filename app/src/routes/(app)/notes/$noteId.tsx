import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { createFileRoute } from "@tanstack/react-router"
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { usePatchNoteMutation } from "@/hooks/api"
import { notifications } from "@mantine/notifications"
import { type NoteData, NoteEditor } from "@/components/note-editor"
import { savingStore } from "@/lib/stores.ts"
import { getCurrentUser, supabase } from "@/lib/supabase"
import type { Note } from "@/lib/types"

const noteQueryOptions = (noteId: string) =>
  queryOptions({
    queryKey: ["notes", noteId],
    queryFn: async () => {
      const user = await getCurrentUser()
      const { data, error } = await supabase.from("notes").select().eq("id", noteId).eq("user_id", user.id).single()
      if (error) {
        throw error
      }
      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        content: data.content,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Note
    },
  })

export const Route = createFileRoute("/(app)/notes/$noteId")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { noteId } }) => {
    return queryClient.ensureQueryData(noteQueryOptions(noteId))
  },
})

function RouteComponent() {
  const noteId = Route.useParams().noteId
  const queryClient = useQueryClient()
  const { data: note } = useSuspenseQuery(noteQueryOptions(noteId))
  const patchNoteMutation = usePatchNoteMutation({
    onMutate: () => {
      savingStore.setState(() => true)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["notes", noteId], data)
      queryClient.setQueryData(["notes"], (old: Note[]) => {
        return old.map((n) => (n.id === data.id ? data : n))
      })
      savingStore.setState(() => false)
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        title: "Error saving note",
        message: err?.message || "An error occurred while saving the note.",
        autoClose: 5000,
      })
    },
  })

  const handleSave = (patch: NoteData, noteId?: string) => {
    if (!noteId) {
      notifications.show({
        color: "red",
        title: "Error saving note",
        message: "Could not save note: Note ID is missing.",
        autoClose: 5000,
      })
      return
    }
    patchNoteMutation.mutate({
      noteId: noteId,
      data: patch,
    })
  }

  return <NoteEditor note={note} onSave={handleSave} />
}
