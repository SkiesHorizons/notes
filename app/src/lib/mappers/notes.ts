import type { Note, NoteCreate, NotePatch } from "@/lib/models/notes"
import type { Database } from "@/lib/supabase"

type NoteRow = Database["public"]["Tables"]["notes"]["Row"]
type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"]
type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"]

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
    title: patch.title ?? null,
    content: patch.content,
    folder_id: patch.folderId,
    updated_at: new Date().toISOString(),
  }),
}
