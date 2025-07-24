import { FolderList } from "@/components/folder-list"
import { NoteEditorModal, type NoteData } from "@/components/note-editor-modal"
import { NoteList } from "@/components/note-list"
import type { NoteFolderTree } from "@/lib/models/note-folder"
import type { Note } from "@/lib/models/notes"
import {
  createNoteMutationOptions,
  getChildFoldersQueryOptions,
  getCurrentFolderQueryOptions,
  getFolderBreadcrumbQueryOptions,
  listNotesQueryOptions,
  patchNoteMutationOptions,
} from "@/lib/queries"
import { ActionIcon, Box, Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core"
import { IconChevronLeft } from "@tabler/icons-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import z from "zod"

export const Route = createFileRoute("/(app)/browse")({
  component: RouteComponent,
  validateSearch: z.object({
    folderId: z.string().optional(),
  }),
})

function RouteComponent() {
  const navigate = useNavigate()
  const { folderId } = Route.useSearch()
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined)
  const [modalOpened, setModalOpened] = useState(false)

  // Use the new specific queries instead of fetching all folders
  const currentFolderQuery = useQuery(getCurrentFolderQueryOptions(folderId))
  const childFoldersQuery = useQuery(getChildFoldersQueryOptions(folderId))
  const breadcrumbQuery = useQuery(getFolderBreadcrumbQueryOptions(folderId))
  const listNotesQuery = useQuery(listNotesQueryOptions({ folderId }))

  const createNoteMutation = useMutation(createNoteMutationOptions())
  const patchNoteMutation = useMutation(patchNoteMutationOptions())
  const queryClient = useQueryClient()

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
    setSelectedNote(undefined)
    setModalOpened(true)
  }

  const handleEditNote = (note: Note) => {
    setSelectedNote(note)
    setModalOpened(true)
  }

  const handleModalClose = () => {
    setModalOpened(false)
    setSelectedNote(undefined)
  }

  const handleNoteSave = async (data: NoteData, noteId?: string) => {
    try {
      if (!noteId) {
        // Create new note in current folder
        await createNoteMutation.mutateAsync({
          title: data.title || "",
          content: data.content || "",
          folderId: folderId,
        })
      } else {
        // Patch existing note
        await patchNoteMutation.mutateAsync({
          noteId,
          data: {
            title: data.title,
            content: data.content,
            folderId: data.folderId,
          },
        })
      }
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["folders"] })
    } catch (error) {
      console.error("Failed to save note:", error)
    }
  }

  // Get current folder and its path for breadcrumbs
  const getCurrentFolder = (): NoteFolderTree | null => {
    return currentFolderQuery.data || null
  }

  const getBreadcrumbPath = (): NoteFolderTree[] => {
    return breadcrumbQuery.data || []
  }

  // Get folders to display (children of current folder or root folders)
  const getFoldersToDisplay = (): NoteFolderTree[] => {
    return childFoldersQuery.data || []
  }

  if (
    currentFolderQuery.isLoading ||
    childFoldersQuery.isLoading ||
    breadcrumbQuery.isLoading ||
    listNotesQuery.isLoading
  ) {
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
  const breadcrumbPath = getBreadcrumbPath()

  return (
    <>
      <Stack gap="md">
        <Group justify="space-between">
          <Box>
            <Group gap="xs" mb="xs">
              {folderId && (
                <ActionIcon variant="subtle" onClick={handleBackClick} size="sm">
                  <IconChevronLeft size={16} />
                </ActionIcon>
              )}
              <Title order={2}>{currentFolder ? currentFolder.name : "Browse"}</Title>
            </Group>

            {breadcrumbPath.length > 0 && (
              <Box size="sm">
                <Text
                  size="sm"
                  c={!folderId ? "blue" : "dimmed"}
                  style={{ cursor: "pointer", display: "inline-block", marginRight: "8px" }}
                  onClick={() => navigate({ to: "/browse" })}
                >
                  All Folders
                </Text>
                {breadcrumbPath.map((folder, index) => {
                  const isLast = index === breadcrumbPath.length - 1
                  return (
                    <span key={folder.id}>
                      <Text component="span" size="sm" c="dimmed" style={{ margin: "0 8px" }}>
                        /
                      </Text>
                      <Text
                        component="span"
                        size="sm"
                        c={isLast ? "blue" : "dimmed"}
                        style={{ cursor: isLast ? "default" : "pointer" }}
                        onClick={
                          !isLast ? () => navigate({ to: "/browse", search: { folderId: folder.id } }) : undefined
                        }
                      >
                        {folder.name}
                      </Text>
                    </span>
                  )
                })}
              </Box>
            )}
          </Box>

          <Group gap="xs">
            <Button size="sm" onClick={handleCreateNote}>
              New Note
            </Button>
          </Group>
        </Group>

        <Stack gap="lg">
          {/* Display folders first */}
          <FolderList folders={foldersToDisplay} onFolderClick={handleFolderClick} />

          {/* Display notes */}
          <NoteList notes={notes} onEditNote={handleEditNote} onCreateNote={handleCreateNote} />
        </Stack>
      </Stack>

      <NoteEditorModal
        opened={modalOpened}
        onClose={handleModalClose}
        note={selectedNote}
        onSave={handleNoteSave}
        initialFolderId={folderId}
        size="xl"
      />
    </>
  )
}
