import { CreateFolderModal } from "@/components/create-folder-modal"
import { NoteList } from "@/components/note-list"
import { WelcomeMessage } from "@/components/welcome-message"
import type { Note } from "@/lib/models/notes"
import { mutations, queries } from "@/lib/queries"
import { noteEditorModal } from "@/lib/stores"
import { Group, Skeleton, Stack, Title } from "@mantine/core"
import { notifications } from "@mantine/notifications"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/(app)/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(queries.notes.list())
  },
})

function RouteComponent() {
  const [folderModalOpened, setFolderModalOpened] = useState(false)
  const recentNotesQuery = useQuery(queries.notes.list())

  const handleCreateNote = () => {
    noteEditorModal.openCreate()
  }

  const handleEditNote = (note: Note) => {
    noteEditorModal.openEdit(note)
  }

  const { mutate: deleteNote } = useMutation({
    ...mutations.notes.delete(),
    onSuccess: async () => {
      await recentNotesQuery.refetch()
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

      <CreateFolderModal opened={folderModalOpened} onClose={() => setFolderModalOpened(false)} parentFolderId={null} />
    </>
  )
}
