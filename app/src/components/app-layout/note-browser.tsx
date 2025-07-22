import { NoteEditorModal, type NoteData } from "@/components/note-editor-modal"
import { useCreateNoteMutation, useListNotesQuery, usePatchNoteMutation } from "@/hooks/api"
import type { Note } from "@/lib/models/notes"
import { Button, Skeleton, Stack, Text, UnstyledButton } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

export function NoteBrowser() {
  const listNotesQuery = useListNotesQuery()
  const patchNoteMutation = usePatchNoteMutation()
  const createNoteMutation = useCreateNoteMutation()
  const queryClient = useQueryClient()
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined)
  const [modalOpened, setModalOpened] = useState(false)

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note)
    setModalOpened(true)
  }

  const handleModalClose = () => {
    setModalOpened(false)
    setSelectedNote(undefined)
  }

  const handleCreateNote = () => {
    setSelectedNote(undefined)
    setModalOpened(true)
  }

  const handleNoteSave = async (data: NoteData, noteId?: string) => {
    if (!selectedNote) return

    try {
      let savedNote: Note | undefined = selectedNote
      if (!noteId) {
        // Create new note
        savedNote = await createNoteMutation.mutateAsync({ title: data.title ?? "", content: data.content ?? "" })
        setSelectedNote(savedNote)
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

  if (listNotesQuery.isLoading) {
    return (
      <Stack>
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} animate={true} />
          ))}
      </Stack>
    )
  }

  return (
    <>
      <Button onClick={handleCreateNote} mb="sm" fullWidth variant="light">
        + New Note
      </Button>
      <Stack>
        {listNotesQuery.data?.map((note) => (
          <UnstyledButton key={note.id} onClick={() => handleNoteClick(note)} bg="gray">
            <Text>{note.title || "Untitled Note"}</Text>
          </UnstyledButton>
        ))}
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
