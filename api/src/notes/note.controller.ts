import type { AppEnv } from "../types"
import { noteService } from "./note.service"
import { zNote, zNoteCreate, zNotePatch } from "./note.schema"
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"

const listNotes = createRoute({
  method: "get",
  path: "/",
  tags: ["Notes"],
  operationId: "listNotes",
  summary: "List all notes",
  security: [{
    bearerAuth: [],
  }],
  responses: {
    200: {
      description: "List of notes",
      content: {
        "application/json": {
          schema: z.array(zNote),
        },
      },
    },
  },
})

const zNoteParams = z.object({
  noteId: z.uuid().openapi({
    param: {
      name: "noteId",
      in: "path",
      description: "The ID of the note to retrieve",
      required: true,
    },
  }),
})

const getNoteById = createRoute({
  method: "get",
  path: "/{noteId}",
  tags: ["Notes"],
  operationId: "getNoteById",
  summary: "Get a note by ID",
  security: [{
    bearerAuth: [],
  }],
  request: {
    params: zNoteParams,
  },
  responses: {
    200: {
      description: "Note details",
      content: {
        "application/json": {
          schema: zNote,
        },
      },
    },
    404: {
      description: "Note not found",
    },
  },
})

const createNote = createRoute({
  method: "post",
  path: "/",
  tags: ["Notes"],
  operationId: "createNote",
  summary: "Create a new note",
  security: [{
    bearerAuth: [],
  }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: zNoteCreate,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Note created successfully",
      content: {
        "application/json": {
          schema: zNote,
        },
      },
    },
    400: {
      description: "Invalid input data",
    },
  },
})

const patchNote = createRoute({
  method: "patch",
  path: "/{noteId}",
  tags: ["Notes"],
  operationId: "patchNote",
  summary: "Update an existing note",
  security: [{
    bearerAuth: [],
  }],
  request: {
    params: zNoteParams,
    body: {
      content: {
        "application/json": {
          schema: zNotePatch,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Note updated successfully",
      content: {
        "application/json": {
          schema: zNote,
        },
      },
    },
    400: {
      description: "Invalid input data",
    },
    404: {
      description: "Note not found",
    },
  },
})

const deleteNote = createRoute({
  method: "delete",
  path: "/{noteId}",
  tags: ["Notes"],
  operationId: "deleteNote",
  summary: "Delete a note",
  security: [{
    bearerAuth: [],
  }],
  request: {
    params: zNoteParams,
  },
  responses: {
    204: {
      description: "Note deleted successfully",
    },
    404: {
      description: "Note not found",
    },
  },
})

const app = new OpenAPIHono<AppEnv>()

app.openapi(listNotes, async (c) => {
  const db = c.get("db")
  const userId = c.get("jwtPayload").sub

  const notes = await noteService.listNotes(db, userId)
  return c.json(notes, 200)
})

app.openapi(getNoteById, async (c) => {
  const { noteId } = c.req.valid("param")
  const db = c.get("db")
  const userId = c.get("jwtPayload").sub

  const note = await noteService.findNoteById(db, userId, noteId)
  return c.json(note, 200)
})

app.openapi(createNote, async (c) => {
  const data = c.req.valid("json")
  const db = c.get("db")
  const userId = c.get("jwtPayload").sub

  const note = await noteService.createNote(db, userId, data)
  return c.json(note, 201)
})

app.openapi(patchNote, async (c) => {
  const { noteId } = c.req.valid("param")
  const data = c.req.valid("json")
  const db = c.get("db")
  const userId = c.get("jwtPayload").sub

  const note = await noteService.patchNote(db, userId, noteId, data)
  return c.json(note, 200)
})

app.openapi(deleteNote, async (c) => {
  const { noteId } = c.req.valid("param")
  const db = c.get("db")
  const userId = c.get("jwtPayload").sub

  await noteService.deleteNote(db, userId, noteId)
  return c.newResponse(null, 204)
})

export const noteController = app
