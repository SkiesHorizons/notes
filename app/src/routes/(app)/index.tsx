import { NoteEditorModal, type NoteData } from "@/components/note-editor-modal"
import { NoteList } from "@/components/note-list"
import type { Note } from "@/lib/models/notes"
import { createNoteMutationOptions, listNotesQueryOptions, patchNoteMutationOptions } from "@/lib/queries"
import { Group, Skeleton, Stack, Title } from "@mantine/core"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/(app)/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(listNotesQueryOptions())
  },
})

function RouteComponent() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined)
  const [modalOpened, setModalOpened] = useState(false)

  const recentNotesQuery = useQuery(listNotesQueryOptions())
  const createNoteMutation = useMutation(createNoteMutationOptions())
  const patchNoteMutation = useMutation(patchNoteMutationOptions())
  const queryClient = useQueryClient()

  const handleCreateNote = () => {
    setSelectedNote(undefined)
    setModalOpened(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setModalOpened(true)
  }

  const handleModalClose = () => {
    setModalOpened(false)
    setSelectedNote(undefined)
  }

  const handleNoteSave = async (data: NoteData, noteId?: string) => {
    try {
      if (!noteId) {
        // Create new note without folder (home page only shows notes without folders)
        await createNoteMutation.mutateAsync({
          title: data.title || "",
          content: data.content || "",
          folderId: null,
        })
      } else {
        // Patch existing note
        await patchNoteMutation.mutateAsync({
          noteId,
          data: {
            title: data.title,
            content: data.content,
            folderId: data.folderId,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

  // Listen for create note events from sidebar
  const handleCreateNoteEvent = () => {
    handleCreateNote()
  }

  window.addEventListener("create-note", handleCreateNoteEvent as EventListener)

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
        <Group justify="space-between">
          <Title order={2}>Recent Notes</Title>
        </Group>

        <NoteList notes={recentNotes} onEditNote={handleEditNote} onCreateNote={handleCreateNote} />
      </Stack>

      <NoteEditorModal
        opened={modalOpened}
        onClose={handleModalClose}
        note={selectedNote}
        onSave={handleNoteSave}
        initialFolderId={null}
        size="xl"
      />
    </>
  )
}
