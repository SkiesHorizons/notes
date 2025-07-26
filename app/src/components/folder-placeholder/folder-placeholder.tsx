import { Text, UnstyledButton } from "@mantine/core"
import { IconFolderPlus } from "@tabler/icons-react"
import classes from "./folder-placeholder.module.css"

interface FolderPlaceholderProps {
  onClick?: () => void
}

export function FolderPlaceholder({ onClick }: FolderPlaceholderProps) {
  return (
    <UnstyledButton className={classes.placeholder} onClick={onClick}>
      <IconFolderPlus size={32} />
      <Text size="sm" fw={500} ta="center">
        Create new folder
      </Text>
    </UnstyledButton>
  )
}
