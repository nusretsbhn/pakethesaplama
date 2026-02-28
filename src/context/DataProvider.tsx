import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loadFromApi, store } from '../store'

const DataContext = createContext<{ loaded: boolean; error: string | null }>({ loaded: false, error: null })

export function DataProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(store.loaded)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (store.loaded) {
      setLoaded(true)
      return
    }
    loadFromApi()
      .then(() => setLoaded(true))
      .catch((e) => setError(e?.message || 'Veritabanı sunucusuna bağlanılamadı. "npm run server" ile sunucuyu başlatın.'))
  }, [])

  return (
    <DataContext.Provider value={{ loaded, error }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataStatus() {
  return useContext(DataContext)
}
