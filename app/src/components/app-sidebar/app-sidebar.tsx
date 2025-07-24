import { ActionIcon, Group, Stack, useMantineColorScheme } from "@mantine/core"
import { IconFolders, IconHome, IconMoon, IconSettings, IconSun } from "@tabler/icons-react"
import { Link, useLocation } from "@tanstack/react-router"
import classes from "./app-sidebar.module.css"

export function AppSidebar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true
    if (path === "/browse" && location.pathname === "/browse") return true
    return false
  }

  return (
    <Stack p="md" gap="md" h="100%">
      <Stack gap="xs">
        <Link to="/" className={classes.navLink} data-active={isActive("/")}>
          <Group gap="sm">
            <IconHome size={20} />
            <span>Home</span>
          </Group>
        </Link>

        <Link to="/browse" className={classes.navLink} data-active={isActive("/browse")}>
          <Group gap="sm">
            <IconFolders size={20} />
            <span>Browse</span>
          </Group>
        </Link>
      </Stack>

      <div style={{ flex: 1 }}></div>

      <Stack gap="xs">
        <Group gap="xs" justify="space-between">
          <ActionIcon variant="subtle" onClick={() => toggleColorScheme()} size="md" aria-label="Toggle color scheme">
            {colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
          </ActionIcon>

          <ActionIcon variant="subtle" size="md" aria-label="Settings">
            <IconSettings size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Stack>
  )
}
