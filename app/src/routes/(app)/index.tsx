import { NoteList } from "@/components/note-list"
import { WelcomeMessage } from "@/components/welcome-message"
import type { Note } from "@/lib/models/notes"
import { mutations, queries } from "@/lib/queries"
import { noteEditModal } from "@/lib/stores"
import { Group, Skeleton, Stack, Title } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/(app)/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(queries.notes.list())
  },
})

function RouteComponent() {
  const recentNotesQuery = useQuery(queries.notes.list())

  const handleCreateNote = () => {
    noteEditModal.openCreate()
  }

  const handleEditNote = (note: Note) => {
    noteEditModal.openEdit(note)
  }

  const queryClient = useQueryClient()
  const { mutate: deleteNote } = useMutation({
    ...mutations.notes.delete(),
    onSuccess: async (_, { noteId }) => {
      notifications.show({
        color: "green",
        title: "Note deleted",
        message: "The note has been successfully deleted.",
      })
      await queryClient.setQueryData(queries.notes.list().queryKey, (oldData: Note[]) => {
        return oldData.filter((note) => note.id !== noteId)
      })
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error deleting note",
        message: error.message || "An error occurred while deleting the note.",
      })
    },
  })

  const handleDeleteNote = (noteId: string) => {
    deleteNote({ noteId })
  }

  if (recentNotesQuery.isLoading) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>Recent Notes</Title>
        </Group>
        <Stack gap="md">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} height={200} radius="md" />
            ))}
        </Stack>
      </Stack>
    )
  }

  const recentNotes = recentNotesQuery.data || []

  return (
    <>
      <Stack gap="md">
        <WelcomeMessage />

        <Group justify="space-between">
          <Title order={2}>Recent Notes</Title>
        </Group>

        <NoteList
          notes={recentNotes}
          onEditNote={handleEditNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
        />
      </Stack>
    </>
  )
}
