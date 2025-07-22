import { savingStore } from "@/lib/stores"
import { supabase } from "@/lib/supabase"
import {
    ActionIcon,
    Avatar,
    Burger,
    Group,
    Image,
    Loader,
    Menu,
    TextInput,
    useMantineColorScheme,
} from "@mantine/core"
import { IconMoon, IconSearch, IconSettings, IconSun, IconUser } from "@tabler/icons-react"
import { useStore } from "@tanstack/react-store"
import { useState } from "react"
import classes from "./app-header.module.css"

interface AppHeaderProps {
  opened: boolean
  toggle: () => void
}

export function AppHeader({ opened, toggle }: AppHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const saving = useStore(savingStore)
  const [searchValue, setSearchValue] = useState("")

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Group gap="xs">
          <Image src="/tauri.svg" h={30} w={30} />
          <span className={classes.appName}>SH Notes</span>
        </Group>
      </Group>

      <Group gap="md" flex={1} justify="center" maw={400}>
        <TextInput
          placeholder="Search notes..."
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          className={classes.searchInput}
          w="100%"
        />
      </Group>

      <Group gap="xs">
        {saving && <Loader size="sm" />}
        
        <ActionIcon
          variant="subtle"
          onClick={() => toggleColorScheme()}
          size="lg"
          aria-label="Toggle color scheme"
        >
          {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
        </ActionIcon>

        <ActionIcon variant="subtle" size="lg" aria-label="Settings">
          <IconSettings size={18} />
        </ActionIcon>

        <Menu shadow="md" width={200}>
          <Menu.Target>
            <ActionIcon variant="subtle" size="lg">
              <Avatar size="sm">
                <IconUser size={16} />
              </Avatar>
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Account</Menu.Label>
            <Menu.Item leftSection={<IconSettings size={14} />}>Settings</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  )
}
