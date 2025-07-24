import { Box, Text, UnstyledButton, type UnstyledButtonProps } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import type { ReactNode } from "react"
import classes from "./note-placeholder.module.css"

interface NotePlaceholderProps extends UnstyledButtonProps {
  title?: ReactNode
  description?: ReactNode
  onClick?: () => void
}

export function NotePlaceholder({
  title = "Create new note",
  description = "Click here to start writing",
  ...props
}: NotePlaceholderProps) {
  return (
    <UnstyledButton {...props} className={classes.placeholder}>
      <Box className={classes.content}>
        <IconPlus size={24} className={classes.icon} />
        <Text size="lg" fw={500} mb="xs">
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Box>
    </UnstyledButton>
  )
}
