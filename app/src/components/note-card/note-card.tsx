import { useDeleteNoteMutation } from "@/hooks/api"
import type { Note } from "@/lib/models/notes"
import { ActionIcon, Card, Group, Menu, Text, Title } from "@mantine/core"
import { IconDots, IconEdit, IconTrash } from "@tabler/icons-react"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import classes from "./note-card.module.css"

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  viewMode: "list" | "grid" | "masonry"
}

export function NoteCard({ note, onEdit, viewMode }: NoteCardProps) {
  const deleteNoteMutation = useDeleteNoteMutation()
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    try {
      await deleteNoteMutation.mutateAsync({ noteId: note.id })
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    } catch (error) {
      console.error("Failed to delete note:", error)
    }
  }

  const renderContent = () => {
    if (!note.content) return null
    
    try {
      const blocks = JSON.parse(note.content)
      const textContent = blocks
        .map((block: any) => block.content?.map((item: any) => item.text).join("") || "")
        .filter(Boolean)
        .join(" ")
        .slice(0, 200)
      
      return textContent || "No content"
    } catch {
      return note.content.slice(0, 200)
    }
  }

  const cardClass = viewMode === "list" ? classes.listCard : classes.gridCard

  return (
    <Card 
      shadow="sm" 
      padding="md" 
      radius="md" 
      withBorder 
      className={cardClass}
      onClick={() => onEdit(note)}
    >
      <Group justify="space-between" mb="xs">
        <Title order={4} lineClamp={2} className={classes.title}>
          {note.title || "Untitled Note"}
        </Title>
        <Menu shadow="md" withinPortal>
          <Menu.Target>
            <ActionIcon 
              variant="subtle" 
              size="sm"
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
                handleDelete()
              }}
            >
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text size="sm" c="dimmed" lineClamp={viewMode === "list" ? 2 : 4} mb="xs">
        {renderContent()}
      </Text>

      <Text size="xs" c="dimmed">
        {dayjs(note.updatedAt).format("MMM D, YYYY [at] h:mm A")}
      </Text>
    </Card>
  )
}
