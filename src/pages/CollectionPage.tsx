import type { Product } from '../data/products'
import { ProductCard } from '../components/ProductCard'

type CollectionPageProps = {
  title: string
  subtitle: string
  products: Product[]
  onAddToCart: (id: string) => void
}

export function CollectionPage({ title, subtitle, products, onAddToCart }: CollectionPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-black text-slate-900">{title}</h1>
      <p className="mb-5 mt-2 text-sm text-slate-600">{subtitle}</p>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-slate-700 shadow-playful">
            No products yet in this collection. Add one from the Admin dashboard.
          </p>
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)
        )}
      </div>
    </main>
  )
}
