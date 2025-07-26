import type { Note } from "@/lib/models"
import { Store } from "@tanstack/react-store"

interface NoteEditModalState {
  opened: boolean
  saving?: boolean
  initialNote?: Note | null
  initialFolderId?: string
  editingNoteId?: string
}

const store = new Store<NoteEditModalState>({
  opened: false,
})

export const noteEditModal = {
  store,
  openEdit(note: Note) {
    store.setState({
      opened: true,
      initialNote: note,
      editingNoteId: note.id,
    })
  },
  openCreate(initialFolderId?: string) {
    store.setState({ opened: true, initialNote: null, initialFolderId })
  },
  close() {
    store.setState({
      opened: false,
    })
  },
  updateEditingNoteId(editingNoteId: string) {
    store.setState((prev) => ({
      ...prev,
      editingNoteId,
    }))
  },
}
