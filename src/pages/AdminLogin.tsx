import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Admin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [hata, setHata] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHata('')
    const authUser = await login(username, password)
    if (authUser) {
      if (authUser.role === 'bayi') {
        navigate('/admin/bayi-paket', { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    } else {
      setHata('Geçersiz kullanıcı adı veya şifre.')
    }
  }

  return (
    <div className="admin-login">
      <h1>Admin Girişi</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Giriş</button>
        {hata && <p className="hata">{hata}</p>}
      </form>
    </div>
  )
}
