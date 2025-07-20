import "@blocknote/core/fonts/inter.css"
import "@blocknote/mantine/style.css"

import { type Note } from "@/lib/api"
import { getHotkeyHandler, type HotkeyItem, useDebouncedCallback, useHotkeys } from "@mantine/hooks"
import { useEffect, useRef, useState } from "react"
import { useCreateBlockNote } from "@blocknote/react"
import { schema } from "@/lib/blocknotejs.ts"
import { BlockNoteView } from "@blocknote/mantine"
import { Box, Flex, TextInput } from "@mantine/core"
import type { Block } from "@blocknote/core"
import classes from "./note-editor.module.css"

export type NoteData = {
  title?: string
  content?: string
}

interface NoteEditorProps {
  note?: Note
  onSave: (data: NoteData, noteId?: string) => void
  autoSaveDelay?: number
}

export function NoteEditor({ note, onSave, autoSaveDelay = 2000 }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title)

  useEffect(() => {
    setTitle(note?.title)
  }, [note?.id])

  const titleRef = useRef<HTMLInputElement>(null)

  const handleTitleSave = useDebouncedCallback(
    (title?: string) => {
      onSave({ title }, note?.id)
    },
    {
      delay: autoSaveDelay,
      flushOnUnmount: true,
    },
  )
  const handleContentSave = useDebouncedCallback(
    (document: Block[]) => {
      onSave({ content: JSON.stringify(document) }, note?.id)
    },
    {
      delay: autoSaveDelay,
      flushOnUnmount: true,
    },
  )

  const saveImmediately = () => {
    handleContentSave.flush()
    handleTitleSave.flush()
  }

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

    // todo fix cursor position not being set correctly
    const input = titleRef.current
    if (input) {
      const cursorEnd = input.value.length
      input.setSelectionRange(cursorEnd, cursorEnd)
      input.focus()
    }
  }

  return (
    <Flex direction="column" gap="md" style={{ height: "70vh" }}>
      <TextInput
        size="xl"
        className="bn-editor"
        classNames={{
          wrapper: classes.titleWrapper,
          input: classes.titleInput,
        }}
        ref={titleRef}
        value={title || ""}
        onChange={(e) => {
          setTitle(e.currentTarget.value)
          handleTitleSave(e.currentTarget.value)
        }}
        variant="unstyled"
        placeholder="Untitled Note"
        onKeyDown={getHotkeyHandler([
          saveHotkey,
          ["ArrowDown", moveToContentEditor],
          ["Enter", moveToContentEditor], // todo move text after cursor to next line
          ["mod+Enter", moveToContentEditor], // todo create new blank line in the editor
        ])}
      />
      <BlockNoteView
        editor={editor}
        onChange={(e) => handleContentSave(e.document)}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={getHotkeyHandler([
          saveHotkey,
          [
            "ArrowUp",
            moveToTitleInputFromTopContentEditor,
            {
              preventDefault: false,
            },
          ],
        ])}
      ></BlockNoteView>
      <Box
        flex={1}
        onClick={() => {
          editor.focus()
          editor.setTextCursorPosition(editor.document[editor.document.length - 1].id)
        }}
      />
    </Flex>
  )
}
