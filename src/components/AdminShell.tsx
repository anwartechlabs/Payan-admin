import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Bell,
  Bike,
  ChevronRight,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { AdminSession, AdminView } from '../domain/admin'
import { getInitials } from '../domain/formatters'
import { getRoleLabel, hasPermission } from '../domain/permissions'

interface AdminShellProps {
  session: AdminSession
  activeView: AdminView
  pendingReviewCount: number
  searchQuery: string
  children: ReactNode
  onNavigate: (view: AdminView) => void
  onSearchChange: (query: string) => void
  onSignOut: () => void
}

const navigationItems: Array<{
  view: AdminView
  label: string
  icon: typeof LayoutDashboard
  permission: 'dashboard:view' | 'riders:review' | 'rides:monitor'
}> = [
  { view: 'overview', label: 'Overview', icon: LayoutDashboard, permission: 'dashboard:view' },
  { view: 'verification', label: 'Rider verification', icon: FileCheck2, permission: 'riders:review' },
  { view: 'rides', label: 'Live rides', icon: MapPinned, permission: 'rides:monitor' },
]

export function AdminShell({
  session,
  activeView,
  pendingReviewCount,
  searchQuery,
  children,
  onNavigate,
  onSearchChange,
  onSignOut,
}: AdminShellProps) {
  const [areNotificationsOpen, setAreNotificationsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  function navigate(view: AdminView) {
    onNavigate(view)
    onSearchChange('')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark" aria-label="Payan administration">
          <span className="brand-symbol">P</span>
          <span className="brand-name">PAYAN</span>
        </div>
        <nav aria-label="Primary navigation">
          <p className="nav-label">WORKSPACE</p>
          {navigationItems.map((item) => {
            const Icon = item.icon
            if (!hasPermission(session.role, item.permission)) {
              return null
            }

            return (
              <button
                className={`nav-item ${activeView === item.view ? 'nav-item-active' : ''}`}
                type="button"
                key={item.view}
                onClick={() => navigate(item.view)}
                aria-current={activeView === item.view ? 'page' : undefined}
              >
                <Icon size={19} aria-hidden="true" />
                <span className="nav-item-label">{item.label}</span>
                {item.view === 'verification' && pendingReviewCount > 0 ? (
                  <span className="nav-count">{pendingReviewCount}</span>
                ) : null}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-summary">
          <Bike size={18} aria-hidden="true" />
          <span><strong>47 riders</strong> currently online</span>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">{getInitials(session.displayName)}</div>
          <div>
            <strong>{session.displayName}</strong>
            <span>{getRoleLabel(session.role)}</span>
          </div>
          <button className="sidebar-signout" type="button" onClick={onSignOut} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <label className="search-box" htmlFor="global-search">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="global-search"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={activeView === 'rides' ? 'Search rides or passengers' : 'Search riders, rides, or users'}
            />
            {searchQuery ? (
              <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search">
                <X size={16} />
              </button>
            ) : <kbd>Ctrl K</kbd>}
          </label>
          <div className="topbar-actions">
            <span className="live-status"><span /> Systems operational</span>
            <div className="notification-wrap">
              <button
                className="icon-button"
                type="button"
                aria-label="Notifications"
                aria-expanded={areNotificationsOpen}
                onClick={() => setAreNotificationsOpen((isOpen) => !isOpen)}
              >
                <Bell size={20} />
                <span className="notification-dot" />
              </button>
              {areNotificationsOpen ? (
                <div className="notification-popover">
                  <div className="notification-heading">
                    <strong>Notifications</strong>
                    <button type="button" aria-label="Close notifications" onClick={() => setAreNotificationsOpen(false)}><X size={17} /></button>
                  </div>
                  <div className="notification-item">
                    <span className="notification-icon"><FileCheck2 size={17} /></span>
                    <span><strong>{pendingReviewCount} applications waiting</strong><small>Verification queue</small></span>
                    <ChevronRight size={16} />
                  </div>
                  <div className="notification-item">
                    <span className="notification-icon"><ShieldCheck size={17} /></span>
                    <span><strong>All services operational</strong><small>Updated just now</small></span>
                  </div>
                </div>
              ) : null}
            </div>
            <button className="mobile-signout" type="button" onClick={onSignOut} aria-label="Sign out">
              <LogOut size={19} />
            </button>
          </div>
        </header>
        {children}
      </main>
    </div>
  )
}
