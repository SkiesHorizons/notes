export interface Note {
  id: string
  userId: string
  title: string | null
  content: string
  createdAt: string
  updatedAt: string
}

export interface NotePatch {
  title?: string | null
  content?: string
}

export interface NoteCreate {
  title?: string | null
  content: string
}
