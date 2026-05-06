export type AdminUserRole = 'admin' | 'editor' | 'support'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminUserRole
  active: boolean
}

export type OrderStatus = 'New' | 'Paid' | 'Packed' | 'Out for delivery' | 'Delivered' | 'Cancelled'

export type Order = {
  id: string
  orderNumber: string
  customerName: string
  email: string
  phone: string
  address: string
  itemsSummary: string
  total: number
  paymentMethod: 'Cash on Delivery'
  status: OrderStatus
  createdAt: string
}
