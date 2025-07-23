import { NoteContent } from "@/components/note-card/note-content"
import type { Note } from "@/lib/models/notes"
import { ActionIcon, Box, Breadcrumbs, Card, type CardProps, Menu, Stack, Text, Title } from "@mantine/core"
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react"
import dayjs from "dayjs"
import { useState } from "react"
import classes from "./note-card.module.css"

interface NoteCardProps extends CardProps {
  note: Note
  onEdit: (note: Note) => void
  onDelete?: (noteId: string) => void
  showFolderBreadcrumbs?: boolean
  renderContent: (blocks: any) => Promise<string>
  folderPath?: string[]
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  showFolderBreadcrumbs = false,
  renderContent,
  folderPath = [],
  ...cardProps
}: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      className={classes.noteCard}
      onClick={() => onEdit(note)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...cardProps}
    >
      <Stack gap="xs">
        {showFolderBreadcrumbs && folderPath.length > 0 && (
          <Breadcrumbs c="dimmed">
            {folderPath.map((folder, index) => (
              <Text key={index} size="xs">
                {folder}
              </Text>
            ))}
          </Breadcrumbs>
        )}

        <Text size="xs" c="dimmed">
          {dayjs(note.updatedAt).format("MMM D, YYYY [at] h:mm A")}
        </Text>

        <Title order={4} lineClamp={2} className={classes.title}>
          {note.title || "Untitled Note"}
        </Title>

        <NoteContent contentJson={note.content} renderContent={renderContent} />
      </Stack>

      {isHovered && (
        <Box className={classes.menuContainer}>
          <Menu shadow="md" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                size="sm"
                className={classes.menuButton}
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(note)
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete?.(note.id)
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      )}
    </Card>
  )
}
