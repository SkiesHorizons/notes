import { Button, Group, Modal, Select, TextInput } from "@mantine/core"
import { folderEditModal } from "@/lib/stores"
import { useStore } from "@tanstack/react-store"
import { Form, useForm } from "@mantine/form"
import { z } from "zod"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { mutations, queries } from "@/lib/queries"
import { useEffect, useMemo } from "react"
import { notifications } from "@mantine/notifications"

const zFolderFormValues = z.object({
  name: z.string().nonempty("Folder name is required"),
  parentId: z.uuid().nullable(),
})

export function FolderEditModal() {
  const { opened, initialFolder, initialParentFolderId } = useStore(folderEditModal.store)
  // todo filter folders to exclude the current folder and its descendants if editing
  const { data: folders } = useQuery(queries.folders.list())
  const form = useForm({
    mode: "uncontrolled",
    validate: zod4Resolver(zFolderFormValues),
  })

  useEffect(() => {
    const formValues = form.getValues()
    form.setInitialValues({
      name: initialFolder ? initialFolder.name : formValues.name,
      parentId: initialFolder ? initialFolder.parentId : initialParentFolderId || null,
    })
    form.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFolder, initialParentFolderId])

  const folderOptions = useMemo(() => {
    return (
      folders?.map((folder) => ({
        value: folder.id,
        label: folder.name,
      })) || []
    )
  }, [folders])

  const queryClient = useQueryClient()
  const { mutate: createFolder } = useMutation({
    ...mutations.folders.create(),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({
        queryKey: queries.folders.list().queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: queries.folders.list({ parentId: created.parentId }).queryKey,
      })
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error creating folder",
        message: error.message || "An error occurred while creating the folder.",
      })
    },
  })

  const { mutate: patchFolder } = useMutation({
    ...mutations.folders.patch(),
    onSuccess: async (updated) => {
      await queryClient.setQueryData(queries.folders.list().queryKey, (old: any[]) =>
        old.map((folder) => (folder.id === updated.id ? updated : folder)),
      )
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error updating folder",
        message: error.message || "An error occurred while updating the folder.",
      })
    },
  })

  const handleSubmit = (values: Partial<z.infer<typeof zFolderFormValues>>) => {
    if (initialFolder) {
      const data = {
        name: values.name === initialFolder.name ? undefined : values.name,
        parentId: values.parentId === initialFolder.parentId ? undefined : values.parentId,
      }
      if (Object.keys(data).length !== 0) {
        patchFolder({
          folderId: initialFolder.id,
          data,
        })
      }
    } else if (values.name) {
      createFolder({
        name: values.name,
        parentId: values.parentId || null,
      })
    }
    folderEditModal.close()
    form.reset()
  }

  const handleClose = () => {
    folderEditModal.close()
  }

  return (
    <Modal.Root opened={opened} onClose={handleClose}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>{initialFolder ? "Edit Folder" : "Create New Folder"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form form={form} onSubmit={handleSubmit}>
            <TextInput
              label="Folder Name"
              placeholder="Enter folder name"
              required
              autoFocus
              key={form.key("name")}
              {...form.getInputProps("name")}
            />
            <Select
              data={folderOptions}
              label="Parent Folder"
              placeholder="Select parent folder"
              clearable
              searchable
              key={form.key("parentId")}
              {...form.getInputProps("parentId")}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{initialFolder ? "Save Changes" : "Create Folder"}</Button>
            </Group>
          </Form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
