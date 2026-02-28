import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Admin.css'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [hata, setHata] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setHata('')
    if (login(password)) {
      navigate('/admin', { replace: true })
    } else {
      setHata('Geçersiz şifre. Demo: admin')
    }
  }

  return (
    <div className="admin-login">
      <h1>Admin Girişi</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit">Giriş</button>
        {hata && <p className="hata">{hata}</p>}
      </form>
      <p className="demo">Demo şifre: admin</p>
    </div>
  )
}
