import type { LanguageContent, Section } from '../types'

export function getInitialHash() {
  return window.location.hash.replace(/^#/, '')
}

export function createSectionByCanonicalId(language: LanguageContent | null) {
  const map = new Map<string, Section>()

  for (const item of language?.sections ?? []) {
    if (!map.has(item.canonicalId)) map.set(item.canonicalId, item)
  }

  return map
}

export function createAnchorMap(language: LanguageContent | null) {
  const map = new Map<string, string>()

  for (const item of language?.sections ?? []) {
    map.set(item.id, item.canonicalId)
    map.set(item.canonicalId, item.canonicalId)
    for (const alias of item.aliases ?? []) {
      map.set(alias, item.canonicalId)
    }
  }

  map.set('cheat-sheets', 'cheat-sheets')
  return map
}

export function createFirstChildMap(language: LanguageContent | null) {
  const map = new Map<string, string>()
  const toc = language?.toc ?? []

  toc.forEach((item, index) => {
    const next = toc[index + 1]
    if (next && next.level > item.level) map.set(item.id, next.id)
  })

  return map
}

export function sectionHasOnlyHeading(section: Section | undefined) {
  const textOnlyContent = section?.content
    .replace(/^(?:\s*-\s+)?#{1,6}\s+.+$/gm, '')
    .trim()

  return !textOnlyContent
}
