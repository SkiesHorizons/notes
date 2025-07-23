import { NoteCard } from "@/components/note-card"
import type { ViewMode } from "@/components/view-toggle"
import { renderHtml } from "@/lib/blocknotejs"
import type { Note } from "@/lib/models/notes"
import type { Block } from "@blocknote/core"
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

  const renderContent = async (blocks: Block[]) => {
    return renderHtml(blocks)
  }

  if (viewMode === "list") {
    return (
      <Stack gap="md">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onEdit={onEditNote} renderContent={renderContent} />
        ))}
      </Stack>
    )
  }

  if (viewMode === "grid") {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onEdit={onEditNote} renderContent={renderContent} h={300} />
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
                <NoteCard note={note} onEdit={onEditNote} renderContent={renderContent} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return null
}
