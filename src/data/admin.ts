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
