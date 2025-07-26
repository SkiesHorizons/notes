import { Button, Group, Modal, Select, TextInput } from "@mantine/core"
import { folderEditModal } from "@/lib/stores"
import { useStore } from "@tanstack/react-store"
import { Form, useForm } from "@mantine/form"
import { z } from "zod"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useQuery } from "@tanstack/react-query"
import { queries } from "@/lib/queries"
import { useEffect, useMemo } from "react"

const zFolderFormValues = z.object({
  name: z.string().min(1, "Folder name is required"),
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
      name: initialFolder ? initialFolder.name : formValues["name"],
      parentId: initialFolder ? initialFolder.parentId : initialParentFolderId || null,
    })
    form.reset()
  }, [initialFolder, initialParentFolderId])

  const folderOptions = useMemo(() => {
    console.log("Generating folder options")
    return (
      folders?.map((folder) => ({
        value: folder.id,
        label: folder.name,
      })) || []
    )
  }, [folders])

  const handleSubmit = (values: Partial<z.infer<typeof zFolderFormValues>>) => {
    console.log(values)
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
