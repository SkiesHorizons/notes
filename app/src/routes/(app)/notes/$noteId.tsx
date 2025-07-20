import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { createFileRoute } from "@tanstack/react-router"
import type { Note } from "@/lib/api"
import { getNoteByIdQueryKey, getNoteByIdQueryOptions, listNotesQueryKey } from "@/lib/api"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { usePatchNoteMutation } from "@/hooks/api"
import { notifications } from "@mantine/notifications"
import { type NoteData, NoteEditor } from "@/components/note-editor"
import { savingStore } from "@/lib/stores.ts"

const noteQueryOptions = (noteId: string) =>
  getNoteByIdQueryOptions({
    path: {
      noteId: noteId,
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
      queryClient.setQueryData(
        getNoteByIdQueryKey({
          path: {
            noteId: data.id,
          },
        }),
        data,
      )
      queryClient.setQueryData(listNotesQueryKey(), (old: Note[]) => {
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
      path: {
        noteId: noteId,
      },
      body: patch,
    })
  }

  return <NoteEditor note={note} onSave={handleSave} />
}
