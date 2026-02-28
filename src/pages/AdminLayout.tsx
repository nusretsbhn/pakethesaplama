import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Admin.css'

const tabs = [
  { to: '/admin', end: true, label: 'Otel Girişi' },
  { to: '/admin/aktivite', label: 'Aktivite Girişi' },
  { to: '/admin/otel-fiyat', label: 'Otel Fiyat Girişi' },
  { to: '/admin/aktivite-fiyat', label: 'Aktivite Fiyat Girişi' },
  { to: '/admin/yan-hizmet', label: 'Yan Hizmet Girişi' },
  { to: '/admin/ayarlar', label: 'Ayarlar' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Tur Paket — Admin</h1>
        <button type="button" className="logout" onClick={handleLogout}>
          Çıkış
        </button>
      </header>
      <nav className="admin-tabs">
        {tabs.map(({ to, end, label }) => (
          <NavLink key={to} to={to} end={end ?? false} className={({ isActive }) => (isActive ? 'active' : '')}>
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
