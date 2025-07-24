import type { Note } from "@/lib/models"
import { Store } from "@tanstack/react-store"

interface NoteEditorModalState {
  opened: boolean
  newNoteId?: string
  editingNote?: Note
  initialFolderId?: string
}

const store = new Store<NoteEditorModalState>({
  opened: false,
})

export const noteEditorModalState = {
  store,
  openEdit(note: Note) {
    store.setState({ opened: true, editingNote: note })
  },
  openCreate(initialFolderId?: string) {
    store.setState({ opened: true, initialFolderId })
  },
  created(newNoteId: string) {
    store.setState((state) => ({
      ...state,
      newNoteId,
    }))
  },
  close() {
    store.setState({
      opened: false,
    })
  },
}
