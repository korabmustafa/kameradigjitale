import { FormEvent, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Order } from '../data/admin'
import { api } from '../lib/api'
import { useNotifications } from '../features/notifications/notificationContext'

export function OrderLookupPage() {
  const [searchParams] = useSearchParams()
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber')?.toUpperCase() ?? '')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { notifyError } = useNotifications()

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setMessage('')
    setOrder(null)

    if (!orderNumber.trim() || !email.trim()) {
      const validationMessage = 'Enter the order number from your email and the email address used at checkout.'
      setMessage(validationMessage)
      notifyError(validationMessage, { title: 'Order lookup validation error' })
      return
    }

    try {
      setLoading(true)
      const result = await api.lookupOrder({ orderNumber: orderNumber.trim(), email: email.trim() })
      setOrder(result)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Could not find that order.'
      setMessage(errorMessage)
      notifyError(errorMessage, { title: 'Order lookup error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <section className="rounded-2xl bg-white p-6 shadow-playful">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral">Order tracking</p>
        <h1 className="mt-2 text-3xl font-black">Look up your order status</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use the order number sent to your email after checkout together with the same email address to see the latest status.
        </p>

        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSubmit}>
          <input
            className="rounded-lg border border-slate-200 px-3 py-2 uppercase"
            placeholder="Order number (KD-...)"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
          />
          <input
            className="rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" disabled={loading} className="rounded-xl bg-ink px-5 py-2 font-bold text-white disabled:opacity-60">
            {loading ? 'Checking...' : 'Check status'}
          </button>
        </form>

        {message ? <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{message}</p> : null}

        {order ? (
          <article className="mt-6 rounded-2xl border border-slate-200 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Order number</p>
                <h2 className="text-2xl font-black">{order.orderNumber}</h2>
                <p className="mt-2 text-sm text-slate-600">Placed by {order.customerName}</p>
              </div>
              <span className="rounded-full bg-mint px-4 py-2 text-sm font-black text-ink">{order.status}</span>
            </div>

            <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-bold text-slate-500">Items</dt>
                <dd className="mt-1 text-slate-800">{order.itemsSummary}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Delivery address</dt>
                <dd className="mt-1 text-slate-800">{order.address}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Payment</dt>
                <dd className="mt-1 text-slate-800">{order.paymentMethod}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Total</dt>
                <dd className="mt-1 text-slate-800">${order.total}</dd>
              </div>
            </dl>
          </article>
        ) : null}
      </section>
    </main>
  )
}
