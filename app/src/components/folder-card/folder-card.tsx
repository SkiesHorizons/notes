import type { NoteFolder } from "@/lib/models/note-folder"
import { Box, Text } from "@mantine/core"
import { IconFolder } from "@tabler/icons-react"
import classes from "./folder-card.module.css"

interface FolderCardProps {
  folder: NoteFolder
  onClick: (folderId: string) => void
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <Box onClick={() => onClick(folder.id)} className={classes.folderCard}>
      <IconFolder size={32} color="var(--mantine-color-blue-6)" />
      <Text size="sm" fw={500} ta="center">
        {folder.name}
      </Text>
      {folder.noteCount && folder.noteCount > 0 && (
        <Text size="xs" c="dimmed">
          {folder.noteCount} {folder.noteCount === 1 ? "note" : "notes"}
        </Text>
      )}
    </Box>
  )
}
