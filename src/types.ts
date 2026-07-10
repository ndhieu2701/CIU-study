export type ResourceType = 'youtube' | 'pdf' | 'image' | 'external'

export type Resource = {
  url: string
  title: string
  type: ResourceType
}

export type TocItem = {
  id: string
  title: string
  level: number
}

export type Section = {
  id: string
  canonicalId: string
  aliases: string[]
  title: string
  level: number
  content: string
  resources: Resource[]
}

export type LanguageContent = {
  code: string
  label: string
  flag?: string
  countryCode?: string
  flagUrl?: string
  displayLabel?: string
  nativeLabel?: string
  path: string
  toc: TocItem[]
  sections: Section[]
}

export type ContentData = {
  source: {
    githubUrl: string
    syncedAt: string
  }
  languages: LanguageContent[]
  cheatSheets: Resource[]
}
