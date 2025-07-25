import { mutations } from "@/lib/queries"
import { Button, Group, Modal, Stack, TextInput } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

interface CreateFolderModalProps {
  opened: boolean
  onClose: () => void
  parentFolderId?: string | null
}

export function CreateFolderModal({ opened, onClose, parentFolderId }: CreateFolderModalProps) {
  const [name, setName] = useState("")
  const createFolderMutation = useMutation(mutations.folders.create())
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await createFolderMutation.mutateAsync({
        name: name.trim(),
        parentId: parentFolderId,
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["folders"] })

      // Reset form and close modal
      setName("")
      onClose()
    } catch (error) {
      console.error("Error creating folder:", error)
    }
  }

  const handleClose = () => {
    setName("")
    onClose()
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Create New Folder" size="sm">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Folder name"
            placeholder="Enter folder name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            autoFocus
            data-autofocus
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={handleClose} disabled={createFolderMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" loading={createFolderMutation.isPending} disabled={!name.trim()}>
              Create Folder
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
