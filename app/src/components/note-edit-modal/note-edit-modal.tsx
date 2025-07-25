import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"
import "./blocknote-styles.css"

import { schema } from "@/lib/blocknote/schema.ts"
import { mutations, queries } from "@/lib/queries"
import { BlockNoteView } from "@blocknote/mantine"
import {
  BlockNoteViewEditor,
  ExperimentalMobileFormattingToolbarController,
  FormattingToolbarController,
  SideMenuController,
  useCreateBlockNote,
} from "@blocknote/react"
import { ActionIcon, Flex, Group, Modal, type ModalProps, ScrollArea, Select } from "@mantine/core"
import { getHotkeyHandler, type HotkeyItem, useDebouncedCallback, useHotkeys, useMediaQuery } from "@mantine/hooks"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import classes from "./note-edit-modal.module.css"
import { noteEditModal } from "@/lib/stores"
import { useStore } from "@tanstack/react-store"
import { notifications } from "@mantine/notifications"
import type { Note } from "@/lib/models"
import { IconArrowLeft } from "@tabler/icons-react"

export function NoteEditModal() {
  const { opened, initialNote, initialFolderId, editingNoteId } = useStore(noteEditModal.store)
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
      noteEditModal.updateEditingNoteId(created.id)
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
      noteEditModal.updateEditingNoteId(updated.id)
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
      schema,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingNoteId])

  const saveHotkey: HotkeyItem = ["mod+S", saveImmediately]
  useHotkeys([saveHotkey])

  useEffect(() => {
    window.addEventListener("beforeunload", saveImmediately)
    return () => {
      window.removeEventListener("beforeunload", saveImmediately)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    noteEditModal.close()
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

  const NoteTitle = () => (
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
  )

  return (
    <Modal.Root opened={opened} onClose={handleClose} {...modalProps} classNames={classes}>
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Flex w="100%" gap="md" direction={isMobile ? "column" : "row"}>
            {isMobile && (
              <ActionIcon
                variant="subtle"
                onClick={handleClose}
                title="Close note editor"
                aria-label="Close note editor"
              >
                <IconArrowLeft style={{ width: "70%", height: "70%" }} strokeWidth={1.5} />
              </ActionIcon>
            )}
            <NoteTitle />
          </Flex>
        </Modal.Header>
        <Modal.Body component={ScrollArea}>
          <BlockNoteView
            editor={editor}
            onChange={saveDebounced}
            formattingToolbar={false}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={handleContentEditorKeyDown}
            renderEditor={false}
            sideMenu={false}
            data-note-content
          >
            {!isMobile && (
              <>
                <SideMenuController />
                <FormattingToolbarController />
              </>
            )}
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
            placeholder={!folders.length ? "No folders available" : "Select folder"}
            clearable
            size="sm"
            miw={200}
            disabled={!folders.length}
          />
        </Group>
      </Modal.Content>
    </Modal.Root>
  )
}
