export interface FolderPath {
  id: string
  name: string
  depth: number
}

export interface NoteFolder {
  id: string
  userId: string
  name: string
  parentId: string | null
  depth: number
  createdAt: string
  updatedAt: string
  noteCount?: number
  path?: FolderPath[]
}

export interface NoteFolderPatch {
  name?: string
  parentId?: string | null
}

export interface NoteFolderCreate {
  name: string
  parentId?: string | null
}

export interface NoteFolderTree extends NoteFolder {
  children: NoteFolderTree[]
  noteCount: number
}
