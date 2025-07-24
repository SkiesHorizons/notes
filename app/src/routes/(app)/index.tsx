import { CreateFolderModal } from "@/components/create-folder-modal"
import { NoteList } from "@/components/note-list"
import { WelcomeMessage } from "@/components/welcome-message"
import type { Note } from "@/lib/models/notes"
import { listNotesQueryOptions } from "@/lib/queries"
import { noteEditorModalState } from "@/lib/stores"
import { Group, Skeleton, Stack, Title } from "@mantine/core"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/(app)/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(listNotesQueryOptions())
  },
})

function RouteComponent() {
  const [folderModalOpened, setFolderModalOpened] = useState(false)
  const recentNotesQuery = useQuery(listNotesQueryOptions())

  const handleCreateNote = () => {
    noteEditorModalState.openCreate()
  }

  const handleEditNote = (note: Note) => {
    noteEditorModalState.openEdit(note)
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

        <NoteList notes={recentNotes} onEditNote={handleEditNote} onCreateNote={handleCreateNote} />
      </Stack>

      <CreateFolderModal opened={folderModalOpened} onClose={() => setFolderModalOpened(false)} parentFolderId={null} />
    </>
  )
}
