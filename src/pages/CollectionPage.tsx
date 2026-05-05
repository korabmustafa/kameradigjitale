import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../features/products/components/ProductCard'
import type { Product } from '../data/products'


const normalizeSubcategory = (value?: string | null) =>
  value
    ?.trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

type CollectionPageProps = {
  title: string
  subtitle: string
  products: Product[]
  onAddToCart: (id: string) => void
}

export function CollectionPage({ title, subtitle, products, onAddToCart }: CollectionPageProps) {
  const [query, setQuery] = useState('')
  const [searchParams] = useSearchParams()
  const selectedSubcategory = normalizeSubcategory(searchParams.get('subcategory'))

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const target = `${product.name} ${product.description}`.toLowerCase()
        const matchesQuery = target.includes(query.toLowerCase())
        const productSubcategory = normalizeSubcategory(product.subcategory)
        const matchesSubcategory = !selectedSubcategory || productSubcategory === selectedSubcategory
        return matchesQuery && matchesSubcategory
      }),
    [products, query, selectedSubcategory]
  )

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="text-3xl font-black text-slate-900">{title}</h1>
      <p className="mb-5 mt-2 text-sm text-slate-600">{subtitle}</p>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-playful">
        <label htmlFor="camera-search" className="mb-2 block text-sm font-semibold text-slate-700">
          Search cameras
        </label>
        <input
          id="camera-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by model, brand, or keyword..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.length === 0 ? (
          <p className="rounded-xl bg-white p-5 text-slate-700 shadow-playful">No products match your search yet.</p>
        ) : (
          filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />)
        )}
      </div>
    </main>
  )
}
