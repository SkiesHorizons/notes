export interface Note {
  id: string
  userId: string
  title: string | null
  content: string
  folderId: string | null
  createdAt: string
  updatedAt: string
}

export interface NotePatch {
  title?: string | null
  content?: string
  folderId?: string | null
}

export interface NoteCreate {
  title?: string | null
  content: string
  folderId?: string | null
}
