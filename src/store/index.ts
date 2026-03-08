import type {
  Otel,
  Aktivite,
  OtelFiyat,
  AktiviteFiyat,
  YanHizmet,
  Ayarlar,
  User,
  Rezervasyon,
} from '../types'
import { api } from '../api'

type OtelRow = Otel
type AktiviteRow = Aktivite
type OtelFiyatRow = OtelFiyat
type AktiviteFiyatRow = AktiviteFiyat
type YanHizmetRow = YanHizmet

const cache = {
  oteller: [] as OtelRow[],
  aktiviteler: [] as AktiviteRow[],
  otelFiyatlari: [] as OtelFiyatRow[],
  aktiviteFiyatlari: [] as AktiviteFiyatRow[],
  yanHizmetler: [] as YanHizmetRow[],
  ayarlar: { webAdresi: '', telefonNo: '' } as Ayarlar,
  users: [] as User[],
  loaded: false,
}

export async function loadFromApi(): Promise<void> {
  const [oteller, aktiviteler, otelFiyatlari, aktiviteFiyatlari, yanHizmetler, ayarlar, users] = await Promise.all([
    api.oteller.getAll(),
    api.aktiviteler.getAll(),
    api.otelFiyatlari.getAll(),
    api.aktiviteFiyatlari.getAll(),
    api.yanHizmetler.getAll(),
    api.ayarlar.get(),
    api.users.getAll(),
  ])
  cache.oteller = Array.isArray(oteller) ? oteller : []
  cache.aktiviteler = Array.isArray(aktiviteler) ? aktiviteler : []
  cache.otelFiyatlari = Array.isArray(otelFiyatlari) ? otelFiyatlari : []
  cache.aktiviteFiyatlari = Array.isArray(aktiviteFiyatlari) ? aktiviteFiyatlari : []
  cache.yanHizmetler = Array.isArray(yanHizmetler) ? yanHizmetler : []
  cache.ayarlar = (ayarlar && typeof ayarlar === 'object' && 'webAdresi' in ayarlar
    ? ayarlar
    : { webAdresi: '', telefonNo: '' }) as Ayarlar
  cache.users = Array.isArray(users) ? users : []
  cache.loaded = true
}

export const store = {
  get loaded() {
    return cache.loaded
  },

  oteller: {
    getAll(): Otel[] {
      return cache.oteller
    },
    async add(o: Omit<Otel, 'id'>): Promise<Otel> {
      const id = crypto.randomUUID()
      const created = await api.oteller.add({ ...o, id }) as Otel
      cache.oteller.push(created)
      return created
    },
    async update(id: string, o: Partial<Otel>): Promise<void> {
      await api.oteller.update(id, o)
      const i = cache.oteller.findIndex((x) => x.id === id)
      if (i !== -1) cache.oteller[i] = { ...cache.oteller[i], ...o }
    },
    async delete(id: string): Promise<void> {
      await api.oteller.delete(id)
      cache.oteller = cache.oteller.filter((x) => x.id !== id)
    },
    getById(id: string): Otel | undefined {
      return cache.oteller.find((x) => x.id === id)
    },
  },

  aktiviteler: {
    getAll(): Aktivite[] {
      return cache.aktiviteler
    },
    async add(a: Omit<Aktivite, 'id'>): Promise<Aktivite> {
      const id = crypto.randomUUID()
      const created = await api.aktiviteler.add({ ...a, id }) as Aktivite
      cache.aktiviteler.push(created)
      return created
    },
    async update(id: string, a: Partial<Aktivite>): Promise<void> {
      await api.aktiviteler.update(id, a)
      const i = cache.aktiviteler.findIndex((x) => x.id === id)
      if (i !== -1) cache.aktiviteler[i] = { ...cache.aktiviteler[i], ...a }
    },
    async delete(id: string): Promise<void> {
      await api.aktiviteler.delete(id)
      cache.aktiviteler = cache.aktiviteler.filter((x) => x.id !== id)
    },
    getById(id: string): Aktivite | undefined {
      return cache.aktiviteler.find((x) => x.id === id)
    },
  },

  otelFiyatlari: {
    getAll(): OtelFiyat[] {
      return cache.otelFiyatlari
    },
    getByOtelId(otelId: string): OtelFiyat[] {
      return cache.otelFiyatlari.filter((x) => x.otelId === otelId)
    },
    async add(o: Omit<OtelFiyat, 'id'>): Promise<OtelFiyat> {
      const id = crypto.randomUUID()
      const created = await api.otelFiyatlari.add({ ...o, id }) as OtelFiyat
      cache.otelFiyatlari.push(created)
      return created
    },
    async update(id: string, o: Partial<OtelFiyat>): Promise<void> {
      await api.otelFiyatlari.update(id, o)
      const i = cache.otelFiyatlari.findIndex((x) => x.id === id)
      if (i !== -1) cache.otelFiyatlari[i] = { ...cache.otelFiyatlari[i], ...o }
    },
    async delete(id: string): Promise<void> {
      await api.otelFiyatlari.delete(id)
      cache.otelFiyatlari = cache.otelFiyatlari.filter((x) => x.id !== id)
    },
  },

  aktiviteFiyatlari: {
    getAll(): AktiviteFiyat[] {
      return cache.aktiviteFiyatlari
    },
    getByAktiviteId(aktiviteId: string): AktiviteFiyat[] {
      return cache.aktiviteFiyatlari.filter((x) => x.aktiviteId === aktiviteId)
    },
    async add(a: Omit<AktiviteFiyat, 'id'>): Promise<AktiviteFiyat> {
      const id = crypto.randomUUID()
      const created = await api.aktiviteFiyatlari.add({ ...a, id }) as AktiviteFiyat
      cache.aktiviteFiyatlari.push(created)
      return created
    },
    async update(id: string, a: Partial<AktiviteFiyat>): Promise<void> {
      await api.aktiviteFiyatlari.update(id, a)
      const i = cache.aktiviteFiyatlari.findIndex((x) => x.id === id)
      if (i !== -1) cache.aktiviteFiyatlari[i] = { ...cache.aktiviteFiyatlari[i], ...a }
    },
    async delete(id: string): Promise<void> {
      await api.aktiviteFiyatlari.delete(id)
      cache.aktiviteFiyatlari = cache.aktiviteFiyatlari.filter((x) => x.id !== id)
    },
  },

  yanHizmetler: {
    getAll(): YanHizmet[] {
      return cache.yanHizmetler
    },
    async add(y: Omit<YanHizmet, 'id'>): Promise<YanHizmet> {
      const id = crypto.randomUUID()
      const created = await api.yanHizmetler.add({ ...y, id }) as YanHizmet
      cache.yanHizmetler.push(created)
      return created
    },
    async update(id: string, y: Partial<YanHizmet>): Promise<void> {
      await api.yanHizmetler.update(id, y)
      const i = cache.yanHizmetler.findIndex((x) => x.id === id)
      if (i !== -1) cache.yanHizmetler[i] = { ...cache.yanHizmetler[i], ...y }
    },
    async delete(id: string): Promise<void> {
      await api.yanHizmetler.delete(id)
      cache.yanHizmetler = cache.yanHizmetler.filter((x) => x.id !== id)
    },
  },

  ayarlar: {
    get(): Ayarlar {
      return cache.ayarlar
    },
    async set(a: Ayarlar): Promise<void> {
      await api.ayarlar.set(a as unknown as Record<string, unknown>)
      cache.ayarlar = a
    },
  },

  users: {
    getAll(): User[] {
      return cache.users
    },
    async add(u: { username: string; password: string; role: User['role'] }): Promise<User> {
      const created = (await api.users.add(u)) as User
      cache.users.push(created)
      return created
    },
    async update(id: string, u: { username?: string; password?: string; role?: User['role'] }): Promise<void> {
      const updated = (await api.users.update(id, u)) as User
      const i = cache.users.findIndex((x) => x.id === id)
      if (i !== -1) cache.users[i] = updated
    },
    async delete(id: string): Promise<void> {
      await api.users.delete(id)
      cache.users = cache.users.filter((x) => x.id !== id)
    },
  },

  rezervasyonlar: {
    async getAll(params?: { durum?: string; olusturan?: string }): Promise<Rezervasyon[]> {
      const list = await api.rezervasyonlar.getAll(params)
      return (Array.isArray(list) ? list : []) as Rezervasyon[]
    },
    async add(r: Omit<Rezervasyon, 'id' | 'olusturmaTarihi'>): Promise<Rezervasyon> {
      return (await api.rezervasyonlar.add(r)) as Rezervasyon
    },
    async update(id: string, r: Partial<Rezervasyon>): Promise<void> {
      await api.rezervasyonlar.update(id, r)
    },
    async delete(id: string): Promise<void> {
      await api.rezervasyonlar.delete(id)
    },
  },
}
