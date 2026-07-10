import { memo, useEffect, useRef, useState } from 'react'
import type { LanguageContent } from '../../types'

type TopbarProps = {
  languages: LanguageContent[]
  languageCode: string
  githubUrl: string
  onLanguageChange: (code: string) => void
}

function TopbarComponent({
  languages,
  languageCode,
  githubUrl,
  onLanguageChange,
}: TopbarProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const activeLanguage =
    languages.find((language) => language.code === languageCode) ?? languages[0]

  useEffect(() => {
    if (!isLanguageOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [isLanguageOpen])

  const selectLanguage = (code: string) => {
    onLanguageChange(code)
    setIsLanguageOpen(false)
  }

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Coding Interview University</p>
        <h1>Study Hub</h1>
      </div>
      <div className="topbar-actions">
        <div className="language-picker" ref={dropdownRef}>
          <span>Language</span>
          <button
            type="button"
            className="language-trigger"
            aria-haspopup="listbox"
            aria-expanded={isLanguageOpen}
            onClick={() => setIsLanguageOpen((value) => !value)}
          >
            <LanguageFlag language={activeLanguage} />
            <span>{activeLanguage?.nativeLabel || activeLanguage?.label}</span>
          </button>
          {isLanguageOpen && (
            <div className="language-menu" role="listbox">
              {languages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  className={
                    language.code === languageCode
                      ? 'language-option active'
                      : 'language-option'
                  }
                  role="option"
                  aria-selected={language.code === languageCode}
                  onClick={() => selectLanguage(language.code)}
                >
                  <LanguageFlag language={language} />
                  <span>{language.nativeLabel || language.label}</span>
                  <small>{language.code.toUpperCase()}</small>
                </button>
              ))}
            </div>
          )}
        </div>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </header>
  )
}

function LanguageFlag({ language }: { language?: LanguageContent }) {
  if (language?.flagUrl) {
    return (
      <img
        className="language-flag"
        src={language.flagUrl}
        alt=""
        width="24"
        height="18"
        loading="lazy"
      />
    )
  }

  return <span className="language-flag-fallback">🌐</span>
}

export const Topbar = memo(TopbarComponent)

