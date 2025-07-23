import { AppHeader } from "@/components/app-header"
import { NoteBrowser } from "@/components/app-layout/note-browser"
import { FolderBrowser } from "@/components/folder-browser"
import { AppShell, Button, Divider, ScrollArea, Stack } from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { IconPlus } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      close()
    }
  }, [isMobile, close])

  const handleCreateNote = () => {
    // Dispatch custom event to trigger note creation from main component
    // Include selected folder in the event
    window.dispatchEvent(new CustomEvent("create-note", { 
      detail: { folderId: selectedFolderId } 
    }))
    if (isMobile) {
      close()
    }
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 350, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <AppHeader opened={opened} toggle={toggle} />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Button onClick={handleCreateNote} fullWidth variant="outline" leftSection={<IconPlus size={16} />}>
            Create new note
          </Button>
        </AppShell.Section>
        <AppShell.Section component={ScrollArea} grow mt="md" h="100%">
          <Stack gap="md" h="100%">
            <FolderBrowser 
              selectedFolderId={selectedFolderId}
              onFolderSelect={setSelectedFolderId}
            />
            <Divider />
            <NoteBrowser selectedFolderId={selectedFolderId} />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
