import { Link } from 'react-router-dom'
import type { Product } from '../../../data/products'

type CartDrawerProps = {
  open: boolean
  cart: Record<string, number>
  products: Product[]
  onClose: () => void
}

export function CartDrawer({ open, cart, products, onClose }: CartDrawerProps) {
  const cartItems = products
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, quantity: cart[product.id] }))

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Cart side panel">
      <button className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-label="Close cart panel" />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-xl font-black text-slate-900">Added to cart</h2>
          <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            Close
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <article key={item.id} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    {item.category} · Qty {item.quantity}
                  </p>
                  <p className="mt-1 font-bold text-ink">${item.price * item.quantity}</p>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 p-4">
          <p className="mb-3 text-lg font-black text-slate-900">Subtotal: ${total}</p>
          <div className="grid gap-2">
            <Link
              to="/checkout"
              onClick={onClose}
              className="rounded-xl bg-ink px-4 py-3 text-center font-bold text-white transition hover:bg-slate-700"
            >
              Proceed to checkout
            </Link>
            <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">
              Continue shopping
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
