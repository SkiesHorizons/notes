import { and, eq } from "drizzle-orm"
import { notes } from "../db/schema"
import type { SqlDatabase } from "../types"
import type { Note, NoteCreate, NotePatch } from "./note.schema"

// List all notes
async function listNotes(db: SqlDatabase, userId: string): Promise<Note[]> {
  const notes = await db.query.notes.findMany({
    where: (notes, { eq }) => eq(notes.userId, userId),
    orderBy: (notes, { desc }) => desc(notes.updatedAt),
  })
  return notes.map((note) => ({
    id: note.id,
    userId: note.userId,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }))
}

// Find a note by ID
async function findNoteById(db: SqlDatabase, userId: string, id: string): Promise<Note> {
  const note = await db.query.notes.findFirst({
    where: (notes, { eq, and }) => and(eq(notes.id, id), eq(notes.userId, userId)),
  })
  if (!note) {
    throw new Error("Note not found")
  }
  return {
    id: note.id,
    userId: note.userId,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}

// Create a new note
async function createNote(db: SqlDatabase, userId: string, data: NoteCreate): Promise<Note> {
  const now = new Date()
  const note = await db
    .insert(notes)
    .values({
      userId: userId,
      title: data.title || null,
      content: data.content,
      updatedAt: now,
    })
    .returning()
  if (note.length === 0) {
    throw new Error("Failed to create note")
  }

  const createdNote = note[0]
  return {
    id: createdNote.id,
    userId: createdNote.userId,
    title: createdNote.title,
    content: createdNote.content,
    createdAt: createdNote.createdAt.toISOString(),
    updatedAt: createdNote.updatedAt.toISOString(),
  }
}

// Patch (update) a note
async function patchNote(db: SqlDatabase, userId: string, id: string, patch: NotePatch): Promise<Note> {
  const existingNote = await db.query.notes.findFirst({
    where: (notes, { eq, and }) => and(eq(notes.id, id), eq(notes.userId, userId)),
    columns: {
      id: true,
    },
  })
  if (!existingNote) {
    throw new Error("Note not found")
  }

  const updatedNote = await db
    .update(notes)
    .set({
      title: patch.title,
      content: patch.content,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id))
    .returning()
  if (updatedNote.length === 0) {
    throw new Error("Failed to update note")
  }
  const note = updatedNote[0]
  return {
    id: note.id,
    userId: note.userId,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  }
}

// Delete a note
async function deleteNote(db: SqlDatabase, userId: string, id: string): Promise<void> {
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
}

export const noteService = {
  listNotes,
  findNoteById,
  createNote,
  patchNote,
  deleteNote,
}
