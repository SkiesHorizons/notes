import { FolderCard } from "@/components/folder-card"
import { FolderPlaceholder } from "@/components/folder-placeholder"
import type { NoteFolderTree } from "@/lib/models/note-folder"
import { SimpleGrid } from "@mantine/core"

interface FolderListProps {
  folders: NoteFolderTree[]
  onFolderClick: (folderId: string) => void
}

export function FolderList({ folders, onFolderClick }: FolderListProps) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing="md">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} onClick={onFolderClick} />
      ))}
      <FolderPlaceholder onClick={() => console.log("Create new folder")} />
    </SimpleGrid>
  )
}
