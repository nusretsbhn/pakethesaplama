const API = import.meta.env.VITE_API_URL || '/api'

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`)
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

async function del(path: string): Promise<void> {
  const r = await fetch(`${API}${path}`, { method: 'DELETE' })
  if (!r.ok) throw new Error(await r.text())
}

export const api = {
  oteller: {
    getAll: () => get('/oteller'),
    add: (body: Record<string, unknown>) => post('/oteller', body),
    update: (id: string, body: Record<string, unknown>) => patch(`/oteller/${id}`, body),
    delete: (id: string) => del(`/oteller/${id}`),
  },
  aktiviteler: {
    getAll: () => get('/aktiviteler'),
    add: (body: Record<string, unknown>) => post('/aktiviteler', body),
    update: (id: string, body: Record<string, unknown>) => patch(`/aktiviteler/${id}`, body),
    delete: (id: string) => del(`/aktiviteler/${id}`),
  },
  otelFiyatlari: {
    getAll: () => get('/otel-fiyatlari'),
    add: (body: Record<string, unknown>) => post('/otel-fiyatlari', body),
    update: (id: string, body: Record<string, unknown>) => patch(`/otel-fiyatlari/${id}`, body),
    delete: (id: string) => del(`/otel-fiyatlari/${id}`),
  },
  aktiviteFiyatlari: {
    getAll: () => get('/aktivite-fiyatlari'),
    add: (body: Record<string, unknown>) => post('/aktivite-fiyatlari', body),
    update: (id: string, body: Record<string, unknown>) => patch(`/aktivite-fiyatlari/${id}`, body),
    delete: (id: string) => del(`/aktivite-fiyatlari/${id}`),
  },
  yanHizmetler: {
    getAll: () => get('/yan-hizmetler'),
    add: (body: Record<string, unknown>) => post('/yan-hizmetler', body),
    update: (id: string, body: Record<string, unknown>) => patch(`/yan-hizmetler/${id}`, body),
    delete: (id: string) => del(`/yan-hizmetler/${id}`),
  },
  ayarlar: {
    get: () => get('/ayarlar'),
    set: (body: Record<string, unknown>) =>
      fetch(`${API}/ayarlar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      }),
  },
}
