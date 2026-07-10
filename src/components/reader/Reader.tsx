import { memo } from 'react'
import type { LanguageContent, Resource, Section } from '../../types'
import { ResourcePreview } from '../media/ResourcePreview'
import { MarkdownLite } from './MarkdownLite'

type ReaderProps = {
  activeSectionId: string
  activeLanguage: LanguageContent
  section: Section | null
  cheatSheets: Resource[]
  cheatSheetsLabel: string
  anchorMap: Map<string, string>
  onOpenSection: (id: string) => void
}

function stripDuplicateFirstHeading(markdown: string, title: string) {
  const lines = markdown.split(/\r?\n/)
  const firstContentIndex = lines.findIndex((line) => line.trim())
  if (firstContentIndex < 0) return markdown

  const firstLine = lines[firstContentIndex]
  const heading = firstLine.match(/^(?:\s*-\s+)?#{1,6}\s+(.+)$/)
  if (!heading) return markdown

  const headingTitle = heading[1]
    .replace(/#+$/, '')
    .replace(/[*_`]/g, '')
    .trim()
  if (headingTitle !== title.trim()) return markdown

  return [
    ...lines.slice(0, firstContentIndex),
    ...lines.slice(firstContentIndex + 1),
  ]
    .join('\n')
    .trimStart()
}

function ReaderComponent({
  activeSectionId,
  activeLanguage,
  section,
  cheatSheets,
  cheatSheetsLabel,
  anchorMap,
  onOpenSection,
}: ReaderProps) {
  const visibleMarkdown = section
    ? stripDuplicateFirstHeading(section.content, section.title)
    : ''

  if (activeSectionId === 'cheat-sheets') {
    return (
      <main className="reader">
        <div className="section-heading">
          <p className="eyebrow">Extra resources</p>
          <h2>{cheatSheetsLabel}</h2>
        </div>
        <div className="resource-list">
          {cheatSheets.map((resource) => (
            <ResourcePreview key={resource.url} resource={resource} />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="reader">
      {section && (
        <>
          <div className="section-heading">
            <p className="eyebrow">{activeLanguage.label}</p>
            <h2>{section.title}</h2>
          </div>
          <MarkdownLite
            markdown={visibleMarkdown}
            anchorMap={anchorMap}
            onAnchorClick={onOpenSection}
          />
        </>
      )}
    </main>
  )
}

export const Reader = memo(ReaderComponent)
