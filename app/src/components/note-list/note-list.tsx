import { NoteCard } from "@/components/note-card"
import { NotePlaceholder } from "@/components/note-placeholder"
import type { Note } from "@/lib/models/notes"
import type { Block } from "@blocknote/core"
import { SimpleGrid } from "@mantine/core"
import { renderHtml } from "@/lib/blocknote/utils.ts"

interface NoteListProps {
  notes: Note[]
  onEditNote: (note: Note) => void
  onDeleteNote?: (noteId: string) => void
  onCreateNote?: () => void
}

export function NoteList({ notes, onEditNote, onDeleteNote, onCreateNote }: NoteListProps) {
  const renderContent = async (blocks: Block[]) => {
    return renderHtml(blocks)
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEditNote}
          onDelete={onDeleteNote}
          renderContent={renderContent}
          h={300}
        />
      ))}
      <NotePlaceholder h={300} onClick={onCreateNote} />
    </SimpleGrid>
  )
}
