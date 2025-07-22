import { Box, Text, UnstyledButton } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import classes from "./note-placeholder.module.css"

interface NotePlaceholderProps {
  onCreateNote: () => void
}

export function NotePlaceholder({ onCreateNote }: NotePlaceholderProps) {
  return (
    <UnstyledButton onClick={onCreateNote} className={classes.placeholder}>
      <Box className={classes.content}>
        <IconPlus size={24} className={classes.icon} />
        <Text size="lg" fw={500} mb="xs">
          Create your first note
        </Text>
        <Text size="sm" c="dimmed">
          Click here to start writing
        </Text>
      </Box>
    </UnstyledButton>
  )
}
