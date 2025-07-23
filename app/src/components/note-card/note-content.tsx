import type { Block } from "@blocknote/core"
import { Skeleton, Typography, type TypographyProps } from "@mantine/core"
import { useEffect, useMemo, useState } from "react"

interface NoteContentProps extends Omit<TypographyProps, "children"> {
  contentJson: string
  renderContent: (blocks: Block[]) => Promise<string>
}

export function NoteContent({ contentJson, renderContent, ...props }: NoteContentProps) {
  const content = useMemo(() => {
    return JSON.parse(contentJson)
  }, [contentJson])

  const [contentHtml, setContentHtml] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchContent = async () => {
      if (content.length === 0) {
        return
      }
      setIsLoading(true)
      try {
        const html = await renderContent(content)
        if (!cancelled) {
          setContentHtml(html)
        }
      } catch {
        if (!cancelled) {
          setContentHtml("<p style='color: var(--mantine-color-error);'>Failed to render content</p>")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }
    fetchContent()
    return () => {
      cancelled = true
    }
  }, [content, renderContent])

  if (isLoading) {
    return <Skeleton height={64} width="100%" />
  }

  return (
    <Typography {...props}>
      <div dangerouslySetInnerHTML={{ __html: contentHtml ?? "" }} />
    </Typography>
  )
}
