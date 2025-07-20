import { createFileRoute } from "@tanstack/react-router"
import { useCreateNoteMutation } from "@/hooks/api"
import type { PartialBlock } from "@blocknote/core"
import { notifications } from "@mantine/notifications"
import { useQueryClient } from "@tanstack/react-query"
import { listNotesQueryKey } from "@/lib/api"
import { savingStore } from "@/lib/stores.ts"
import { type NoteData, NoteEditor } from "@/components/note-editor"

export const Route = createFileRoute("/(app)/notes/new")({
  component: RouteComponent,
})

const BLANK_BLOCK: PartialBlock = {
  type: "paragraph",
  content: "",
}

function RouteComponent() {
  const queryClient = useQueryClient()
  const navigate = Route.useNavigate()
  const createNoteMutation = useCreateNoteMutation({
    onMutate: () => {
      savingStore.setState(() => true)
    },

    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: listNotesQueryKey(),
      })
      await navigate({
        to: "/notes/$noteId",
        params: { noteId: data.id },
        replace: true,
        from: "/notes/new",
      })
      savingStore.setState(() => false)
    },
    onError: (err) => {
      notifications.show({
        color: "red",
        title: "Error creating note",
        message: err?.message || "An error occurred while creating the note.",
        autoClose: 5000,
      })
    },
  })

  const handleSave = (data: NoteData) => {
    createNoteMutation.mutate({
      body: {
        title: data.title,
        content: data.content || JSON.stringify([BLANK_BLOCK]),
      },
    })
  }

  // todo fix when type title and quickly switch to content, it create two notes with title only and content only
  // possibly solution is decreasing debounce time
  // todo when saving and redirecting to the note, it the focus is lost

  return <NoteEditor onSave={handleSave} />
}
