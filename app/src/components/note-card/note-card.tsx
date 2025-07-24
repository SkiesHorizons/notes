import { NoteContent } from "@/components/note-card/note-content"
import type { Note } from "@/lib/models/notes"
import { ActionIcon, Box, Breadcrumbs, Card, type CardProps, Menu, Text, Title } from "@mantine/core"
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react"
import dayjs from "dayjs"
import { useState } from "react"
import classes from "./note-card.module.css"

interface NoteCardProps extends CardProps {
  note: Note
  renderContent: (blocks: any) => Promise<string>
  onEdit: (note: Note) => void
  onDelete?: (noteId: string) => void
  showFolderBreadcrumbs?: boolean
  folderPath?: string[]
}

export function NoteCard({
  note,
  renderContent,
  onEdit,
  onDelete,
  showFolderBreadcrumbs = false,
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
      {showFolderBreadcrumbs && folderPath.length > 0 && (
        <Breadcrumbs c="dimmed">
          {folderPath.map((folder, index) => (
            <Text key={index} size="xs">
              {folder}
            </Text>
          ))}
        </Breadcrumbs>
      )}

      <Text size="xs" c="dimmed" pb="xs">
        {dayjs(note.updatedAt).format("MMM D, YYYY [at] h:mm A")}
      </Text>

      {note.title && (
        <Title order={3} className={classes.title} pb="xs" lineClamp={2}>
          {note.title}
        </Title>
      )}

      <NoteContent contentJson={note.content} renderContent={renderContent} />

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
