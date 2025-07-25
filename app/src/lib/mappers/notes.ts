import type { Note, NoteCreate, NotePatch } from "@/lib/models/notes"
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase"

type NoteRow = Tables<"notes">
type NoteInsert = TablesInsert<"notes">
type NoteUpdate = TablesUpdate<"notes">

export const noteMapper = {
  toModel: (db: NoteRow): Note => ({
    id: db.id,
    userId: db.user_id,
    title: db.title,
    content: db.content,
    folderId: db.folder_id,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }),
  toModels: (dbs: NoteRow[]): Note[] => dbs.map(noteMapper.toModel),
  toDbInsert: (create: NoteCreate, userId: string): NoteInsert => ({
    title: create.title,
    content: create.content,
    folder_id: create.folderId,
    user_id: userId,
  }),
  toDbUpdate: (patch: NotePatch): NoteUpdate => ({
    title: patch.title,
    content: patch.content,
    folder_id: patch.folderId,
    updated_at: new Date().toISOString(),
  }),
}
