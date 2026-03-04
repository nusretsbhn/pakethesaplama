import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

const AUTH_KEY = 'tur_admin_token'

type UserRole = 'admin' | 'bayi'

type AuthUser = {
  id: string
  username: string
  role: UserRole
}

type AuthContextType = {
  isAuthenticated: boolean
  user: AuthUser | null
  login: (username: string, password: string) => Promise<AuthUser | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(AUTH_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthUser
        setUser(parsed)
      } catch {
        localStorage.removeItem(AUTH_KEY)
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<AuthUser | null> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) return null
      const data = (await res.json()) as AuthUser
      localStorage.setItem(AUTH_KEY, JSON.stringify(data))
      setUser(data)
      return data
    } catch {
      return null
    }
  }

  const logout = () => {
    localStorage.removeItem(AUTH_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
