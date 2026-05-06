import { FormEvent, useMemo, useState } from 'react'
import type { AdminUser, AdminUserRole, Order, OrderStatus } from '../data/admin'
import type { CategoryNavigationMap, NavSubcategory } from '../data/navigation'
import type { Product, ProductCategory } from '../data/products'
import { useNotifications } from '../features/notifications/notificationContext'

type AdminPageProps = {
  products: Product[]
  users: AdminUser[]
  orders: Order[]
  categoryNavigation: CategoryNavigationMap
  onCreateProduct: (product: Product) => Promise<void> | void
  onDeleteProduct: (id: string) => Promise<void> | void
  onCreateUser: (user: AdminUser) => Promise<void> | void
  onToggleUserActive: (id: string) => Promise<void> | void
  onDeleteUser: (id: string) => Promise<void> | void
  onUpdateOrderStatus: (id: string, status: OrderStatus) => Promise<void> | void
  isAuthenticated: boolean
  onLogin: (password: string) => Promise<void> | void
  onLogout: () => void
  onUpdateCategoryNavigation: (nextNavigation: CategoryNavigationMap) => Promise<void> | void
}

const categories: ProductCategory[] = ['Film Cameras', 'Digital Cameras', 'Lenses', 'Film', 'Accessories', 'Supplies']
const roles: AdminUserRole[] = ['admin', 'editor', 'support']
const statuses: OrderStatus[] = ['New', 'Paid', 'Packed', 'Out for delivery', 'Delivered', 'Cancelled']

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
  specs: [],
  subcategory: '',
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

const toId = (category: ProductCategory, title: string) =>
  `${category.toLowerCase().replace(/\s+/g, '-')}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

export function AdminPage({
  products,
  users,
  orders,
  categoryNavigation,
  onCreateProduct,
  onDeleteProduct,
  onCreateUser,
  onToggleUserActive,
  onDeleteUser,
  onUpdateOrderStatus,
  isAuthenticated,
  onLogin,
  onLogout,
  onUpdateCategoryNavigation,
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders'>('products')
  const [productForm, setProductForm] = useState<Product>(emptyProduct)
  const [galleryInput, setGalleryInput] = useState('')
  const [specRows, setSpecRows] = useState<Array<{ label: string; value: string }>>([{ label: '', value: '' }])
  const [productError, setProductError] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const { notifyError } = useNotifications()

  const availableSubcategories = useMemo(
    () => (categoryNavigation[productForm.category] ?? []).map((entry) => entry.title),
    [categoryNavigation, productForm.category],
  )

  const [navigationForm, setNavigationForm] = useState({
    category: 'Digital Cameras' as ProductCategory,
    title: '',
    image: '',
  })

  const [navigationError, setNavigationError] = useState('')
  const [userForm, setUserForm] = useState<AdminUser>({
    id: '',
    name: '',
    email: '',
    role: 'editor',
    active: true,
  })

  const handleLoginSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoginError('')

    try {
      await onLogin(loginPassword)
      setLoginPassword('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to log in'
      setLoginError(message)
      notifyError(message, { title: 'Login error' })
    }
  }

  const orderTotals = useMemo(
    () => ({
      totalOrders: orders.length,
      pendingOrders: orders.filter((order) => order.status !== 'Delivered').length,
    }),
    [orders],
  )

  const handleProductSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setProductError('')

    if (!productForm.productCode || !productForm.name || !productForm.image) {
      const message = 'Please fill all required fields: product code, name, and main image URL.'
      setProductError(message)
      notifyError(message, { title: 'Product validation error' })
      return
    }

    if (!isValidProductCode(productForm.productCode)) {
      const message = 'Product code must be slug format: lowercase letters/numbers and dashes only (e.g. nikon-z6).'
      setProductError(message)
      notifyError(message, { title: 'Product validation error' })
      return
    }

    if (!isSafeUrl(productForm.image)) {
      const message = 'Main image must be a valid http(s) URL.'
      setProductError(message)
      notifyError(message, { title: 'Product validation error' })
      return
    }

    const gallery = galleryInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    if (gallery.some((url) => !isSafeUrl(url))) {
      const message = 'Each gallery URL must be a valid http(s) URL.'
      setProductError(message)
      notifyError(message, { title: 'Product validation error' })
      return
    }

    const specs = specRows
      .map((spec) => ({
        label: spec.label.trim(),
        value: spec.value.trim(),
      }))
      .filter((spec) => spec.label || spec.value)

    const hasInvalidSpec = specs.some((spec) => !spec.label || !spec.value)

    if (hasInvalidSpec) {
      const message = 'Each spec needs both a label and a value, or leave both fields empty.'
      setProductError(message)
      notifyError(message, { title: 'Product validation error' })
      return
    }

    try {
      await onCreateProduct({
        ...productForm,
        subcategory: productForm.subcategory?.trim() || undefined,
        gallery,
        specs,
      })
    } catch {
      return
    }

    setProductForm(emptyProduct)
    setGalleryInput('')
    setSpecRows([{ label: '', value: '' }])
  }

  const handleNavigationSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setNavigationError('')

    const title = navigationForm.title.trim()
    if (!title || !navigationForm.image.trim()) {
      const message = 'Please provide both subcategory title and image URL.'
      setNavigationError(message)
      notifyError(message, { title: 'Navigation validation error' })
      return
    }

    if (!isSafeUrl(navigationForm.image)) {
      const message = 'Subcategory image must be a valid http(s) URL.'
      setNavigationError(message)
      notifyError(message, { title: 'Navigation validation error' })
      return
    }

    const currentEntries = categoryNavigation[navigationForm.category] ?? []
    const alreadyExists = currentEntries.some((entry) => entry.title.toLowerCase() === title.toLowerCase())
    if (alreadyExists) {
      const message = 'This subcategory already exists for the selected top-level category.'
      setNavigationError(message)
      notifyError(message, { title: 'Navigation validation error' })
      return
    }

    const next: NavSubcategory = {
      id: toId(navigationForm.category, title),
      title,
      image: navigationForm.image.trim(),
    }

    try {
      await onUpdateCategoryNavigation({
        ...categoryNavigation,
        [navigationForm.category]: [...currentEntries, next],
      })
    } catch {
      return
    }

    setNavigationForm((state) => ({ ...state, title: '', image: '' }))
  }

  const handleDeleteNavigationItem = async (category: ProductCategory, itemId: string) => {
    const currentEntries = categoryNavigation[category] ?? []
    const filtered = currentEntries.filter((entry) => entry.id !== itemId)

    const next: CategoryNavigationMap = { ...categoryNavigation }
    if (filtered.length === 0) {
      delete next[category]
    } else {
      next[category] = filtered
    }

    try {
      await onUpdateCategoryNavigation(next)
    } catch {
      return
    }
  }

  const handleUserSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!userForm.name || !userForm.email) {
      notifyError('Please provide both the user name and email address.', { title: 'User validation error' })
      return
    }
    try {
      await onCreateUser({ ...userForm, id: userForm.id || `tmp-${Date.now()}` })
    } catch {
      return
    }
    setUserForm({ id: '', name: '', email: '', role: 'editor', active: true })
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto flex max-w-xl flex-1 items-center px-6 py-12">
        <section className="w-full rounded-2xl bg-white p-6 shadow-playful">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-600">Admin only</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Log in to continue</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter the admin password to manage products, orders, users, and navigation.
          </p>
          <form className="mt-6 grid gap-3" onSubmit={handleLoginSubmit}>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2"
              placeholder="Admin password"
              autoComplete="current-password"
            />
            {loginError ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{loginError}</p> : null}
            <button className="rounded-xl bg-ink px-4 py-2 font-bold text-white">Log in</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <section className="rounded-2xl bg-white p-6 shadow-playful">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage products, user accounts, order status, and navigation from a single panel.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Log out
          </button>
        </div>

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
        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
            <article className="rounded-2xl bg-white p-6 shadow-playful">
              <h2 className="mb-4 text-xl font-black">Create Product</h2>
              <form className="grid gap-3" onSubmit={handleProductSubmit}>
                <input
                  value={productForm.productCode}
                  onChange={(event) =>
                    setProductForm((state) => ({
                      ...state,
                      productCode: event.target.value.trim().toLowerCase(),
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Product code for URL (e.g. nikon-z6)"
                />

                <input
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm((state) => ({
                      ...state,
                      name: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Product name"
                />

                <select
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm((state) => ({
                      ...state,
                      category: event.target.value as ProductCategory,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>

                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  <span>Subcategory</span>
                  <select
                    value={productForm.subcategory ?? ''}
                    onChange={(event) =>
                      setProductForm((state) => ({
                        ...state,
                        subcategory: event.target.value || '',
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
                    disabled={availableSubcategories.length === 0}
                  >
                    <option value="">
                      {availableSubcategories.length === 0
                        ? 'No subcategories available for this category'
                        : 'Select subcategory'}
                    </option>
                    {availableSubcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  <span>Price</span>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((state) => ({
                        ...state,
                        price: Number(event.target.value),
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="Price"
                    min={0}
                  />
                </label>

                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  <span>Stock</span>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(event) =>
                      setProductForm((state) => ({
                        ...state,
                        stock: Number(event.target.value),
                      }))
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="Stock"
                    min={0}
                  />
                </label>

                <input
                  value={productForm.image}
                  onChange={(event) =>
                    setProductForm((state) => ({
                      ...state,
                      image: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Main image URL"
                />

                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  <span>Gallery images</span>
                  <textarea
                    value={galleryInput}
                    onChange={(event) => setGalleryInput(event.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2"
                    placeholder="Paste image URLs separated by commas"
                    rows={3}
                  />
                  <span className="text-xs font-normal text-slate-500">
                    Example: https://example.com/1.jpg, https://example.com/2.jpg
                  </span>
                </label>

                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">Product specs</p>
                    <p className="text-xs text-slate-500">
                      Optional. Add details like brand, condition, sensor, lens mount, warranty, or included items.
                    </p>
                  </div>

                  {specRows.map((spec, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={spec.label}
                        onChange={(event) =>
                          setSpecRows((rows) =>
                            rows.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, label: event.target.value } : row,
                            ),
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Label e.g. Brand"
                      />

                      <input
                        value={spec.value}
                        onChange={(event) =>
                          setSpecRows((rows) =>
                            rows.map((row, rowIndex) =>
                              rowIndex === index ? { ...row, value: event.target.value } : row,
                            ),
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Value e.g. Sony"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setSpecRows((rows) =>
                            rows.length === 1
                              ? [{ label: '', value: '' }]
                              : rows.filter((_, rowIndex) => rowIndex !== index),
                          )
                        }
                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSpecRows((rows) => [...rows, { label: '', value: '' }])}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      + Add spec
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSpecRows([
                          { label: 'Brand', value: '' },
                          { label: 'Condition', value: '' },
                          { label: 'Sensor', value: '' },
                          { label: 'Lens Mount', value: '' },
                        ])
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                    >
                      Use camera template
                    </button>
                  </div>
                </div>

                <textarea
                  value={productForm.description}
                  onChange={(event) =>
                    setProductForm((state) => ({
                      ...state,
                      description: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Description"
                  rows={4}
                />

                {productError ? <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{productError}</p> : null}

                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(productForm.featured)}
                    onChange={(event) =>
                      setProductForm((state) => ({
                        ...state,
                        featured: event.target.checked,
                      }))
                    }
                  />
                  Featured product
                </label>

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
                        {product.category}
                        {product.subcategory ? ` · ${product.subcategory}` : ''} · ${product.price} · Stock:{' '}
                        {product.stock}
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
          </div>

          <section className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
            <article className="rounded-2xl bg-white p-6 shadow-playful">
              <h2 className="mb-2 text-xl font-black">Navbar Subcategories</h2>
              <p className="mb-4 text-sm text-slate-600">
                Add visual subcategories to each top-level menu. This controls what appears in category dropdowns.
              </p>
              <form className="grid gap-3" onSubmit={handleNavigationSubmit}>
                <select
                  value={navigationForm.category}
                  onChange={(event) =>
                    setNavigationForm((state) => ({
                      ...state,
                      category: event.target.value as ProductCategory,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <input
                  value={navigationForm.title}
                  onChange={(event) =>
                    setNavigationForm((state) => ({
                      ...state,
                      title: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Subcategory title"
                />
                <input
                  value={navigationForm.image}
                  onChange={(event) =>
                    setNavigationForm((state) => ({
                      ...state,
                      image: event.target.value,
                    }))
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="Subcategory image URL"
                />
                {navigationError ? (
                  <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{navigationError}</p>
                ) : null}
                <button className="rounded-xl bg-ink px-4 py-2 font-bold text-white">Add Subcategory</button>
              </form>
            </article>

            <article className="rounded-2xl bg-white p-6 shadow-playful">
              <h2 className="mb-4 text-xl font-black">Current Navbar Groups</h2>
              <div className="space-y-4">
                {categories.map((category) => {
                  const items = categoryNavigation[category] ?? []

                  return (
                    <section key={category} className="rounded-xl border border-slate-200 p-3">
                      <h3 className="font-bold text-slate-900">{category}</h3>
                      {items.length === 0 ? (
                        <p className="mt-1 text-sm text-slate-500">No subcategories yet.</p>
                      ) : (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {items.map((item) => (
                            <article
                              key={item.id}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"
                            >
                              <img src={item.image} alt={item.title} className="h-10 w-10 rounded-md object-cover" />
                              <p className="flex-1 text-sm font-semibold text-slate-700">{item.title}</p>
                              <button
                                onClick={() => handleDeleteNavigationItem(category, item.id)}
                                className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-500"
                              >
                                Remove
                              </button>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )
                })}
              </div>
            </article>
          </section>
        </section>
      )}

      {activeTab === 'users' && (
        <section className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <article className="rounded-2xl bg-white p-6 shadow-playful">
            <h2 className="mb-4 text-xl font-black">Create User</h2>
            <form className="grid gap-3" onSubmit={handleUserSubmit}>
              <input
                value={userForm.id}
                onChange={(event) => setUserForm((state) => ({ ...state, id: event.target.value }))}
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Unique user id"
              />
              <input
                value={userForm.name}
                onChange={(event) =>
                  setUserForm((state) => ({
                    ...state,
                    name: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Full name"
              />
              <input
                type="email"
                value={userForm.email}
                onChange={(event) =>
                  setUserForm((state) => ({
                    ...state,
                    email: event.target.value,
                  }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
                placeholder="Email"
              />
              <select
                value={userForm.role}
                onChange={(event) =>
                  setUserForm((state) => ({
                    ...state,
                    role: event.target.value as AdminUserRole,
                  }))
                }
                className="rounded-lg border border-slate-200 px-3 py-2"
              >
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
                <article
                  key={user.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex-1">
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-sm text-slate-600">
                      {user.email} · {user.role}
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleUserActive(user.id)}
                    className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                      user.active
                        ? 'border border-emerald-200 text-emerald-700'
                        : 'border border-slate-300 text-slate-600'
                    }`}
                  >
                    {user.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => onDeleteUser(user.id)}
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

      {activeTab === 'orders' && (
        <section className="rounded-2xl bg-white p-6 shadow-playful">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Orders ({orderTotals.totalOrders})</h2>
            <p className="text-sm text-slate-600">Pending: {orderTotals.pendingOrders}</p>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <article key={order.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">{order.orderNumber}</h3>
                    <p className="text-xs text-slate-500">Internal ID: {order.id}</p>
                    <p className="text-sm text-slate-600">
                      {order.customerName} · {order.email} · {order.phone}
                    </p>
                    <p className="text-sm text-slate-600">{order.address}</p>
                    <p className="mt-1 text-sm text-slate-700">{order.itemsSummary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">${order.total}</p>
                    <p className="text-xs text-slate-500">{order.createdAt}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateOrderStatus(order.id, status)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === status ? 'bg-ink text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}