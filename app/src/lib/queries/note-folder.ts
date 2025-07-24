import { noteFolderMapper } from "@/lib/mappers/note-folder"
import type { NoteFolder, NoteFolderCreate, NoteFolderPatch, NoteFolderTree } from "@/lib/models/note-folder"
import type { Database } from "@/lib/supabase"
import { getCurrentUser, supabase } from "@/lib/supabase"
import { mutationOptions, queryOptions, type DefaultError } from "@tanstack/react-query"

type NoteFolderRow = Database["public"]["Tables"]["note_folders"]["Row"]

export const listFoldersQueryKey = () => ["folders", "list"]

export const listFoldersQueryOptions = () =>
  queryOptions<NoteFolderTree[]>({
    queryKey: listFoldersQueryKey(),
    queryFn: async () => {
      const user = await getCurrentUser()
      const { data: folders, error: foldersError } = await supabase
        .from("note_folders")
        .select()
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("name")

      if (foldersError) {
        throw foldersError
      }

      // Get note counts per folder
      const { data: noteCounts, error: noteCountsError } = await supabase
        .from("notes")
        .select("folder_id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .not("folder_id", "is", null)

      if (noteCountsError) {
        throw noteCountsError
      }

      // Count notes per folder
      const notesByFolder: Record<string, number> = {}
      noteCounts.forEach((note) => {
        if (note.folder_id) {
          notesByFolder[note.folder_id] = (notesByFolder[note.folder_id] || 0) + 1
        }
      })

      const folderModels = noteFolderMapper.toModels(folders)
      return noteFolderMapper.buildTree(folderModels, notesByFolder)
    },
  })

// New queries for fetching specific folder and its children
export const getCurrentFolderQueryKey = (folderId?: string) => ["folders", "current", folderId]

export const getCurrentFolderQueryOptions = (folderId?: string) =>
  queryOptions<NoteFolderTree | null>({
    queryKey: getCurrentFolderQueryKey(folderId),
    queryFn: async () => {
      if (!folderId) return null

      const user = await getCurrentUser()
      const { data: folder, error } = await supabase
        .from("note_folders")
        .select()
        .eq("id", folderId)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .single()

      if (error) {
        throw error
      }

      // Get note count for this folder
      const { count: noteCount, error: noteCountError } = await supabase
        .from("notes")
        .select("*", { count: "exact", head: true })
        .eq("folder_id", folderId)
        .eq("user_id", user.id)
        .is("deleted_at", null)

      if (noteCountError) {
        throw noteCountError
      }

      const folderModel = noteFolderMapper.toModel(folder)
      return {
        ...folderModel,
        children: [], // Will be populated by getChildFoldersQueryOptions
        noteCount: noteCount || 0,
      }
    },
  })

export const getChildFoldersQueryKey = (parentId?: string) => ["folders", "children", parentId]

export const getChildFoldersQueryOptions = (parentId?: string) =>
  queryOptions<NoteFolderTree[]>({
    queryKey: getChildFoldersQueryKey(parentId),
    queryFn: async () => {
      const user = await getCurrentUser()

      let query = supabase.from("note_folders").select().eq("user_id", user.id).is("deleted_at", null).order("name")

      if (parentId === undefined || parentId === null) {
        query = query.is("parent_id", null)
      } else {
        query = query.eq("parent_id", parentId)
      }

      const { data: folders, error: foldersError } = await query

      if (foldersError) {
        throw foldersError
      }

      // Get note counts for these folders
      const folderIds = folders.map((f) => f.id)
      if (folderIds.length === 0) {
        return []
      }

      const { data: noteCounts, error: noteCountsError } = await supabase
        .from("notes")
        .select("folder_id")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .in("folder_id", folderIds)

      if (noteCountsError) {
        throw noteCountsError
      }

      // Count notes per folder
      const notesByFolder: Record<string, number> = {}
      noteCounts.forEach((note) => {
        if (note.folder_id) {
          notesByFolder[note.folder_id] = (notesByFolder[note.folder_id] || 0) + 1
        }
      })

      return folders.map((folder) => ({
        ...noteFolderMapper.toModel(folder),
        children: [], // Children will be fetched when navigating to this folder
        noteCount: notesByFolder[folder.id] || 0,
      }))
    },
  })

export const getFolderBreadcrumbQueryKey = (folderId?: string) => ["folders", "breadcrumb", folderId]

export const getFolderBreadcrumbQueryOptions = (folderId?: string) =>
  queryOptions<NoteFolderTree[]>({
    queryKey: getFolderBreadcrumbQueryKey(folderId),
    queryFn: async () => {
      if (!folderId) return []

      const user = await getCurrentUser()
      const path: NoteFolderTree[] = []
      let currentId: string | null = folderId

      // Traverse up the parent chain
      while (currentId) {
        const { data: folder, error }: { data: NoteFolderRow | null; error: any } = await supabase
          .from("note_folders")
          .select()
          .eq("id", currentId)
          .eq("user_id", user.id)
          .is("deleted_at", null)
          .single()

        if (error || !folder) {
          break
        }

        const folderModel = noteFolderMapper.toModel(folder)
        path.unshift({
          ...folderModel,
          children: [],
          noteCount: 0, // Not needed for breadcrumbs
        })

        currentId = folder.parent_id
      }

      return path
    },
  })

export const createFolderMutationOptions = () =>
  mutationOptions<NoteFolder, DefaultError, NoteFolderCreate>({
    mutationFn: async (data) => {
      const user = await getCurrentUser()
      const { data: created, error } = await supabase
        .from("note_folders")
        .insert(noteFolderMapper.toDbInsert(data, user.id))
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteFolderMapper.toModel(created)
    },
  })

export const patchFolderMutationOptions = () =>
  mutationOptions<NoteFolder, DefaultError, { folderId: string; data: NoteFolderPatch }>({
    mutationFn: async ({ folderId, data }) => {
      const user = await getCurrentUser()
      const { data: updated, error } = await supabase
        .from("note_folders")
        .update(noteFolderMapper.toDbUpdate(data))
        .eq("id", folderId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return noteFolderMapper.toModel(updated)
    },
  })

export const deleteFolderMutationOptions = () =>
  mutationOptions<void, DefaultError, { folderId: string }>({
    mutationFn: async ({ folderId }) => {
      const user = await getCurrentUser()
      const { error } = await supabase
        .from("note_folders")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", folderId)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }
    },
  })
