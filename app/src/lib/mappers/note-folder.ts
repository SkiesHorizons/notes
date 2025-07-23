import type { NoteFolder, NoteFolderCreate, NoteFolderPatch, NoteFolderTree } from "@/lib/models/note-folder"
import type { Database } from "@/lib/supabase"

type NoteFolderRow = Database["public"]["Tables"]["note_folders"]["Row"]
type NoteFolderInsert = Database["public"]["Tables"]["note_folders"]["Insert"]
type NoteFolderUpdate = Database["public"]["Tables"]["note_folders"]["Update"]

export const noteFolderMapper = {
  toModel: (db: NoteFolderRow): NoteFolder => ({
    id: db.id,
    userId: db.user_id,
    name: db.name,
    parentId: db.parent_id,
    depth: db.depth,
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
  buildTree: (folders: NoteFolder[], notesByFolder: Record<string, number> = {}): NoteFolderTree[] => {
    const folderMap = new Map<string, NoteFolderTree>()
    const rootFolders: NoteFolderTree[] = []

    // Create tree nodes
    folders.forEach((folder) => {
      const treeNode: NoteFolderTree = {
        ...folder,
        children: [],
        noteCount: notesByFolder[folder.id] || 0,
      }
      folderMap.set(folder.id, treeNode)
    })

    // Build tree structure
    folders.forEach((folder) => {
      const treeNode = folderMap.get(folder.id)!
      if (folder.parentId && folderMap.has(folder.parentId)) {
        const parent = folderMap.get(folder.parentId)!
        parent.children.push(treeNode)
      } else {
        rootFolders.push(treeNode)
      }
    })

    // Sort by name
    const sortTree = (nodes: NoteFolderTree[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name))
      nodes.forEach((node) => sortTree(node.children))
    }
    sortTree(rootFolders)

    return rootFolders
  },
}
