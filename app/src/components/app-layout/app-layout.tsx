import { AppShell, Burger, Button, Group, Image, Loader, ScrollArea } from "@mantine/core"
import type { ReactNode } from "react"
import { useDisclosure } from "@mantine/hooks"
import { IconPlus } from "@tabler/icons-react"
import { NoteBrowser } from "@/components/app-layout/note-browser"
import { Link } from "@tanstack/react-router"
import { useStore } from "@tanstack/react-store"
import { savingStore } from "@/lib/stores.ts"

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure()
  const saving = useStore(savingStore)

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Image src="/tauri.svg" h={30} w={30} />
          </Group>
          <Group>{saving && <Loader size="sm" />}</Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AppShell.Section>
          <Button component={Link} to={"/notes/new"} fullWidth variant="outline" leftSection={<IconPlus size={16} />}>
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
