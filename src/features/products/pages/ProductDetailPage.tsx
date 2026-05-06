import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../../../data/products'
import { api } from '../../../lib/api'
import { useNotifications } from '../../notifications/notificationContext'

type ProductDetailPageProps = {
  products: Product[]
  onAddToCart: (id: string) => void
}

export function ProductDetailPage({ products, onAddToCart }: ProductDetailPageProps) {
  const { productCode } = useParams<{ productCode: string }>()
  const fallbackProduct = useMemo(
    () => products.find((item) => item.productCode === productCode),
    [products, productCode],
  )
  const [product, setProduct] = useState<Product | undefined>(fallbackProduct)
  const [activeImage, setActiveImage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { notifyError } = useNotifications()

  useEffect(() => {
    if (!productCode) return

    let ignore = false
    setIsLoading(true)
    setError('')

    api
      .getProductByCode(productCode)
      .then((response) => {
        if (!ignore) {
          setProduct(response)
          setActiveImage(0)
        }
      })
      .catch((requestError) => {
        if (!ignore) {
          const message = requestError instanceof Error ? requestError.message : 'Unable to load product'
          setProduct(fallbackProduct)
          setError(message)
          notifyError(message, { title: 'Product detail error' })
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [fallbackProduct, notifyError, productCode])

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="rounded-xl bg-white p-5 shadow-playful">
          {isLoading ? 'Loading product...' : 'Product not found. Please return to the catalog.'}
        </p>
      </main>
    )
  }

  const gallery = product.gallery?.length ? product.gallery : [product.image]

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
      {error && product ? (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Showing cached product while backend detail loads: {error}
        </p>
      ) : null}
      <div className="text-sm text-slate-500">
        <Link to="/" className="hover:text-ink">
          Home
        </Link>{' '}
        /{' '}
        <Link to="/catalog" className="hover:text-ink">
          Categories
        </Link>{' '}
        / <span>{product.category}</span> / <span className="text-slate-700">{product.name}</span>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <article className="grid gap-4 lg:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col">
            {gallery.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => setActiveImage(index)}
                className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border ${activeImage === index ? 'border-ink' : 'border-slate-200'}`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="order-1 rounded-2xl bg-white p-4 shadow-playful lg:order-2">
            <img src={gallery[activeImage]} alt={product.name} className="h-[28rem] w-full rounded-xl object-cover" />
          </div>
        </article>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-playful">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">In stock online: {product.stock}</p>
          <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-500">Product code: {product.productCode}</p>
          <p className="text-4xl font-black text-ink">${product.price}</p>
          <p className="text-sm text-slate-600">{product.description}</p>
          <button
            onClick={() => onAddToCart(product.id)}
            className="w-full rounded-xl bg-ink px-4 py-3 font-bold text-white"
          >
            Add to cart
          </button>
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-slate-700">
            <p className="font-semibold">Condition</p>
            <p>Certified and inspected by our staff before listing.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-8 rounded-2xl bg-white p-6 shadow-playful lg:grid-cols-[1.1fr_1fr]">
        <article>
          <h2 className="mb-3 text-2xl font-black">{product.name}</h2>
          <p className="mb-3 text-slate-700">{product.description}</p>
          <ul className="list-disc space-y-1 pl-5 text-slate-600">
            <li>Carefully cleaned and tested in store.</li>
            <li>Ready for immediate local shipping or pickup.</li>
            <li>More photos can be attached from admin dashboard.</li>
          </ul>
        </article>
        <article>
          <h3 className="mb-3 text-xl font-black">Model Specifications</h3>
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
            {(product.specs?.length
              ? product.specs
              : [
                  { label: 'Brand', value: 'TBD' },
                  { label: 'Type', value: product.category },
                  {
                    label: 'Details',
                    value: 'Specifications will be added from admin panel.',
                  },
                ]
            ).map((spec) => (
              <div key={spec.label} className="grid grid-cols-2 gap-4 px-4 py-2 text-sm">
                <p className="font-semibold text-slate-700">{spec.label}</p>
                <p className="text-slate-600">{spec.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
