import { NavLink, Outlet } from 'react-router-dom'
import { useBridgeSubscriptions } from '../hooks/useBridgeSubscriptions'
import './Layout.css'

const navItems = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/plugins', label: 'Plugins' },
  { to: '/rules', label: 'Rules' },
  { to: '/variables', label: 'Variables' },
  { to: '/events', label: 'Events' },
]

export const Layout = () => {
  useBridgeSubscriptions()

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1 className="app-title">Aidle</h1>
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
    </div>
  )
}

export default Layout
