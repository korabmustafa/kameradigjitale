import type { Product } from '../data/products'
import { ProductCard } from '../components/ProductCard'

type CatalogPageProps = {
  products: Product[]
  onAddToCart: (id: string) => void
}

export function CatalogPage({ products, onAddToCart }: CatalogPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mb-5 text-3xl font-black text-slate-900">Browse Cameras & Accessories</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </main>
  )
}
