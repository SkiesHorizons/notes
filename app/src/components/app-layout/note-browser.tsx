import { useListNotesQuery } from "@/hooks/api"
import { Skeleton, Stack, Text, UnstyledButton } from "@mantine/core"
import { Link } from "@tanstack/react-router"
import classes from "./note-browser.module.css"

export function NoteBrowser() {
  const listNotesQuery = useListNotesQuery()

  if (listNotesQuery.isLoading) {
    return (
      <Stack>
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} animate={true} />
          ))}
      </Stack>
    )
  }

  const notes = listNotesQuery.data || []

  return (
    <Stack gap="xs">
      {notes.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          No notes yet
        </Text>
      ) : (
        notes.map((note) => (
          <UnstyledButton 
            key={note.id} 
            component={Link} 
            to="/" 
            className={classes.noteItem}
          >
            <Text size="sm" lineClamp={2} fw={500}>
              {note.title || "Untitled Note"}
            </Text>
            <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
              {note.content ? 
                (() => {
                  try {
                    const blocks = JSON.parse(note.content)
                    return blocks
                      .map((block: any) => block.content?.map((item: any) => item.text).join("") || "")
                      .filter(Boolean)
                      .join(" ")
                      .slice(0, 50) + "..."
                  } catch {
                    return note.content.slice(0, 50) + "..."
                  }
                })()
                : "No content"
              }
            </Text>
          </UnstyledButton>
        ))
      )}
    </Stack>
  )
}
