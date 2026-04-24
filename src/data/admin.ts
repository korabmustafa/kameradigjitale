export type AdminUserRole = 'admin' | 'editor' | 'support'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  active: boolean
}

export type OrderStatus = 'New' | 'Packed' | 'Out for delivery' | 'Delivered'

export type Order = {
  id: string
  customerName: string
  phone: string
  address: string
  itemsSummary: string
  total: number
  paymentMethod: 'Cash on Delivery'
  status: OrderStatus
  createdAt: string
}

export const seedUsers: AdminUser[] = [
  { id: 'usr-001', name: 'Rina Akter', email: 'rina@kameradigjitale.local', role: 'admin', active: true },
  { id: 'usr-002', name: 'Nabil Khan', email: 'nabil@kameradigjitale.local', role: 'editor', active: true },
  { id: 'usr-003', name: 'Sadia Noor', email: 'sadia@kameradigjitale.local', role: 'support', active: true }
]

export const seedOrders: Order[] = [
  {
    id: 'ord-1001',
    customerName: 'Tanvir Hasan',
    phone: '+8801700000000',
    address: 'Dhanmondi, Dhaka',
    itemsSummary: 'Canon AE-1 Program ×1, Kodak Portra 400 ×2',
    total: 548,
    paymentMethod: 'Cash on Delivery',
    status: 'New',
    createdAt: '2026-04-22'
  },
  {
    id: 'ord-1002',
    customerName: 'Mahi Rahman',
    phone: '+8801800000000',
    address: 'Banani, Dhaka',
    itemsSummary: 'Sony 24-70mm F2.8 GM ×1',
    total: 1899,
    paymentMethod: 'Cash on Delivery',
    status: 'Out for delivery',
    createdAt: '2026-04-23'
  }
]
