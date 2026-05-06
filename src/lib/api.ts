import type { Product } from '../data/products'
import type { AdminUser, Order, OrderStatus } from '../data/admin'
import type { CategoryNavigationMap, MenuItem, NavSubcategory } from '../data/navigation'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

const categoryLabelMap: Record<string, Product['category']> = {
  FILM_CAMERAS: 'Film Cameras',
  DIGITAL_CAMERAS: 'Digital Cameras',
  LENSES: 'Lenses',
  FILM: 'Film',
  ACCESSORIES: 'Accessories',
  SUPPLIES: 'Supplies'
}
const categoryEnumMap: Record<Product['category'], string> = {
  'Film Cameras': 'FILM_CAMERAS',
  'Digital Cameras': 'DIGITAL_CAMERAS',
  Lenses: 'LENSES',
  Film: 'FILM',
  Accessories: 'ACCESSORIES',
  Supplies: 'SUPPLIES'
}

type ApiProduct = {
  id: string
  productCode: string
  name: string
  category: string
  price: number
  stock: number
  image: string
  description: string
  subcategory?: string
  featured?: boolean
  gallery?: Array<{ imageUrl: string }>
}

const toProduct = (product: ApiProduct): Product => ({
  ...product,
  category: categoryLabelMap[product.category] ?? 'Accessories',
  gallery: product.gallery?.map((entry) => entry.imageUrl)
})

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

const orderStatusMap: Record<string, OrderStatus> = {
  NEW: 'New',
  PAID: 'Packed',
  PACKED: 'Packed',
  SHIPPED: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Delivered'
}

const roleMap: Record<string, AdminUser['role']> = { ADMIN: 'admin', EDITOR: 'editor', SUPPORT: 'support' }

type ApiOrder = Omit<Order, 'status'> & { status: string }

type ApiAdminUser = Omit<AdminUser, 'role'> & { role: string }

const toOrder = (order: ApiOrder): Order => ({ ...order, status: orderStatusMap[order.status] ?? 'New' })

const toAdminUser = (user: ApiAdminUser): AdminUser => ({ ...user, role: roleMap[user.role] ?? 'support' })

export const api = {
  async getProducts(params?: { category?: string; q?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.q) query.set('q', params.q)
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))

    const payload = await request<{ items: ApiProduct[]; meta: { total: number; page: number; limit: number } }>(
      `/products${query.toString() ? `?${query.toString()}` : ''}`
    )
    return { ...payload, items: payload.items.map(toProduct) }
  },

  async getNavigationMenu() {
    const menu = await request<Array<{ label: string; path: string; category?: string | null }>>('/navigation/menu')
    return menu.map((item) => ({ ...item, category: item.category ? categoryLabelMap[item.category] : undefined })) as MenuItem[]
  },
  async getNavigationSubcategories() {
    const items = await request<Array<{ id: string; slug: string; title: string; image: string; category: string }>>('/navigation/subcategories')
    return items.reduce<CategoryNavigationMap>((acc, item) => {
      const category = categoryLabelMap[item.category]
      if (!category) return acc
      const nextItem: NavSubcategory = { id: item.id, slug: item.slug, title: item.title, image: item.image }
      acc[category] = [...(acc[category] ?? []), nextItem]
      return acc
    }, {})
  },

  async getOrders() {
    const orders = await request<ApiOrder[]>('/orders')
    return orders.map(toOrder)
  },

  async getAdminUsers() {
    const users = await request<ApiAdminUser[]>('/users/admin')
    return users.map(toAdminUser)
  },



  createProduct: (payload: {
    id?: string
    productCode: string
    name: string
    category: string
    price: number
    stock: number
    image: string
    description: string
    subcategory?: string
    featured?: boolean
    gallery?: string[]
  }) => request<ApiProduct>('/products', { method: 'POST', body: JSON.stringify(payload) }).then(toProduct),

  deleteProduct: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),

  createAdminUser: (payload: { name: string; email: string; role: 'ADMIN' | 'EDITOR' | 'SUPPORT' }) =>
    request<ApiAdminUser>('/users/admin', { method: 'POST', body: JSON.stringify(payload) }).then(toAdminUser),

  toggleAdminUser: (id: string) =>
    request<ApiAdminUser>(`/users/admin/${id}/toggle-active`, { method: 'PATCH' }).then(toAdminUser),

  deleteAdminUser: (id: string) => request(`/users/admin/${id}`, { method: 'DELETE' }),
  createNavigationSubcategory: (payload: { category: Product['category']; title: string; image: string; slug: string }) =>
    request<{ id: string; title: string; image: string }>(`/navigation/subcategories`, {
      method: 'POST',
      body: JSON.stringify({ ...payload, category: categoryEnumMap[payload.category] })
    }),
  deleteNavigationSubcategory: (id: string) => request(`/navigation/subcategories/${id}`, { method: 'DELETE' }),

  updateOrderStatus: (id: string, status: 'NEW' | 'PAID' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') =>
    request<ApiOrder>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }).then(toOrder),

  createOrder: (payload: {
    customerName: string
    email: string
    phone: string
    address: string
    items: Array<{ productCode: string; quantity: number }>
  }) => request<ApiOrder>('/orders', { method: 'POST', body: JSON.stringify(payload) }).then(toOrder)
}
