import { Skeleton, Stack, Text, UnstyledButton } from "@mantine/core"
import { useNavigate } from "@tanstack/react-router"
import { useListNotesQuery } from "@/hooks/api"

export function NoteBrowser() {
  const listNotesQuery = useListNotesQuery()
  const navigate = useNavigate()

  if (listNotesQuery.isLoading) {
    return (
      <Stack>
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} animate={true} />
          ))}
      </Stack>
    )
  }

  return (
    <Stack>
      {listNotesQuery.data?.map((note) => (
        <UnstyledButton
          key={note.id}
          onClick={async () => {
            await navigate({
              to: "/notes/$noteId",
              params: { noteId: note.id },
            })
          }}
          bg="gray"
        >
          <Text>{note.title || "Untitled Note"}</Text>
        </UnstyledButton>
      ))}
    </Stack>
  )
}
