import { useState } from 'react'
import { store } from '../../store'
import type { User, UserRole } from '../../types'

export default function KullaniciGiris() {
  const [list, setList] = useState<User[]>(store.users.getAll())
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('bayi')
  const [editId, setEditId] = useState<string | null>(null)

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setRole('bayi')
    setEditId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || (!password && !editId)) return
    try {
      if (editId) {
        await store.users.update(editId, { username, password: password || undefined, role })
      } else {
        await store.users.add({ username, password, role })
      }
      setList(store.users.getAll())
      resetForm()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kullanıcı kaydedilemedi'
      alert(msg)
    }
  }

  const handleEdit = (u: User) => {
    setEditId(u.id)
    setUsername(u.username)
    setPassword('')
    setRole(u.role)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return
    try {
      await store.users.delete(id)
      setList(store.users.getAll())
      if (editId === id) resetForm()
    } catch {
      alert('Silinemedi. Sunucu çalışıyor mu?')
    }
  }

  return (
    <>
      <h2>Kullanıcılar</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kullanıcı Adı *</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Şifre {editId ? '(boş bırakılırsa değişmez)' : '*'}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Rol *</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="admin">Admin</option>
            <option value="bayi">Bayi</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">
          {editId ? 'Güncelle' : 'Ekle'}
        </button>
        {editId && (
          <button type="button" className="btn-small" onClick={resetForm} style={{ marginLeft: '0.5rem' }}>
            İptal
          </button>
        )}
      </form>

      <h3 style={{ marginTop: '2rem' }}>Kayıtlı Kullanıcılar</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Kullanıcı Adı</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>
                  <button type="button" className="btn-small btn-edit" onClick={() => handleEdit(u)}>
                    Düzenle
                  </button>
                  <button type="button" className="btn-small btn-delete" onClick={() => handleDelete(u.id)}>
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

