import { AppLayout } from "@/components/app-layout"
import { NoteEditorModal, type NoteData } from "@/components/note-editor-modal"
import { mutations } from "@/lib/queries"
import { noteEditorModalState } from "@/lib/stores"
import { notifications } from "@mantine/notifications"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { useStore } from "@tanstack/react-store"
import { useEffect } from "react"

export const Route = createFileRoute("/(app)")({
  beforeLoad: async ({
    context: {
      auth: { isAuthenticated },
    },
    location,
  }) => {
    if (!(await isAuthenticated())) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <AppLayout>
      <Outlet />

      {/* Note creation modal */}
      <NoteAddEditModal />
    </AppLayout>
  )
}

function NoteAddEditModal() {
  const opened = useStore(noteEditorModalState.store, (state) => state.opened)
  const initialFolderId = useStore(noteEditorModalState.store, (state) => state.initialFolderId)
  const selectedNote = useStore(noteEditorModalState.store, (state) => state.editingNote)

  const queryClient = useQueryClient()
  const createNoteMutation = useMutation({
    ...mutations.notes.create(),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
      noteEditorModalState.created(created.id)
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error creating note",
        message: error.message || "An error occurred while creating the note.",
      })
    },
  })
  const patchNoteMutation = useMutation({
    ...mutations.notes.patch(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error updating note",
        message: error.message || "An error occurred while updating the note.",
      })
    },
  })

  const handleSave = async (data: NoteData, noteId?: string) => {
    const shouldCreate = !noteId && !noteEditorModalState.store.state.newNoteId
    if (shouldCreate) {
      if (!data.content) {
        return
      }
      createNoteMutation.mutate({
        ...data,
        content: data.content,
      })
      return
    }

    const finalNoteId = noteId || noteEditorModalState.store.state.newNoteId
    if (finalNoteId) {
      patchNoteMutation.mutate({
        noteId: finalNoteId,
        data,
      })
    }
  }

  const handleClose = () => {
    noteEditorModalState.close()
  }

  useEffect(() => {
    console.log("note changed", selectedNote?.id)
  }, [selectedNote?.id])

  return (
    <NoteEditorModal
      note={selectedNote}
      opened={opened}
      onClose={handleClose}
      onSave={handleSave}
      initialFolderId={initialFolderId}
      size="lg"
    />
  )
}
