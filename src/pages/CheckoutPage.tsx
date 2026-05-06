import { FormEvent, useMemo, useState } from 'react'
import { api } from '../lib/api'
import type { Order } from '../data/admin'
import type { Product } from '../data/products'
import { useNotifications } from '../features/notifications/notificationContext'

type CheckoutPageProps = {
  cart: Record<string, number>
  products: Product[]
  onOrderCreated: (order: Order) => void
}

export function CheckoutPage({ cart, products, onOrderCreated }: CheckoutPageProps) {
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { notifyError } = useNotifications()

  const cartItems = useMemo(
    () =>
      products
        .filter((product) => cart[product.id])
        .map((product) => ({ ...product, quantity: cart[product.id] })),
    [cart, products]
  )

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    if (!customerName || !email || !phone || !address || cartItems.length === 0) {
      const validationMessage = 'Please complete all fields and keep at least one product in your cart.'
      setMessage(validationMessage)
      notifyError(validationMessage, { title: 'Checkout validation error' })
      return
    }

    try {
      setSubmitting(true)
      const order = await api.createOrder({
        customerName,
        email,
        phone,
        address,
        items: cartItems.map((item) => ({ productCode: item.productCode, quantity: item.quantity }))
      })
      onOrderCreated(order)
      setMessage(`Order placed successfully. Your order number is ${order.orderNumber}. We also sent it to ${order.email}.`)
      setCustomerName('')
      setEmail('')
      setPhone('')
      setAddress('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not place order at this time.'
      setMessage(errorMessage)
      notifyError(errorMessage, { title: 'Checkout error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl bg-white p-6 shadow-playful">
        <h1 className="mb-4 text-2xl font-black">Checkout (Payment on Delivery)</h1>
        <p className="mb-5 text-sm text-slate-600">No online payments needed. Confirm your address and pay when your package arrives.</p>

        <form className="grid gap-3" onSubmit={handleSubmit}>
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}
          <button type="submit" disabled={submitting} className="mt-3 rounded-xl bg-ink px-4 py-3 font-bold text-white disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Confirm Cash-on-Delivery Order'}
          </button>
        </form>
      </section>

      <aside className="rounded-2xl bg-white p-6 shadow-playful">
        <h2 className="mb-4 text-lg font-bold">Your order</h2>
        <div className="space-y-2 text-sm">
          {cartItems.length === 0 && <p>Your cart is empty.</p>}
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between gap-4">
              <span>{item.name} × {item.quantity}</span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4 text-lg font-black">Total: ${total}</div>
      </aside>
    </main>
  )
}
