import { FolderBreadcrumbs } from "@/components/folder-breadcrumbs"
import { FolderList } from "@/components/folder-list"
import { NoteList } from "@/components/note-list"
import type { NoteFolder } from "@/lib/models/note-folder"
import type { Note } from "@/lib/models/notes"
import { mutations, queries } from "@/lib/queries"
import { folderEditModal, noteEditModal } from "@/lib/stores"
import { ActionIcon, Box, Group, Skeleton, Stack, Title } from "@mantine/core"
import { IconChevronLeft } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"
import { notifications } from "@mantine/notifications"

export const Route = createFileRoute("/(app)/browse")({
  component: RouteComponent,
  validateSearch: z.object({
    folderId: z.string().optional(),
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(queries.folders.list({ parentId: null }))
  },
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { folderId = null } = Route.useSearch()

  // Use the new specific queries instead of fetching all folders
  const currentFolderQuery = useQuery(queries.folders.detail(folderId || undefined, { path: true }))
  const childFoldersQuery = useQuery(queries.folders.list({ parentId: folderId }))
  const listNotesQuery = useQuery(queries.notes.list({ folderId }))

  const queryClient = useQueryClient()
  const { mutate: deleteNote } = useMutation({
    ...mutations.notes.delete(),
    onSuccess: async (_, { noteId }) => {
      notifications.show({
        title: "Note deleted",
        message: "The note has been successfully deleted.",
        color: "green",
      })
      await queryClient.setQueryData(queries.notes.list({ folderId }).queryKey, (oldData: Note[]) => {
        return oldData.filter((note) => note.id !== noteId)
      })
    },
    onError: (error) => {
      notifications.show({
        title: "Error deleting note",
        message: error.message || "An error occurred while deleting the note.",
        color: "red",
      })
    },
  })

  const handleFolderClick = (newFolderId: string) => {
    navigate({
      to: "/browse",
      search: { folderId: newFolderId },
    })
  }

  const handleBackClick = () => {
    navigate({
      to: "/browse",
      search: {
        folderId: currentFolder?.parentId || undefined,
      },
    })
  }

  const handleCreateNote = () => {
    noteEditModal.openCreate(folderId || undefined)
  }

  const handleEditNote = (note: Note) => {
    noteEditModal.openEdit(note)
  }

  const handleDeleteNote = (noteId: string) => {
    deleteNote({ noteId })
  }

  // Listen for create folder events from sidebar
  const handleCreateFolder = () => {
    folderEditModal.openCreate(folderId || undefined)
  }

  // Get current folder and its path for breadcrumbs
  const getCurrentFolder = (): NoteFolder | null => {
    return currentFolderQuery?.data || null
  }

  // Get folders to display (children of current folder or root folders)
  const getFoldersToDisplay = (): NoteFolder[] => {
    return childFoldersQuery.data || []
  }

  if (currentFolderQuery?.isLoading || childFoldersQuery.isLoading || listNotesQuery.isLoading) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={2}>Browse</Title>
        </Group>
        <Stack gap="md">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} height={200} radius="md" />
            ))}
        </Stack>
      </Stack>
    )
  }

  const notes = listNotesQuery.data || []
  const foldersToDisplay = getFoldersToDisplay()
  const currentFolder = getCurrentFolder()

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Box flex={1}>
            <Group gap="xs" mb="xs">
              {folderId && (
                <ActionIcon variant="subtle" onClick={handleBackClick} size="sm">
                  <IconChevronLeft size={16} />
                </ActionIcon>
              )}
              <Title order={2}>{currentFolder ? currentFolder.name : "All Folders"}</Title>
            </Group>

            {/* Use the new FolderBreadcrumbs component */}
            <FolderBreadcrumbs folder={currentFolder} />
          </Box>
        </Group>

        <Stack gap="lg">
          {/* Display folders first */}
          <FolderList
            folders={foldersToDisplay}
            onFolderClick={handleFolderClick}
            onCreateFolder={handleCreateFolder}
          />

          {/* Display notes */}
          <NoteList
            notes={notes}
            onEditNote={handleEditNote}
            onCreateNote={handleCreateNote}
            onDeleteNote={handleDeleteNote}
          />
        </Stack>
      </Stack>
    </>
  )
}
