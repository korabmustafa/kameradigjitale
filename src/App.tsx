import { useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Footer } from './features/layout/components/Footer'
import { NavBar } from './features/navigation/components/NavBar'
import { ProductDetailPage } from './features/products/pages/ProductDetailPage'
import { seedOrders, seedUsers, type AdminUser, type Order, type OrderStatus } from './data/admin'
import { menuItems } from './data/navigation'
import { seedProducts, type Product } from './data/products'
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

export function App() {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [users, setUsers] = useState<AdminUser[]>(seedUsers)
  const [orders, setOrders] = useState<Order[]>(seedOrders)
  const [cart, setCart] = useState<Record<string, number>>({})

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart])

  const handleAddToCart = (id: string) => {
    setCart((state) => ({ ...state, [id]: (state[id] ?? 0) + 1 }))
  }

  const handleCreateProduct = (product: Product) => {
    setProducts((state) => {
      const exists = state.some((item) => item.id === product.id || item.productCode === product.productCode)
      if (exists) {
        return state
      }
      return [product, ...state]
    })
  }

  const handleDeleteProduct = (id: string) => {
    setProducts((state) => state.filter((product) => product.id !== id))
  }

  const handleCreateUser = (user: AdminUser) => {
    setUsers((state) => {
      const exists = state.some((item) => item.id === user.id || item.email === user.email)
      if (exists) {
        return state
      }
      return [user, ...state]
    })
  }

  const handleToggleUserActive = (id: string) => {
    setUsers((state) => state.map((user) => (user.id === id ? { ...user, active: !user.active } : user)))
  }

  const handleDeleteUser = (id: string) => {
    setUsers((state) => state.filter((user) => user.id !== id))
  }

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((state) => state.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavBar cartCount={cartCount} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage products={products} onAddToCart={handleAddToCart} />} />
          <Route
            path="/catalog"
            element={
              <CollectionPage
                title="Browse Cameras & Accessories"
                subtitle="Everything in one place while backend APIs are being prepared."
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
          <Route path="/checkout" element={<CheckoutPage cart={cart} products={products} />} />
          <Route
            path="/admin"
            element={
              <AdminPage
                products={products}
                users={users}
                orders={orders}
                onCreateProduct={handleCreateProduct}
                onDeleteProduct={handleDeleteProduct}
                onCreateUser={handleCreateUser}
                onToggleUserActive={handleToggleUserActive}
                onDeleteUser={handleDeleteUser}
                onUpdateOrderStatus={handleUpdateOrderStatus}
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
      </div>
      <Footer />
    </div>
  )
}
