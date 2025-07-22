import { NoteCard } from "@/components/note-card"
import type { ViewMode } from "@/components/view-toggle"
import type { Note } from "@/lib/models/notes"
import { SimpleGrid, Stack } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import classes from "./note-list.module.css"

interface NoteListProps {
  notes: Note[]
  viewMode: ViewMode
  onEditNote: (note: Note) => void
}

export function NoteList({ notes, viewMode, onEditNote }: NoteListProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  if (viewMode === "list") {
    return (
      <Stack gap="md">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onEdit={onEditNote} viewMode="list" />
        ))}
      </Stack>
    )
  }

  if (viewMode === "grid") {
    return (
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
        spacing="md"
      >
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onEdit={onEditNote} viewMode="grid" />
        ))}
      </SimpleGrid>
    )
  }

  // Masonry view
  if (viewMode === "masonry") {
    const columns = isMobile ? 1 : 3
    const columnNotes: Note[][] = Array.from({ length: columns }, () => [])
    
    notes.forEach((note, index) => {
      columnNotes[index % columns].push(note)
    })

    return (
      <div className={classes.masonryContainer}>
        {columnNotes.map((columnItems, columnIndex) => (
          <div key={columnIndex} className={classes.masonryColumn}>
            {columnItems.map((note) => (
              <div key={note.id} className={classes.masonryItem}>
                <NoteCard note={note} onEdit={onEditNote} viewMode="grid" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return null
}
