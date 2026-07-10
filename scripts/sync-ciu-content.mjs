import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OWNER = 'jwasham'
const REPO = 'coding-interview-university'
const BRANCH = 'main'
const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/`
const API_TREE = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`
const OUTPUT_FILE = path.resolve('public/data/ciu-content.json')

const languageNameByPath = {
  'translations/README-af.md': 'Afrikaans',
  'translations/README-ar.md': 'Arabic',
  'translations/README-bg.md': 'Bulgarian',
  'translations/README-bn.md': 'Bangla',
  'translations/README-cn.md': 'Chinese Simplified',
  'translations/README-de.md': 'German',
  'translations/README-el.md': 'Greek',
  'translations/README-es.md': 'Spanish',
  'translations/README-fa.md': 'Persian',
  'translations/README-fr.md': 'French',
  'translations/README-he.md': 'Hebrew',
  'translations/README-hi.md': 'Hindi',
  'translations/README-id.md': 'Bahasa Indonesia',
  'translations/README-it.md': 'Italian',
  'translations/README-ja.md': 'Japanese',
  'translations/README-kh.md': 'Khmer',
  'translations/README-kk.md': 'Kazakh',
  'translations/README-ko.md': 'Korean',
  'translations/README-mr.md': 'Marathi',
  'translations/README-nl.md': 'Dutch',
  'translations/README-pl.md': 'Polish',
  'translations/README-ptbr.md': 'Portuguese Brazilian',
  'translations/README-ru.md': 'Russian',
  'translations/README-th.md': 'Thai',
  'translations/README-tr.md': 'Turkish',
  'translations/README-tw.md': 'Chinese Traditional',
  'translations/README-uk.md': 'Ukrainian',
  'translations/README-ur.md': 'Urdu',
  'translations/README-uz.md': 'Uzbek',
  'translations/README-vi.md': 'Vietnamese',
}

const languageMetadataByCode = {
  en: { flag: '🇺🇸', countryCode: 'us', nativeLabel: 'English' },
  af: { flag: '🇿🇦', countryCode: 'za', nativeLabel: 'Afrikaans' },
  ar: { flag: '🇸🇦', countryCode: 'sa', nativeLabel: 'العربية' },
  bg: { flag: '🇧🇬', countryCode: 'bg', nativeLabel: 'Български' },
  bn: { flag: '🇧🇩', countryCode: 'bd', nativeLabel: 'বাংলা' },
  cn: { flag: '🇨🇳', countryCode: 'cn', nativeLabel: '简体中文' },
  de: { flag: '🇩🇪', countryCode: 'de', nativeLabel: 'Deutsch' },
  el: { flag: '🇬🇷', countryCode: 'gr', nativeLabel: 'Ελληνικά' },
  es: { flag: '🇪🇸', countryCode: 'es', nativeLabel: 'Español' },
  fa: { flag: '🇮🇷', countryCode: 'ir', nativeLabel: 'فارسی' },
  fr: { flag: '🇫🇷', countryCode: 'fr', nativeLabel: 'Français' },
  he: { flag: '🇮🇱', countryCode: 'il', nativeLabel: 'עברית' },
  hi: { flag: '🇮🇳', countryCode: 'in', nativeLabel: 'हिन्दी' },
  id: { flag: '🇮🇩', countryCode: 'id', nativeLabel: 'Bahasa Indonesia' },
  it: { flag: '🇮🇹', countryCode: 'it', nativeLabel: 'Italiano' },
  ja: { flag: '🇯🇵', countryCode: 'jp', nativeLabel: '日本語' },
  kh: { flag: '🇰🇭', countryCode: 'kh', nativeLabel: 'ខ្មែរ' },
  kk: { flag: '🇰🇿', countryCode: 'kz', nativeLabel: 'Қазақша' },
  ko: { flag: '🇰🇷', countryCode: 'kr', nativeLabel: '한국어' },
  mr: { flag: '🇮🇳', countryCode: 'in', nativeLabel: 'मराठी' },
  nl: { flag: '🇳🇱', countryCode: 'nl', nativeLabel: 'Nederlands' },
  pl: { flag: '🇵🇱', countryCode: 'pl', nativeLabel: 'Polski' },
  ptbr: { flag: '🇧🇷', countryCode: 'br', nativeLabel: 'Português Brasileiro' },
  ru: { flag: '🇷🇺', countryCode: 'ru', nativeLabel: 'Русский' },
  th: { flag: '🇹🇭', countryCode: 'th', nativeLabel: 'ไทย' },
  tr: { flag: '🇹🇷', countryCode: 'tr', nativeLabel: 'Türkçe' },
  tw: { flag: '🇹🇼', countryCode: 'tw', nativeLabel: '繁體中文' },
  uk: { flag: '🇺🇦', countryCode: 'ua', nativeLabel: 'Українська' },
  ur: { flag: '🇵🇰', countryCode: 'pk', nativeLabel: 'اردو' },
  uz: { flag: '🇺🇿', countryCode: 'uz', nativeLabel: "O'zbek" },
  vi: { flag: '🇻🇳', countryCode: 'vn', nativeLabel: 'Tiếng Việt' },
}

function buildLanguageDisplay(code, label) {
  const metadata = languageMetadataByCode[code]
  const flag = metadata?.flag || '🌐'
  const nativeLabel = metadata?.nativeLabel
  const displayName = nativeLabel || label || code.toUpperCase()

  return {
    flag,
    ...(metadata?.countryCode
      ? {
          countryCode: metadata.countryCode,
          flagUrl: `https://flagcdn.com/24x18/${metadata.countryCode}.png`,
        }
      : {}),
    displayLabel: `${flag} ${displayName}`,
    ...(nativeLabel ? { nativeLabel } : {}),
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'react-study-ciu-sync' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'react-study-ciu-sync' },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }

  return response.json()
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[`*_()[\]#.]/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9\u00C0-\u024F\u0400-\u04FF\u4E00-\u9FFF]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

function stripMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#]/g, '')
    .trim()
}

function buildLanguagesFromTree(tree) {
  const translationFiles = tree.tree
    .filter(
      (entry) =>
        entry.type === 'blob' &&
        /^translations\/README-[a-z0-9-]+\.md$/i.test(entry.path),
    )
    .sort((a, b) => a.path.localeCompare(b.path))

  const languages = [
    {
      code: 'en',
      label: 'English',
      path: 'README.md',
      url: `${RAW_BASE}README.md`,
      ...buildLanguageDisplay('en', 'English'),
    },
  ]

  for (const entry of translationFiles) {
    const translationPath = entry.path
    const code = translationPath
      .replace('translations/README-', '')
      .replace('.md', '')

    languages.push({
      code,
      label: languageNameByPath[translationPath] || code,
      path: translationPath,
      url: `${RAW_BASE}${translationPath}`,
      ...buildLanguageDisplay(
        code,
        languageNameByPath[translationPath] || code.toUpperCase(),
      ),
    })
  }

  return languages
}

function extractToc(markdown) {
  const tocMatch = markdown.match(/## Table of Contents\s+([\s\S]*?)(?=\n##\s+)/i)
  const block = tocMatch?.[1] ?? ''
  return extractTocItems(block)
}

function extractTocItems(markdown) {
  const items = []

  for (const line of markdown.split('\n')) {
    const match = line.match(/^(\s*)-\s+\[([^\]]+)\]\(#([^)]+)\)/)
    if (!match) continue
    const [, indent, title, anchor] = match
    items.push({
      id: anchor,
      title: stripMarkdown(title),
      level: Math.floor(indent.length / 2),
    })
  }

  return items
}

function extractTocFromSections(sections) {
  let bestToc = []

  for (const section of sections.slice(0, 8)) {
    const toc = extractTocItems(section.content)
    if (toc.length > bestToc.length) bestToc = toc
  }

  return bestToc
}

function buildTocFromSections(sections) {
  return sections
    .filter((section) => section.id !== 'intro')
    .map((section) => ({
      id: section.canonicalId || section.id,
      title: section.title,
      level: Math.max(0, section.level - 2),
    }))
}

function applyCanonicalIds(sections, canonicalSections, localToc = [], canonicalToc = []) {
  if (!canonicalSections) {
    return sections.map((section) => ({
      ...section,
      canonicalId: section.id,
      aliases: [section.id],
    }))
  }

  const canonicalByIndex = canonicalSections.filter((section) => section.id !== 'intro')
  const canonicalByLocalAnchor = new Map()
  localToc.forEach((item, index) => {
    const canonical = canonicalToc[index]
    if (canonical) canonicalByLocalAnchor.set(item.id, canonical.id)
  })
  let cursor = 0

  return sections.map((section) => {
    if (section.id === 'intro') {
      return {
        ...section,
        canonicalId: 'intro',
        aliases: [section.id],
      }
    }

    const canonical = canonicalByIndex[cursor]
    cursor += 1

    return {
      ...section,
      canonicalId:
        canonicalByLocalAnchor.get(section.id) ||
        canonical?.canonicalId ||
        canonical?.id ||
        section.id,
      aliases: Array.from(new Set([section.id, canonical?.id].filter(Boolean))),
    }
  })
}

function buildCanonicalToc(languageSections, canonicalToc) {
  const sectionByCanonicalId = new Map()
  for (const section of languageSections) {
    if (!sectionByCanonicalId.has(section.canonicalId)) {
      sectionByCanonicalId.set(section.canonicalId, section)
    }
  }
  const seen = new Set()
  const items = []

  for (const item of canonicalToc) {
    const section = sectionByCanonicalId.get(item.id)
    if (!section || seen.has(item.id)) continue
    seen.add(item.id)
    items.push({
      id: item.id,
      title: section.title || item.title,
      level: item.level,
    })
  }

  return items.length > 0 ? items : buildTocFromSections(languageSections)
}

function extractSections(markdown) {
  const lines = markdown.split(/\r?\n/)
  const sections = []
  let current = {
    id: 'intro',
    title: 'Introduction',
    level: 1,
    content: [],
  }

  for (const line of lines) {
    const heading = line.match(/^(?:\s*-\s+)?(#{2,3})\s+(.+)$/)
    if (heading) {
      if (current.content.join('\n').trim()) sections.push(current)
      const title = stripMarkdown(heading[2])
      current = {
        id: slugify(title) || `section-${sections.length + 1}`,
        title,
        level: heading[1].length,
        content: [line],
      }
      continue
    }

    current.content.push(line)
  }

  if (current.content.join('\n').trim()) sections.push(current)

  return sections.map((section) => ({
    ...section,
    content: section.content.join('\n').trim(),
    resources: extractResources(section.content.join('\n')),
  }))
}

function extractResources(markdown) {
  const resources = []
  const seen = new Set()
  const add = (url, title) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    resources.push({
      url,
      title: stripMarkdown(title || url),
      type: classifyResource(url),
    })
  }

  for (const match of markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)) {
    add(match[2], match[1])
  }

  for (const match of markdown.matchAll(/(?<!\()https?:\/\/[^\s<>)]+/g)) {
    add(match[0], match[0])
  }

  return resources
}

function classifyResource(url) {
  const lower = url.toLowerCase()
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube'
  if (lower.endsWith('.pdf') || lower.includes('.pdf?')) return 'pdf'
  if (/\.(png|jpe?g|gif|webp|svg)(\?|#|$)/i.test(lower)) return 'image'
  return 'external'
}

async function buildLanguage(language, canonicalSections, canonicalToc) {
  const markdown = await fetchText(language.url)
  const extractedSections = extractSections(markdown)
  const localToc = extractToc(markdown)
  const inferredToc =
    localToc.length > 0 ? localToc : extractTocFromSections(extractedSections)
  const sections = applyCanonicalIds(
    extractedSections,
    canonicalSections,
    inferredToc,
    canonicalToc,
  )
  const toc =
    canonicalToc && canonicalToc.length > 0
      ? buildCanonicalToc(sections, canonicalToc)
      : inferredToc.length > 0
        ? inferredToc
        : buildTocFromSections(sections)

  return {
    ...language,
    markdown,
    toc: toc.length > 0 ? toc : buildTocFromSections(sections),
    sections,
  }
}

function buildCheatSheets(tree) {
  return tree.tree
    .filter(
      (entry) =>
        entry.type === 'blob' &&
        entry.path.startsWith('extras/cheat sheets/') &&
        entry.path.toLowerCase().endsWith('.pdf'),
    )
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((entry) => {
      const name = entry.path.split('/').pop()
      return {
        title: name.replace(/\.pdf$/i, ''),
        path: entry.path,
        url: `${RAW_BASE}${entry.path
          .split('/')
          .map((segment) => encodeURIComponent(segment))
          .join('/')}`,
        type: 'pdf',
      }
    })
}

async function main() {
  const tree = await fetchJson(API_TREE)
  const languageMeta = buildLanguagesFromTree(tree)
  const englishMeta = languageMeta.find((language) => language.code === 'en')
  const english = await buildLanguage(englishMeta)
  const canonicalSections = english.sections
  const canonicalToc = english.toc.filter((item) =>
    canonicalSections.some((section) => section.canonicalId === item.id),
  )
  const translatedLanguages = await Promise.all(
    languageMeta
      .filter((language) => language.code !== 'en')
      .map((language) => buildLanguage(language, canonicalSections, canonicalToc)),
  )
  const languages = [
    {
      ...english,
      toc: canonicalToc,
    },
    ...translatedLanguages,
  ]
  const cheatSheets = buildCheatSheets(tree)

  const payload = {
    source: {
      owner: OWNER,
      repo: REPO,
      branch: BRANCH,
      githubUrl: `https://github.com/${OWNER}/${REPO}`,
      rawBaseUrl: RAW_BASE,
      syncedAt: new Date().toISOString(),
    },
    languages,
    cheatSheets,
  }

  await mkdir(path.dirname(OUTPUT_FILE), { recursive: true })
  await writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`)
  console.log(
    `Synced ${languages.length} languages, ${cheatSheets.length} cheat sheets to ${OUTPUT_FILE}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
