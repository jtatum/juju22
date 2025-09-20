import { NavLink, Outlet } from 'react-router'
import { useBridgeSubscriptions } from '../hooks/useBridgeSubscriptions'
import { NotificationContainer } from './NotificationToast'
import { useNotificationStore } from '../stores/useNotificationStore'
import './Layout.css'

const navItems = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/plugins', label: 'Plugins' },
  { to: '/rules', label: 'Rules' },
  { to: '/variables', label: 'Variables' },
  { to: '/events', label: 'Events' },
  { to: '/settings', label: 'Settings' },
]

export const Layout = () => {
  useBridgeSubscriptions()
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1 className="app-title">Juju22</h1>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="version-hint">Automation Platform • Phase 5</p>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </div>
  )
}

export default Layout
