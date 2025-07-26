import { Store } from "@tanstack/react-store"
import type { NoteFolder } from "@/lib/models"

interface FolderEditModalState {
  opened: boolean
  initialFolder?: NoteFolder
  initialParentFolderId?: string
}

const store = new Store<FolderEditModalState>({
  opened: false,
})

export const folderEditModal = {
  store,
  openCreate(initialParentFolderId?: string) {
    store.setState({ opened: true, initialParentFolderId })
  },
  openEdit(initialFolder: NoteFolder) {
    store.setState({
      opened: true,
      initialFolder,
    })
  },
  close() {
    store.setState({
      opened: false,
    })
  },
}
