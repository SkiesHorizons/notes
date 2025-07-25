import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { schema } from "@/lib/blocknote/schema.ts"
import { mutations, queries } from "@/lib/queries"
import { BlockNoteView } from "@blocknote/mantine"
import {
  BlockNoteViewEditor,
  ExperimentalMobileFormattingToolbarController,
  FormattingToolbarController,
  useCreateBlockNote,
} from "@blocknote/react"
import { Group, Modal, type ModalProps, ScrollArea, Select } from "@mantine/core"
import { getHotkeyHandler, type HotkeyItem, useDebouncedCallback, useHotkeys, useMediaQuery } from "@mantine/hooks"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import classes from "./note-editor-modal.module.css"
import { noteEditorModal } from "@/lib/stores"
import { useStore } from "@tanstack/react-store"
import { notifications } from "@mantine/notifications"
import type { Note } from "@/lib/models"

export function NoteEditorModal() {
  const { opened, initialNote, initialFolderId, editingNoteId } = useStore(noteEditorModal.store)
  const titleRef = useRef<HTMLDivElement>(null)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialNote?.folderId || null)
  const folderSelectRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSelectedFolderId(initialNote?.folderId || initialFolderId || null)
  }, [setSelectedFolderId, initialNote, initialFolderId])

  const queryClient = useQueryClient()

  const { mutate: createNote } = useMutation({
    ...mutations.notes.create(),
    onSuccess: async (created) => {
      noteEditorModal.updateEditingNoteId(created.id)
      await queryClient.invalidateQueries({
        queryKey: queries.notes.list().queryKey,
      })
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error creating note",
        message: error.message || "An error occurred while creating the note.",
      })
    },
  })

  const { mutate: patchNote } = useMutation({
    ...mutations.notes.patch(),
    onSuccess: async (updated) => {
      noteEditorModal.updateEditingNoteId(updated.id)
      await queryClient.setQueryData(queries.notes.list().queryKey, (old: Note[]) =>
        old.map((note) => (note.id === updated.id ? updated : note)),
      )
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Error updating note",
        message: error.message || "An error occurred while updating the note.",
      })
    },
  })

  const { data: folders = [] } = useQuery(queries.folders.list())
  const folderOptions = useMemo(() => {
    return folders.map((folder) => ({
      value: folder.id,
      label: folder.name,
    }))
  }, [folders])

  const editor = useCreateBlockNote(
    {
      initialContent: initialNote?.content ? JSON.parse(initialNote.content) : undefined,
      schema: schema,
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    },
    [initialNote],
  )

  const saveDebounced = useDebouncedCallback(
    () => {
      let title: string | null | undefined = titleRef.current?.textContent
      let content: string | undefined = JSON.stringify(editor.document)
      let folderId: string | null | undefined = selectedFolderId

      if (title === initialNote?.title) {
        title = undefined
      }
      if (content === initialNote?.content) {
        content = undefined
      }
      if (folderId === initialNote?.folderId) {
        folderId = undefined
      }
      if (title === undefined && content === undefined && folderId === undefined) {
        return
      }

      if (editingNoteId) {
        patchNote({
          noteId: editingNoteId,
          data: {
            title,
            content,
            folderId,
          },
        })
        return
      }

      if (!content) {
        return
      }
      createNote({
        title,
        content,
        folderId,
      })
    },
    {
      delay: 2000,
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
  }, [editingNoteId])

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
    noteEditorModal.close()
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

  const modalProps: Partial<ModalProps> = isMobile
    ? {
        fullScreen: true,
        transitionProps: { transition: "slide-up" },
      }
    : {
        size: "lg",
        centered: true,
      }

  return (
    <Modal.Root opened={opened} onClose={handleClose} {...modalProps} classNames={classes}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
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
              {initialNote?.title}
            </Modal.Title>
          </Group>
        </Modal.Header>
        <Modal.Body component={ScrollArea}>
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
        </Modal.Body>
        {/* Modal footer */}
        <Group component="footer" p="md" pt={0} pos="sticky" left={0} bottom={0}>
          <Select
            ref={folderSelectRef}
            searchable
            data={folderOptions}
            value={selectedFolderId}
            onChange={(value) => {
              setSelectedFolderId(value)
              saveDebounced()
            }}
            placeholder="Select folder"
            clearable
            size="sm"
            style={{ minWidth: 200 }}
          />
        </Group>
      </Modal.Content>
    </Modal.Root>
  )
}
