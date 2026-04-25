import { FormEvent, useMemo, useState } from 'react'
import type { AdminUser, AdminUserRole, Order, OrderStatus } from '../data/admin'
import type { Product, ProductCategory } from '../data/products'

type AdminPageProps = {
  products: Product[]
  users: AdminUser[]
  orders: Order[]
  onCreateProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
  onCreateUser: (user: AdminUser) => void
  onToggleUserActive: (id: string) => void
  onDeleteUser: (id: string) => void
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void
}

const categories: ProductCategory[] = ['Film Cameras', 'Digital Cameras', 'Lenses', 'Film', 'Accessories', 'Supplies']
const roles: AdminUserRole[] = ['admin', 'editor', 'support']
const statuses: OrderStatus[] = ['New', 'Packed', 'Out for delivery', 'Delivered']

const emptyProduct: Product = {
  id: '',
  productCode: '',
  name: '',
  category: 'Digital Cameras',
  price: 0,
  stock: 0,
  image: '',
  gallery: [],
  description: '',
  specs: []
}

const isSafeUrl = (value: string) => {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

const isValidProductCode = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)

export function AdminPage({
  products,
  users,
  orders,
  onCreateProduct,
  onDeleteProduct,
  onCreateUser,
  onToggleUserActive,
  onDeleteUser,
  onUpdateOrderStatus
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders'>('products')
  const [productForm, setProductForm] = useState<Product>(emptyProduct)
  const [galleryInput, setGalleryInput] = useState('')
  const [specsInput, setSpecsInput] = useState('')
  const [productError, setProductError] = useState('')
  const [userForm, setUserForm] = useState<AdminUser>({
    id: '',
    name: '',
    email: '',
    role: 'editor',
    active: true
  })

  const orderTotals = useMemo(
    () => ({
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status !== 'Delivered').length
    }),
    [orders]
  )

  const handleProductSubmit = (event: FormEvent) => {
    event.preventDefault()
    setProductError('')

    if (!productForm.id || !productForm.productCode || !productForm.name || !productForm.image) {
      setProductError('Please fill all required fields: id, product code, name, and main image URL.')
      return
    }

    if (!isValidProductCode(productForm.productCode)) {
      setProductError('Product code must be slug format: lowercase letters/numbers and dashes only (e.g. nikon-z6).')
      return
    }

    if (!isSafeUrl(productForm.image)) {
      setProductError('Main image must be a valid http(s) URL.')
      return
    }

    const gallery = galleryInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (gallery.some((url) => !isSafeUrl(url))) {
      setProductError('Each gallery URL must be a valid http(s) URL.')
      return
    }

    const specs = specsInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, ...valueParts] = line.split(':')
        return { label: label?.trim() ?? '', value: valueParts.join(':').trim() }
      })

    const hasInvalidSpec = specs.some((spec) => !spec.label || !spec.value)

    if (hasInvalidSpec) {
      setProductError('Each spec line must follow format: Label: Value')
      return
    }

    onCreateProduct({ ...productForm, gallery, specs })
    setProductForm(emptyProduct)
    setGalleryInput('')
    setSpecsInput('')
  }

  const handleUserSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!userForm.id || !userForm.name || !userForm.email) {
      return
    }
    onCreateUser(userForm)
    setUserForm({ id: '', name: '', email: '', role: 'editor', active: true })
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <section className="rounded-2xl bg-white p-6 shadow-playful">
        <h1 className="text-2xl font-black">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Manage products, user accounts, and orders from a single panel.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => setActiveTab('products')}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'products' ? 'bg-ink text-white' : 'bg-slate-100'}`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'users' ? 'bg-ink text-white' : 'bg-slate-100'}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'orders' ? 'bg-ink text-white' : 'bg-slate-100'}`}
          >
            Orders ({orderTotals.totalOrders})
          </button>
        </div>
      </section>

      {activeTab === 'products' && (
        <section className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <article className="rounded-2xl bg-white p-6 shadow-playful">
            <h2 className="mb-4 text-xl font-black">Create Product</h2>
            <form className="grid gap-3" onSubmit={handleProductSubmit}>
              <input
                value={productForm.id}
                onChange={(event) => setProductForm((state) => ({ ...state, id: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Unique product id"
              />
              <input
                value={productForm.productCode}
                onChange={(event) =>
                  setProductForm((state) => ({ ...state, productCode: event.target.value.trim().toLowerCase() }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Product code for URL (e.g. nikon-z6)"
              />
              <input
                value={productForm.name}
                onChange={(event) => setProductForm((state) => ({ ...state, name: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Product name"
              />
              <select
                value={productForm.category}
                onChange={(event) => setProductForm((state) => ({ ...state, category: event.target.value as ProductCategory }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                value={productForm.price}
                onChange={(event) => setProductForm((state) => ({ ...state, price: Number(event.target.value) }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Price"
                min={0}
              />
              <input
                type="number"
                value={productForm.stock}
                onChange={(event) => setProductForm((state) => ({ ...state, stock: Number(event.target.value) }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Stock"
                min={0}
              />
              <input
                value={productForm.image}
                onChange={(event) => setProductForm((state) => ({ ...state, image: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Main image URL"
              />
              <textarea
                value={galleryInput}
                onChange={(event) => setGalleryInput(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Gallery image URLs separated by commas"
                rows={3}
              />
              <textarea
                value={specsInput}
                onChange={(event) => setSpecsInput(event.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Specs format: Brand: Nikon (one per line)"
                rows={4}
              />
              <textarea
                value={productForm.description}
                onChange={(event) => setProductForm((state) => ({ ...state, description: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Description"
                rows={4}
              />
              {productError ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{productError}</p> : null}
              <button className="rounded-xl bg-ink px-4 py-2 font-bold text-white">Add Product</button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-playful">
            <h2 className="mb-4 text-xl font-black">Current Products ({products.length})</h2>
            <div className="space-y-3">
              {products.map((product) => (
                <article key={product.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                  <img src={product.image} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-sm text-slate-600">
                      {product.category} · ${product.price} · Stock: {product.stock}
                    </p>
                    <p className="text-xs text-slate-500">/{`products/${product.productCode}`}</p>
                  </div>
                  <button
                    onClick={() => onDeleteProduct(product.id)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-500"
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <article className="rounded-2xl bg-white p-6 shadow-playful">
            <h2 className="mb-4 text-xl font-black">Create User</h2>
            <form className="grid gap-3" onSubmit={handleUserSubmit}>
              <input value={userForm.id} onChange={(event) => setUserForm((state) => ({ ...state, id: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Unique user id" />
              <input value={userForm.name} onChange={(event) => setUserForm((state) => ({ ...state, name: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Full name" />
              <input type="email" value={userForm.email} onChange={(event) => setUserForm((state) => ({ ...state, email: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Email" />
              <select value={userForm.role} onChange={(event) => setUserForm((state) => ({ ...state, role: event.target.value as AdminUserRole }))} className="rounded-lg border border-slate-200 px-3 py-2">
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
              <button className="rounded-xl bg-ink px-4 py-2 font-bold text-white">Add User</button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-playful">
            <h2 className="mb-4 text-xl font-black">User Management ({users.length})</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <article key={user.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <div className="flex-1">
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-slate-600">
                      {user.email} · {user.role}
                    </p>
                  </div>
                  <button onClick={() => onToggleUserActive(user.id)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                      user.active ? 'border border-emerald-200 text-emerald-700' : 'border border-slate-300 text-slate-600'
                    }`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => onDeleteUser(user.id)} className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-500">
                    Delete
                  </button>
                </article>
              ))}
            </div>
          </article>
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="rounded-2xl bg-white p-6 shadow-playful">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Orders ({orderTotals.totalOrders})</h2>
            <p className="text-sm text-slate-600">Pending: {orderTotals.pendingOrders}</p>
          </div>
          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{order.id}</h3>
                    <p className="text-sm text-slate-600">
                      {order.customerName} · {order.phone}
                    </p>
                  </div>
                  <p className="font-bold text-ink">${order.total}</p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{order.itemsSummary}</p>
                <p className="text-sm text-slate-600">
                  {order.address} · {order.paymentMethod} · {order.createdAt}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm font-semibold">Status</label>
                  <select value={order.status} onChange={(event) => onUpdateOrderStatus(order.id, event.target.value as OrderStatus)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm">
                    {statuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
