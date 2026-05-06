import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { type AdminUser, type Order, type OrderStatus } from './data/admin'
import { type CategoryNavigationMap, type MenuItem } from './data/navigation'
import { type Product } from './data/products'
import { api } from './lib/api'
import { CartDrawer } from './features/cart/components/CartDrawer'
import { Footer } from './features/layout/components/Footer'
import { NavBar } from './features/navigation/components/NavBar'
import { ProductDetailPage } from './features/products/pages/ProductDetailPage'
import { AdminPage } from './pages/AdminPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { CollectionPage } from './pages/CollectionPage'
import { HomePage } from './pages/HomePage'
import { InfoPage } from './pages/InfoPage'
import { StaticPage } from './pages/StaticPage'

const staticContent = {
  '/brands': {
    title: 'Brands',
    description: 'Curated camera brands for local creators and collectors.',
    bullets: ['Canon, Nikon, Sony, Fujifilm, Leica', 'Trusted used gear with inspected condition', 'Fresh stock updates coming from backend API soon']
  },
  '/condition': {
    title: 'Condition Guide',
    description: 'We keep condition labels clear so buying used gear feels safe and simple.',
    bullets: ['Mint: almost no signs of use', 'Excellent: light signs of use, fully working', 'Good: visible wear, tested and reliable']
  },
  '/valoi': {
    title: 'VALOI',
    description: 'A dedicated area for film scanning and analog workflow essentials.',
    bullets: ['Film holder systems', 'Scanning accessories', 'Workflow guides for beginners']
  },
  '/new': {
    title: 'New Arrivals',
    description: 'Just landed: latest cameras and accessories in store.',
    bullets: ['Updated frequently', 'Mixed film + digital drops', 'Great picks for first-time buyers']
  },
  '/sell': {
    title: 'Sell Your Gear',
    description: 'Want to sell your camera gear? Start here and our team will contact you.',
    bullets: ['Share gear details and condition', 'Quick valuation process', 'Local meetup / pickup options']
  }
} as const

const dedupeCategoryNavigation = (input: CategoryNavigationMap) => {
  const result: CategoryNavigationMap = {}

  for (const [category, entries] of Object.entries(input)) {
    const seen = new Set<string>()
    const cleanEntries = (entries ?? []).filter((entry) => {
      const normalized = entry.title.trim().toLowerCase()
      if (!normalized || seen.has(normalized)) {
        return false
      }
      seen.add(normalized)
      return true
    })

    if (cleanEntries.length > 0) {
      result[category as Product['category']] = cleanEntries
    }
  }

  return result
}


export function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false)
  const [categoryNavigation, setCategoryNavigation] = useState<CategoryNavigationMap>({})
  const [apiError, setApiError] = useState('')

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart])


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [productsResponse, navigationResponse, subcategoriesResponse, ordersResponse, usersResponse] = await Promise.all([
          api.getProducts({ page: 1, limit: 120 }),
          api.getNavigationMenu(),
          api.getNavigationSubcategories(),
          api.getOrders(),
          api.getAdminUsers()
        ])

        setProducts(productsResponse.items)
        setMenuItems(navigationResponse)
        setCategoryNavigation(dedupeCategoryNavigation(subcategoriesResponse))
        setOrders(ordersResponse)
        setUsers(usersResponse)
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Unable to load backend data')
      }
    }

    void loadInitialData()
  }, [])

  const handleAddToCart = (id: string) => {
    setCart((state) => ({ ...state, [id]: (state[id] ?? 0) + 1 }))
    setCartDrawerOpen(true)
  }

  const handleCreateProduct = async (product: Product) => {
    const created = await api.createProduct({
      id: product.id || undefined,
      productCode: product.productCode,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      description: product.description,
      subcategory: product.subcategory,
      featured: product.featured,
      gallery: product.gallery
    })
    setProducts((state) => [created, ...state.filter((item) => item.id !== created.id)])
  }

  const handleDeleteProduct = async (id: string) => {
    await api.deleteProduct(id)
    setProducts((state) => state.filter((product) => product.id !== id))
  }

  const handleCreateUser = async (user: AdminUser) => {
    const created = await api.createAdminUser({ name: user.name, email: user.email, role: user.role.toUpperCase() as 'ADMIN' | 'EDITOR' | 'SUPPORT' })
    setUsers((state) => [created, ...state.filter((item) => item.id !== created.id)])
  }

  const handleToggleUserActive = async (id: string) => {
    const updated = await api.toggleAdminUser(id)
    setUsers((state) => state.map((user) => (user.id === id ? updated : user)))
  }

  const handleDeleteUser = async (id: string) => {
    await api.deleteAdminUser(id)
    setUsers((state) => state.filter((user) => user.id !== id))
  }

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    const backendStatus = status === 'New' ? 'NEW' : status === 'Packed' ? 'PACKED' : status === 'Out for delivery' ? 'SHIPPED' : 'DELIVERED'
    const updated = await api.updateOrderStatus(id, backendStatus)
    setOrders((state) => state.map((order) => (order.id === id ? updated : order)))
  }

  const handleUpdateCategoryNavigation = async (nextNavigation: CategoryNavigationMap) => {
    const current = dedupeCategoryNavigation(categoryNavigation)
    const next = dedupeCategoryNavigation(nextNavigation)

    for (const [category, nextItems] of Object.entries(next)) {
      const typedCategory = category as Product['category']
      const currentItems = current[typedCategory] ?? []
      for (const item of nextItems ?? []) {
        if (!currentItems.some((existing) => existing.id === item.id)) {
          const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          await api.createNavigationSubcategory({ category: typedCategory, title: item.title, image: item.image, slug })
        }
      }
    }

    for (const [category, currentItems] of Object.entries(current)) {
      const typedCategory = category as Product['category']
      const nextItems = next[typedCategory] ?? []
      for (const item of currentItems ?? []) {
        if (!nextItems.some((existing) => existing.id === item.id)) {
          await api.deleteNavigationSubcategory(item.id)
        }
      }
    }

    const fresh = await api.getNavigationSubcategories()
    setCategoryNavigation(dedupeCategoryNavigation(fresh))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar cartCount={cartCount} categoryNavigation={categoryNavigation} menuItems={menuItems} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} />} />
          <Route
            path="/catalog"
            element={
              <CollectionPage
                title="Browse Cameras & Accessories"
                subtitle="Everything in one place, synced from backend APIs."
                products={products}
                onAddToCart={handleAddToCart}
              />
            }
          />
          {menuItems
            .filter((item) => item.category)
            .map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={
                  <CollectionPage
                    title={item.label}
                    subtitle={`Discover ${item.label.toLowerCase()} selected for local creators.`}
                    products={products.filter((product) => product.category === item.category)}
                    onAddToCart={handleAddToCart}
                  />
                }
              />
            ))}
          <Route path="/products/:productCode" element={<ProductDetailPage products={products} onAddToCart={handleAddToCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} products={products} onOrderCreated={(order) => setOrders((state) => [order, ...state])} />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                products={products}
                users={users}
                orders={orders}
                categoryNavigation={categoryNavigation}
                onCreateProduct={handleCreateProduct}
                onDeleteProduct={handleDeleteProduct}
                onCreateUser={handleCreateUser}
                onToggleUserActive={handleToggleUserActive}
                onDeleteUser={handleDeleteUser}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onUpdateCategoryNavigation={handleUpdateCategoryNavigation}
              />
            }
          />
          <Route path="/info" element={<InfoPage />} />
          {Object.entries(staticContent).map(([path, config]) => (
            <Route
              key={path}
              path={path}
              element={<StaticPage title={config.title} description={config.description} bullets={config.bullets} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {apiError ? <p className="mx-auto mt-2 max-w-7xl rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">Backend sync warning: {apiError}</p> : null}
      </div>
      <Footer />
      <CartDrawer open={cartDrawerOpen} cart={cart} products={products} onClose={() => setCartDrawerOpen(false)} />
    </div>
  )
}
