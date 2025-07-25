import { FolderCard } from "@/components/folder-card"
import { FolderPlaceholder } from "@/components/folder-placeholder"
import type { NoteFolder } from "@/lib/models/note-folder"
import { SimpleGrid } from "@mantine/core"

interface FolderListProps {
  folders: NoteFolder[]
  onFolderClick: (folderId: string) => void
  onCreateFolder?: () => void
}

export function FolderList({ folders, onFolderClick, onCreateFolder }: FolderListProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing="md">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onClick={onFolderClick} />
      ))}
      <FolderPlaceholder onClick={onCreateFolder} />
    </SimpleGrid>
  )
}
