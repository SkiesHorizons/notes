import { AppHeader } from "@/components/app-header"
import { NoteBrowser } from "@/components/app-layout/note-browser"
import { AppShell, Button, ScrollArea } from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { IconPlus } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { useEffect } from "react"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure()
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      close()
    }
  }, [isMobile, close])

  const handleCreateNote = () => {
    // Dispatch custom event to trigger note creation from main component
    window.dispatchEvent(new CustomEvent("create-note"))
    if (isMobile) {
      close()
    }
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
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
          <NoteBrowser />
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
