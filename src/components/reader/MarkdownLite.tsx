import { createElement, memo, type ReactElement } from 'react'
import { ResourcePreview } from '../media/ResourcePreview'
import type { Resource, ResourceType } from '../../types'

type MarkdownLiteProps = {
  markdown: string
  anchorMap: Map<string, string>
  onAnchorClick: (id: string) => void
}

function classifyResource(url: string): ResourceType {
  const lower = url.toLowerCase()
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
  if (lower.endsWith('.pdf') || lower.includes('.pdf?')) return 'pdf'
  if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(lower)) return 'image'
  return 'external'
}

function getStandaloneResource(line: string): Resource | null {
  const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/)
  if (image) {
    return {
      title: image[1] || 'README image',
      url: image[2],
      type: 'image',
    }
  }

  const link = line.match(/^(?:[-*]\s+(?:\[[ x]\]\s+)?)?\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/i)
  if (link) {
    return {
      title: link[1],
      url: link[2],
      type: classifyResource(link[2]),
    }
  }

  const bare = line.match(/^(https?:\/\/\S+)$/)
  if (bare) {
    return {
      title: bare[1],
      url: bare[1],
      type: classifyResource(bare[1]),
    }
  }

  return null
}

function shouldEmbedResource(resource: Resource) {
  return (
    resource.type === 'youtube' ||
    resource.type === 'pdf' ||
    resource.type === 'image' ||
    resource.type === 'external'
  )
}

function renderInline(
  text: string,
  anchorMap: Map<string, string>,
  onAnchorClick: (id: string) => void,
) {
  const parts: Array<string | ReactElement> = []
  const pattern =
    /(!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))

    if (match[2] !== undefined && match[3]) {
      parts.push(
        <a
          key={`${match[3]}-${match.index}`}
          className="inline-image-link"
          href={match[3]}
          target="_blank"
          rel="noreferrer"
        >
          <img src={match[3]} alt={match[2] || 'README image'} loading="lazy" />
        </a>,
      )
    } else if (match[4] && match[5]) {
      const href = match[5]
      const isAnchor = href.startsWith('#')
      const anchorId = isAnchor ? href.slice(1) : ''
      const canonicalId = anchorMap.get(anchorId) ?? anchorId
      parts.push(
        <a
          key={`${href}-${match.index}`}
          href={isAnchor ? `#${canonicalId}` : href}
          target={isAnchor ? undefined : '_blank'}
          rel={isAnchor ? undefined : 'noreferrer'}
          onClick={
            isAnchor
              ? (event) => {
                  event.preventDefault()
                  onAnchorClick(canonicalId)
                }
              : undefined
          }
        >
          {match[4]}
        </a>,
      )
    } else if (match[6]) {
      parts.push(<code key={`${match[6]}-${match.index}`}>{match[6]}</code>)
    } else if (match[7]) {
      parts.push(<strong key={`${match[7]}-${match.index}`}>{match[7]}</strong>)
    }

    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

function MarkdownLiteComponent({
  markdown,
  anchorMap,
  onAnchorClick,
}: MarkdownLiteProps) {
  const lines = markdown.split(/\r?\n/)
  const blocks: ReactElement[] = []
  let listItems: string[] = []
  let codeLines: string[] = []
  let inCode = false

  const flushList = () => {
    if (!listItems.length) return
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>
            {renderInline(item, anchorMap, onAnchorClick)}
          </li>
        ))}
      </ul>,
    )
    listItems = []
  }

  const flushCode = () => {
    blocks.push(
      <pre key={`code-${blocks.length}`}>
        <code>{codeLines.join('\n')}</code>
      </pre>,
    )
    codeLines = []
  }

  const pushStandaloneResource = (resource: Resource) => {
    blocks.push(<ResourcePreview key={`${resource.url}-${blocks.length}`} resource={resource} />)
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()

    if (line.startsWith('```')) {
      if (inCode) {
        flushCode()
        inCode = false
      } else {
        flushList()
        inCode = true
      }
      continue
    }

    if (inCode) {
      codeLines.push(rawLine)
      continue
    }

    if (!line.trim()) {
      flushList()
      continue
    }

    const standaloneResource = getStandaloneResource(line.trim())
    if (standaloneResource && shouldEmbedResource(standaloneResource)) {
      flushList()
      pushStandaloneResource(standaloneResource)
      continue
    }

    const heading = line.match(/^(?:\s*-\s+)?(#{1,4})\s+(.+)$/)
    if (heading) {
      flushList()
      const level = Math.min(heading[1].length, 4)
      const title = heading[2].replace(/#+$/, '').trim()
      const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
      blocks.push(
        createElement(
          tag,
          { key: `heading-${blocks.length}` },
          renderInline(title, anchorMap, onAnchorClick),
        ),
      )
      continue
    }

    const list = line.match(/^\s*[-*]\s+(?:\[[ x]\]\s+)?(.+)$/i)
    if (list) {
      listItems.push(list[1])
      continue
    }

    const quote = line.match(/^>\s?(.*)$/)
    if (quote) {
      flushList()
      blocks.push(
        <blockquote key={`quote-${blocks.length}`}>
          {renderInline(quote[1], anchorMap, onAnchorClick)}
        </blockquote>,
      )
      continue
    }

    if (line === '---') {
      flushList()
      blocks.push(<hr key={`hr-${blocks.length}`} />)
      continue
    }

    flushList()
    blocks.push(
      <p key={`p-${blocks.length}`}>
        {renderInline(line.trim(), anchorMap, onAnchorClick)}
      </p>,
    )
  }

  flushList()
  if (inCode || codeLines.length) flushCode()

  return <div className="markdown">{blocks}</div>
}

export const MarkdownLite = memo(MarkdownLiteComponent)
