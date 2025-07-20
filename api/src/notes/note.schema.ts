import { z } from "@hono/zod-openapi"

export const zNote = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  title: z.string().max(256).nullable(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).openapi("Note")

export type Note = z.infer<typeof zNote>

export const zNoteCreate = z.object({
  title: z
    .string()
    .max(256, {
      message: "Title must be at most 256 characters long",
    })
    .optional(),
  content: z.string().nonempty("Content is required"),
}).openapi("NoteCreate")

export type NoteCreate = z.infer<typeof zNoteCreate>

export const zNotePatch = z.object({
  title: z
    .string()
    .max(256, {
      message: "Title must be at most 256 characters long",
    })
    .optional(),
  content: z.string().optional(),
}).openapi("NotePatch")

export type NotePatch = z.infer<typeof zNotePatch>
