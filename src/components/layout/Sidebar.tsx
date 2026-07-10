import { ChevronRight } from 'lucide-react'
import { memo, useMemo } from 'react'
import type { TocItem } from '../../types'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible'

type TocNode = TocItem & {
  children: TocNode[]
}

type SidebarProps = {
  toc: TocItem[]
  activeSectionId: string
  activeCanonicalId?: string
  cheatSheetsLabel: string
  collapsedMenuIds: Set<string>
  onOpenSection: (id: string) => void
  onToggleMenuItem: (id: string) => void
}

function buildTocTree(items: TocItem[]) {
  const root: TocNode[] = []
  const stack: TocNode[] = []

  for (const item of items) {
    const node: TocNode = { ...item, children: [] }

    while (stack.length && stack[stack.length - 1].level >= item.level) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    if (parent) {
      parent.children.push(node)
    } else {
      root.push(node)
    }

    stack.push(node)
  }

  return root
}

type TocTreeItemProps = {
  item: TocNode
  activeCanonicalId?: string
  collapsedMenuIds: Set<string>
  onOpenSection: (id: string) => void
  onToggleMenuItem: (id: string) => void
}

const TocTreeItem = memo(function TocTreeItem({
  item,
  activeCanonicalId,
  collapsedMenuIds,
  onOpenSection,
  onToggleMenuItem,
}: TocTreeItemProps) {
  const hasChildren = item.children.length > 0
  const isOpen = !collapsedMenuIds.has(item.id)
  const isActive = item.id === activeCanonicalId

  if (!hasChildren) {
    return (
      <div className={isActive ? 'nav-row active' : 'nav-row'}>
        <span className="nav-caret-placeholder" />
        <button type="button" className="nav-item" onClick={() => onOpenSection(item.id)}>
          {item.title}
        </button>
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={() => onToggleMenuItem(item.id)}>
      <div className={isActive ? 'nav-row active' : 'nav-row'}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="nav-caret"
            aria-label={isOpen ? `Collapse ${item.title}` : `Expand ${item.title}`}
          >
            <ChevronRight className="nav-caret-icon" aria-hidden="true" />
          </button>
        </CollapsibleTrigger>
        <button type="button" className="nav-item" onClick={() => onOpenSection(item.id)}>
          {item.title}
        </button>
      </div>
      <CollapsibleContent className="nav-submenu">
        {item.children.map((child) => (
          <TocTreeItem
            key={child.id}
            item={child}
            activeCanonicalId={activeCanonicalId}
            collapsedMenuIds={collapsedMenuIds}
            onOpenSection={onOpenSection}
            onToggleMenuItem={onToggleMenuItem}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
})

function SidebarComponent({
  toc,
  activeSectionId,
  activeCanonicalId,
  cheatSheetsLabel,
  collapsedMenuIds,
  onOpenSection,
  onToggleMenuItem,
}: SidebarProps) {
  const tree = useMemo(() => buildTocTree(toc), [toc])

  return (
    <aside className="sidebar">
      <nav aria-label="README sections">
        {tree.map((item) => (
          <TocTreeItem
            key={item.id}
            item={item}
            activeCanonicalId={activeCanonicalId}
            collapsedMenuIds={collapsedMenuIds}
            onOpenSection={onOpenSection}
            onToggleMenuItem={onToggleMenuItem}
          />
        ))}
      </nav>
      <div className="sidebar-extra">
        <div className={activeSectionId === 'cheat-sheets' ? 'nav-row active' : 'nav-row'}>
          <span className="nav-caret-placeholder" />
          <button
            type="button"
            className="nav-item"
            onClick={() => onOpenSection('cheat-sheets')}
          >
            {cheatSheetsLabel}
          </button>
        </div>
      </div>
    </aside>
  )
}

export const Sidebar = memo(SidebarComponent)
