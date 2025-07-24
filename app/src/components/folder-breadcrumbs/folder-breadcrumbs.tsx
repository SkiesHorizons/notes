import type { NoteFolderTree } from "@/lib/models/note-folder"
import { Anchor, Breadcrumbs, Text } from "@mantine/core"
import { IconFolder, IconHome } from "@tabler/icons-react"
import { Link } from "@tanstack/react-router"
import classes from "./folder-breadcrumbs.module.css"

interface FolderBreadcrumbsProps {
  breadcrumbs: NoteFolderTree[]
}

export function FolderBreadcrumbs({ breadcrumbs }: FolderBreadcrumbsProps) {
  const items = [
    // Always start with Home
    <Anchor 
      key="home" 
      component={Link} 
      to="/browse" 
      className={classes.breadcrumbItem}
    >
      <IconHome size={14} />
      <Text span ml={4}>All Folders</Text>
    </Anchor>,
    
    // Add folder breadcrumbs
    ...breadcrumbs.map((folder) => (
      <Anchor
        key={folder.id}
        component={Link}
        to="/browse"
        search={{ folderId: folder.id } as any}
        className={classes.breadcrumbItem}
      >
        <IconFolder size={14} />
        <Text span ml={4}>{folder.name}</Text>
      </Anchor>
    ))
  ]

  return (
    <Breadcrumbs 
      separator="/" 
      separatorMargin="xs" 
      className={classes.breadcrumbs}
    >
      {items}
    </Breadcrumbs>
  )
}
