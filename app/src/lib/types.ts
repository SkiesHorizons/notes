export type NoteCreate = {
  title?: string
  content: string
}

export type NotePatch = {
  title?: string
  content?: string
}

export type Note = {
  id: string
  userId: string
  title: string | null
  content: string
  createdAt: string
  updatedAt: string
}
