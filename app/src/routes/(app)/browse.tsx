import { CreateFolderModal } from "@/components/create-folder-modal"
import { FolderBreadcrumbs } from "@/components/folder-breadcrumbs"
import { FolderList } from "@/components/folder-list"
import { NoteList } from "@/components/note-list"
import type { NoteFolder } from "@/lib/models/note-folder"
import type { Note } from "@/lib/models/notes"
import { queries } from "@/lib/queries"
import { noteEditorModalState } from "@/lib/stores"
import { ActionIcon, Box, Group, Skeleton, Stack, Title } from "@mantine/core"
import { IconChevronLeft } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import z from "zod"

export const Route = createFileRoute("/(app)/browse")({
  component: RouteComponent,
  validateSearch: z.object({
    folderId: z.string().optional(),
  }),
  loader: async ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(queries.folders.list({ parentId: null }))
  },
})

function RouteComponent() {
  const navigate = useNavigate()
  const { folderId } = Route.useSearch()
  const [folderModalOpened, setFolderModalOpened] = useState(false)

  // Use the new specific queries instead of fetching all folders
  const currentFolderQuery = useQuery(queries.folders.detail(folderId, { path: true }))
  const childFoldersQuery = useQuery(queries.folders.list({ parentId: folderId }))
  const listNotesQuery = useQuery(queries.notes.list({ folderId }))

  const handleFolderClick = (newFolderId: string) => {
    navigate({
      to: "/browse",
      search: { folderId: newFolderId },
    })
  }

  const handleBackClick = () => {
    navigate({
      to: "/browse",
    })
  }

  const handleCreateNote = () => {
    noteEditorModalState.openCreate(folderId)
  }

  const handleEditNote = (note: Note) => {
    noteEditorModalState.openEdit(note)
  }

  // Listen for create folder events from sidebar
  const handleCreateFolderEvent = () => {
    setFolderModalOpened(true)
  }

  window.addEventListener("create-folder", handleCreateFolderEvent as EventListener)

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
          <FolderList folders={foldersToDisplay} onFolderClick={handleFolderClick} />

          {/* Display notes */}
          <NoteList notes={notes} onEditNote={handleEditNote} onCreateNote={handleCreateNote} />
        </Stack>
      </Stack>

      <CreateFolderModal
        opened={folderModalOpened}
        onClose={() => setFolderModalOpened(false)}
        parentFolderId={folderId}
      />
    </>
  )
}
