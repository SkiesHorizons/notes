import { NoteEditorModal, type NoteData } from "@/components/note-editor-modal"
import { NoteList } from "@/components/note-list"
import { NotePlaceholder } from "@/components/note-placeholder"
import { ViewToggle, type ViewMode } from "@/components/view-toggle"
import { useCreateNoteMutation, useListNotesQuery, usePatchNoteMutation } from "@/hooks/api"
import type { Note } from "@/lib/models/notes"
import { Box, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react"

export const Route = createFileRoute('/(app)/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined)
  const [modalOpened, setModalOpened] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const listNotesQuery = useListNotesQuery()
  const createNoteMutation = useCreateNoteMutation()
  const patchNoteMutation = usePatchNoteMutation()
  const queryClient = useQueryClient()

  // Switch to grid view if on mobile and currently in masonry
  useEffect(() => {
    if (isMobile && viewMode === "masonry") {
      setViewMode("grid")
    }
  }, [isMobile, viewMode])

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
        // Create new note
        await createNoteMutation.mutateAsync({ 
          title: data.title || "", 
          content: data.content || "" 
        })
      } else {
        // Patch existing note
        await patchNoteMutation.mutateAsync({
          noteId,
          data: {
            title: data.title,
            content: data.content,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

  // Listen for create note events from sidebar
  useEffect(() => {
    const handleCreateNoteEvent = () => {
      handleCreateNote()
    }

    window.addEventListener("create-note", handleCreateNoteEvent)
    return () => {
      window.removeEventListener("create-note", handleCreateNoteEvent)
    }
  }, [])

  if (listNotesQuery.isLoading) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>Notes</Title>
          <ViewToggle value={viewMode} onChange={setViewMode} />
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

  const notes = listNotesQuery.data || []
  const hasNotes = notes.length > 0

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>My Notes</Title>
          {hasNotes && <ViewToggle value={viewMode} onChange={setViewMode} />}
        </Group>

        {!hasNotes ? (
          <Box mt="xl">
            <NotePlaceholder onCreateNote={handleCreateNote} />
          </Box>
        ) : (
          <>
            <Text size="sm" c="dimmed">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </Text>
            <NoteList 
              notes={notes} 
              viewMode={viewMode} 
              onEditNote={handleEditNote} 
            />
          </>
        )}
      </Stack>

      <NoteEditorModal
        opened={modalOpened}
        onClose={handleModalClose}
        note={selectedNote}
        onSave={handleNoteSave}
        size="xl"
      />
    </>
  )
}
