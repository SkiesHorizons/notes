import { BlockNoteEditor, BlockNoteSchema, type PartialBlock } from "@blocknote/core"

export const schema = BlockNoteSchema.create()

const editorForHTMLRendering = BlockNoteEditor.create({
  schema,
})

export async function renderHtml(blocks: PartialBlock[]): Promise<string> {
  return editorForHTMLRendering.blocksToFullHTML(blocks)
}
