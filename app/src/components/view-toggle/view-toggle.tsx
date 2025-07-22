import { ActionIcon, Group, Tooltip } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { IconLayoutBoard, IconLayoutGrid, IconLayoutList } from "@tabler/icons-react"

export type ViewMode = "list" | "grid" | "masonry"

interface ViewToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  const viewModes: Array<{ mode: ViewMode; icon: React.ReactNode; label: string }> = [
    { mode: "list", icon: <IconLayoutList size={18} />, label: "List view" },
    { mode: "grid", icon: <IconLayoutGrid size={18} />, label: "Grid view" },
    // Hide masonry on mobile for better UX
    ...(!isMobile ? [{ mode: "masonry" as ViewMode, icon: <IconLayoutBoard size={18} />, label: "Masonry view" }] : []),
  ]

  return (
    <Group gap="xs">
      {viewModes.map(({ mode, icon, label }) => (
        <Tooltip key={mode} label={label}>
          <ActionIcon
            variant={value === mode ? "filled" : "subtle"}
            onClick={() => onChange(mode)}
            size="lg"
          >
            {icon}
          </ActionIcon>
        </Tooltip>
      ))}
    </Group>
  )
}
