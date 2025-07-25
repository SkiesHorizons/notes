import { BlockNoteEditor, type PartialBlock } from "@blocknote/core"
import { schema } from "@/lib/blocknote/schema"

const editorForHtmlRendering = BlockNoteEditor.create({
  schema,
})

export async function renderHtml(blocks: PartialBlock[]): Promise<string> {
  return editorForHtmlRendering.blocksToFullHTML(blocks)
}
