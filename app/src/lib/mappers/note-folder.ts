import type { FolderPath, NoteFolder, NoteFolderCreate, NoteFolderPatch } from "@/lib/models/note-folder"
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/lib/supabase"

type NoteFolderRow = Tables<"note_folders"> & { notes?: { count: number }[]; path?: Json }
type NoteFolderInsert = TablesInsert<"note_folders">
type NoteFolderUpdate = TablesUpdate<"note_folders">

export const noteFolderMapper = {
  toModel: (db: NoteFolderRow): NoteFolder => ({
    id: db.id,
    userId: db.user_id,
    name: db.name,
    parentId: db.parent_id,
    depth: db.depth,
    noteCount: db.notes?.[0]?.count,
    path: db.path ? (db.path as unknown as FolderPath[]) : undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }),
  toModels: (dbs: NoteFolderRow[]): NoteFolder[] => dbs.map(noteFolderMapper.toModel),
  toDbInsert: (create: NoteFolderCreate, userId: string): NoteFolderInsert => ({
    name: create.name,
    parent_id: create.parentId,
    user_id: userId,
  }),
  toDbUpdate: (patch: NoteFolderPatch): NoteFolderUpdate => ({
    name: patch.name,
    parent_id: patch.parentId,
    updated_at: new Date().toISOString(),
  }),
}
