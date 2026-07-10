import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, PanelLeftOpen } from 'lucide-react'
import './App.css'
import { cheatSheetLabels } from './constants'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { Reader } from './components/reader/Reader'
import {
  createAnchorMap,
  createFirstChildMap,
  createSectionByCanonicalId,
  getInitialHash,
  sectionHasOnlyHeading,
} from './lib/navigation'
import type { ContentData } from './types'

const LANGUAGE_STORAGE_KEY = 'ciu-study-hub-language'

function getInitialLanguageCode() {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en'
}

function App() {
  const [content, setContent] = useState<ContentData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [languageCode, setLanguageCode] = useState(getInitialLanguageCode)
  const [activeSectionId, setActiveSectionId] = useState(getInitialHash())
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [collapsedMenuIds, setCollapsedMenuIds] = useState<Set<string>>(
    () => new Set(),
  )

  useEffect(() => {
    let cancelled = false

    fetch('/data/ciu-content.json')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<ContentData>
      })
      .then((payload) => {
        if (cancelled) return
        setContent(payload)

        const firstLanguage = payload.languages[0]
        setLanguageCode((current) => {
          if (payload.languages.some((language) => language.code === current)) {
            return current
          }
          localStorage.setItem(LANGUAGE_STORAGE_KEY, firstLanguage.code)
          return firstLanguage.code
        })
        setActiveSectionId(
          (current) =>
            current ||
            firstLanguage.toc[0]?.id ||
            firstLanguage.sections[0]?.canonicalId ||
            '',
        )
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load data')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const activeLanguage =
    content?.languages.find((language) => language.code === languageCode) ??
    content?.languages[0] ??
    null

  const sectionByCanonicalId = useMemo(
    () => createSectionByCanonicalId(activeLanguage),
    [activeLanguage],
  )
  const anchorMap = useMemo(() => createAnchorMap(activeLanguage), [activeLanguage])
  const firstChildByTocId = useMemo(
    () => createFirstChildMap(activeLanguage),
    [activeLanguage],
  )

  const section = useMemo(() => {
    if (!activeLanguage) return null

    const canonicalId = anchorMap.get(activeSectionId) ?? activeSectionId
    return (
      sectionByCanonicalId.get(canonicalId) ??
      sectionByCanonicalId.get(activeLanguage.toc[0]?.id) ??
      activeLanguage.sections[0]
    )
  }, [activeLanguage, activeSectionId, anchorMap, sectionByCanonicalId])

  useEffect(() => {
    if (!activeLanguage) return

    const hash = getInitialHash()
    const canonicalHash = anchorMap.get(hash) ?? hash
    const hashExists =
      canonicalHash === 'cheat-sheets' ||
      activeLanguage.sections.some((item) => item.canonicalId === canonicalHash) ||
      activeLanguage.toc.some((item) => item.id === canonicalHash)
    const nextId =
      hash && hashExists
        ? canonicalHash
        : activeLanguage.toc[0]?.id || activeLanguage.sections[0]?.canonicalId || ''

    setActiveSectionId(nextId)
  }, [activeLanguage, anchorMap])

  const openSection = useCallback(
    (id: string) => {
      const canonicalId = anchorMap.get(id) ?? id
      const targetSection = sectionByCanonicalId.get(canonicalId)
      const childId = firstChildByTocId.get(canonicalId)
      const targetId =
        childId && sectionHasOnlyHeading(targetSection) ? childId : canonicalId

      setActiveSectionId(targetId)
      window.history.replaceState(null, '', `#${targetId}`)
    },
    [anchorMap, firstChildByTocId, sectionByCanonicalId],
  )

  const toggleMenuItem = useCallback((id: string) => {
    setCollapsedMenuIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((value) => !value)
  }, [])

  const changeLanguage = useCallback((code: string) => {
    setLanguageCode(code)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
  }, [])

  if (loadError) {
    return (
      <main className="state-page">
        <p className="eyebrow">Load error</p>
        <h1>Could not load CIU content</h1>
        <p>{loadError}</p>
      </main>
    )
  }

  if (!content || !activeLanguage) {
    return (
      <main className="state-page">
        <p className="eyebrow">Loading</p>
        <h1>Preparing study content</h1>
      </main>
    )
  }

  const cheatSheetsLabel = cheatSheetLabels[activeLanguage.code] ?? 'Cheat Sheets'

  return (
    <div className="app-shell">
      <Topbar
        languages={content.languages}
        languageCode={languageCode}
        githubUrl={content.source.githubUrl}
        onLanguageChange={changeLanguage}
      />

      <div className={isSidebarOpen ? 'workspace' : 'workspace sidebar-collapsed'}>
        <button
          type="button"
          className={isSidebarOpen ? 'sidebar-edge-toggle' : 'sidebar-edge-toggle closed'}
          aria-label={isSidebarOpen ? 'Hide menu' : 'Show menu'}
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? (
            <ChevronLeft aria-hidden="true" />
          ) : (
            <PanelLeftOpen aria-hidden="true" />
          )}
        </button>
        {isSidebarOpen ? (
          <Sidebar
            toc={activeLanguage.toc}
            activeSectionId={activeSectionId}
            activeCanonicalId={section?.canonicalId}
            cheatSheetsLabel={cheatSheetsLabel}
            collapsedMenuIds={collapsedMenuIds}
            onOpenSection={openSection}
            onToggleMenuItem={toggleMenuItem}
          />
        ) : (
          <aside className="sidebar-rail" aria-hidden="true" />
        )}

        <Reader
          activeSectionId={activeSectionId}
          activeLanguage={activeLanguage}
          section={section}
          cheatSheets={content.cheatSheets}
          cheatSheetsLabel={cheatSheetsLabel}
          anchorMap={anchorMap}
          onOpenSection={openSection}
        />
      </div>

      <footer className="footer">
        Synced {new Date(content.source.syncedAt).toLocaleString()}
      </footer>
    </div>
  )
}

export default App
