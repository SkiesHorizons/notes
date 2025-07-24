import { ActionIcon, Button, Menu } from "@mantine/core"
import { useLongPress } from "@mantine/hooks"
import { IconFolder, IconNotebook, IconPlus } from "@tabler/icons-react"
import classes from "./create-note-button.module.css"

interface CreateNoteButtonProps {
  onCreateNote: () => void
  onCreateFolder?: () => void
  variant?: "button" | "action"
}

export function CreateNoteButton({ onCreateNote, onCreateFolder, variant = "button" }: CreateNoteButtonProps) {
  const handleCreateNote = () => {
    onCreateNote()
  }

  const handleCreateFolder = () => {
    if (onCreateFolder) {
      onCreateFolder()
    }
  }

  const handlers = useLongPress(() => {
    handleCreateNote()
  })

  if (variant === "action") {
    return (
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon size="lg" variant="filled" className={classes.createButton} {...handlers}>
            <IconPlus size={18} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Create new</Menu.Label>
          <Menu.Item leftSection={<IconNotebook size={16} />} onClick={handleCreateNote}>
            Note
          </Menu.Item>
          {onCreateFolder && (
            <Menu.Item leftSection={<IconFolder size={16} />} onClick={handleCreateFolder}>
              Folder
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    )
  }

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button leftSection={<IconPlus size={16} />} className={classes.createButton} fullWidth {...handlers}>
          Create
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Create new</Menu.Label>
        <Menu.Item leftSection={<IconNotebook size={16} />} onClick={handleCreateNote}>
          Note
        </Menu.Item>
        {onCreateFolder && (
          <Menu.Item leftSection={<IconFolder size={16} />} onClick={handleCreateFolder}>
            Folder
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  )
}
