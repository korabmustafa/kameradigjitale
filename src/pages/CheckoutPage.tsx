import type { Product } from '../data/products'

type CheckoutPageProps = {
  cart: Record<string, number>
  products: Product[]
}

export function CheckoutPage({ cart, products }: CheckoutPageProps) {
  const cartItems = products
    .filter((product) => cart[product.id])
    .map((product) => ({ ...product, quantity: cart[product.id] }))

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[1.2fr_1fr]">
      <section className="rounded-2xl bg-white p-6 shadow-playful">
        <h1 className="mb-4 text-2xl font-black">Checkout (Payment on Delivery)</h1>
        <p className="mb-5 text-sm text-slate-600">
          No online payments needed. Confirm your address and pay when your package arrives.
        </p>

        <form className="grid gap-3">
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Full name" />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Phone number" />
          <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Delivery address" />
          <textarea className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Order notes (optional)" rows={4} />
          <button type="button" className="mt-3 rounded-xl bg-ink px-4 py-3 font-bold text-white">
            Confirm Cash-on-Delivery Order
          </button>
        </form>
      </section>

      <aside className="rounded-2xl bg-white p-6 shadow-playful">
        <h2 className="mb-4 text-lg font-bold">Your order</h2>
        <div className="space-y-2 text-sm">
          {cartItems.length === 0 && <p>Your cart is empty.</p>}
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t pt-4 text-lg font-black">Total: ${total}</div>
      </aside>
    </main>
  )
}
