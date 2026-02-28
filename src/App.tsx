import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider, useDataStatus } from './context/DataProvider'
import UserFlow from './pages/UserFlow'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './pages/AdminLayout'
import OtelGiris from './pages/admin/OtelGiris'
import AktiviteGiris from './pages/admin/AktiviteGiris'
import OtelFiyatGiris from './pages/admin/OtelFiyatGiris'
import AktiviteFiyatGiris from './pages/admin/AktiviteFiyatGiris'
import YanHizmetGiris from './pages/admin/YanHizmetGiris'
import Ayarlar from './pages/admin/Ayarlar'
import './App.css'

function AppContent() {
  const { loaded, error } = useDataStatus()
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '2rem auto' }}>
        <h2>Veritabanı bağlantısı yok</h2>
        <p style={{ color: '#64748b' }}>{error}</p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Terminalde: <code>npm run server</code></p>
      </div>
    )
  }
  if (!loaded) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Yükleniyor…</p>
      </div>
    )
  }
  return <AppRoutes />
}

function AdminGate() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <AdminLogin />
  return (
    <Routes>
      <Route path="" element={<AdminLayout />}>
        <Route index element={<OtelGiris />} />
        <Route path="aktivite" element={<AktiviteGiris />} />
        <Route path="otel-fiyat" element={<OtelFiyatGiris />} />
        <Route path="aktivite-fiyat" element={<AktiviteFiyatGiris />} />
        <Route path="yan-hizmet" element={<YanHizmetGiris />} />
        <Route path="ayarlar" element={<Ayarlar />} />
      </Route>
    </Routes>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<UserFlow />} />
      <Route path="/admin/*" element={<AdminGate />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  )
}
