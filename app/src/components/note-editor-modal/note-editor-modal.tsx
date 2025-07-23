import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { useListFoldersQuery } from "@/hooks/api"
import { schema } from "@/lib/blocknotejs"
import type { Note } from "@/lib/models/notes"
import { BlockNoteView } from "@blocknote/mantine"
import {
    BlockNoteViewEditor,
    ExperimentalMobileFormattingToolbarController,
    FormattingToolbarController,
    useCreateBlockNote,
} from "@blocknote/react"
import { Box, Flex, Group, Modal, Select, type ModalProps } from "@mantine/core"
import { getHotkeyHandler, useDebouncedCallback, useHotkeys, useMediaQuery, type HotkeyItem } from "@mantine/hooks"
import { useEffect, useRef, useState } from "react"
import classes from "./note-editor-modal.module.css"

export type NoteData = {
  title?: string | null
  content?: string
  folderId?: string | null
}

interface NoteEditorModalProps {
  opened: boolean
  onClose: () => void
  note?: Note
  onSave: (data: NoteData, noteId?: string) => void
  autoSaveDelay?: number
  size?: ModalProps["size"]
  initialFolderId?: string | null
}

export function NoteEditorModal({
  opened,
  onClose,
  note,
  onSave,
  autoSaveDelay = 2000,
  size = "lg",
  initialFolderId,
}: NoteEditorModalProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    note?.folderId || initialFolderId || null
  )
  const { data: folders = [] } = useListFoldersQuery()
  
  // Flatten folder tree for Select component
  const flattenFolders = (folders: any[], prefix = ''): Array<{ value: string; label: string }> => {
    const result: Array<{ value: string; label: string }> = []
    folders.forEach((folder) => {
      const label = prefix + folder.name
      result.push({ value: folder.id, label })
      if (folder.children && folder.children.length > 0) {
        result.push(...flattenFolders(folder.children, label + ' / '))
      }
    })
    return result
  }
  
  const folderOptions = [
    { value: '', label: 'No folder (Root)' },
    ...flattenFolders(folders),
  ]
  
  // Update selectedFolderId when note changes
  useEffect(() => {
    setSelectedFolderId(note?.folderId || initialFolderId || null)
  }, [note?.id, note?.folderId, initialFolderId])
  
  const editor = useCreateBlockNote(
    {
      initialContent: note?.content ? JSON.parse(note.content) : undefined,
      schema: schema,
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    },
    [note?.id],
  )

  const saveDebounced = useDebouncedCallback(
    () => {
      const newData: NoteData = {
        title: titleRef.current?.textContent?.trim(),
        content: JSON.stringify(editor.document),
        folderId: selectedFolderId,
      }
      if (newData.title && newData.title !== note?.title) {
        newData.title = newData.title.length > 0 ? newData.title : null
      } else {
        newData.title = undefined
      }
      if (newData.content === note?.content) {
        newData.content = undefined
      }
      if (newData.folderId === note?.folderId) {
        newData.folderId = undefined
      }

      onSave(newData, note?.id)
    },
    {
      delay: autoSaveDelay,
      flushOnUnmount: true,
    },
  )

  const saveImmediately = () => {
    saveDebounced.flush()
  }

  const isMobile = useMediaQuery("(max-width: 50em)")

  useEffect(() => {
    return () => {
      saveImmediately()
    }
  }, [note?.id])

  const saveHotkey: HotkeyItem = ["mod+S", saveImmediately]
  useHotkeys([saveHotkey])

  useEffect(() => {
    window.addEventListener("beforeunload", saveImmediately)
    return () => {
      window.removeEventListener("beforeunload", saveImmediately)
    }
  }, [])

  const moveToContentEditor = () => {
    editor.setTextCursorPosition(editor.document[0].id, "end")
    editor.focus()
  }

  const moveToTitleInputFromTopContentEditor = () => {
    const textCursorPosition = editor.getTextCursorPosition()
    const firstBlock = editor.document[0]
    if (textCursorPosition.block.id !== firstBlock.id) {
      return
    }

    const titleElement = titleRef.current
    if (titleElement) {
      setTimeout(() => {
        titleElement.focus()
        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(titleElement)
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }, 0) // Ensure the focus happens after the render cycle
    }
  }

  const handleClose = () => {
    saveImmediately()
    onClose()
  }

  const handleTitleKeyDown = getHotkeyHandler([
    saveHotkey,
    ["ArrowDown", moveToContentEditor],
    ["Enter", moveToContentEditor], // todo move text after cursor to next line
    ["mod+Enter", moveToContentEditor], // todo create new blank line in the editor
  ])
  const handleContentEditorKeyDown = getHotkeyHandler([
    saveHotkey,
    [
      "ArrowUp",
      moveToTitleInputFromTopContentEditor,
      {
        preventDefault: false,
      },
    ],
  ])

  const focusContentEditorEnd = () => {
    editor.setTextCursorPosition(editor.document[editor.document.length - 1].id, "end")
    editor.focus()
  }

  const modalProps: Partial<ModalProps> = isMobile
    ? {
        fullScreen: true,
        transitionProps: { transition: "slide-up" },
      }
    : {
        size,
        centered: true,
      }

  return (
    <Modal.Root opened={opened} onClose={handleClose} {...modalProps}>
      <Modal.Overlay />
      <Modal.Content className={classes.content}>
        <Modal.Header className={classes.header}>
          <Group w="100%" align="flex-start" gap="md">
            <Modal.Title
              ref={titleRef}
              title="Note Title"
              className={classes.editableTitle}
              contentEditable
              suppressContentEditableWarning
              onBlur={saveDebounced}
              onInput={() => {
                const titleText = titleRef.current?.textContent
                if (titleText?.length === 0) {
                  titleRef.current!.textContent = null
                }
                saveDebounced()
              }}
              onKeyDown={handleTitleKeyDown}
              data-placeholder="Untitled Note"
              role="textbox"
              style={{ flex: 1 }}
            >
              {note?.title}
            </Modal.Title>
            <Select
              data={folderOptions}
              value={selectedFolderId || ''}
              onChange={(value) => {
                setSelectedFolderId(value || null)
                saveDebounced()
              }}
              placeholder="Select folder"
              clearable
              size="sm"
              style={{ minWidth: 200 }}
            />
          </Group>
        </Modal.Header>
        <Modal.Body className={classes.body}>
          <Flex direction="column" gap="md" style={{ height: "100%" }}>
            <BlockNoteView
              editor={editor}
              onChange={saveDebounced}
              formattingToolbar={false}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={handleContentEditorKeyDown}
              renderEditor={false}
            >
              {!isMobile && <FormattingToolbarController />}
              {isMobile && <ExperimentalMobileFormattingToolbarController />}
              <BlockNoteViewEditor data-autofocus />
            </BlockNoteView>
            <Box flex={1} onClick={focusContentEditorEnd} />
          </Flex>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
