import type { Product } from '../data/products'
import { ProductCard } from '../components/ProductCard'

type HomePageProps = {
  products: Product[]
  onAddToCart: (id: string) => void
}

export function HomePage({ products, onAddToCart }: HomePageProps) {
  const featured = products.filter((product) => product.featured)

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-6 py-8">
      <section className="grid gap-6 rounded-3xl bg-gradient-to-br from-ink to-slate-900 p-8 text-white md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <p className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">Local Camera Store</p>
          <h1 className="text-4xl font-black leading-tight">Capture your next story with playful camera gear.</h1>
          <p className="max-w-xl text-sm text-slate-200">
            Browse digital, film, lenses, and accessories in one joyful experience. Built for local shoppers with easy cash-on-delivery checkout.
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
          <h2 className="mb-3 text-lg font-bold">Why customers love this shop</h2>
          <ul className="space-y-2 text-sm text-slate-100">
            <li>📦 Fast local delivery + payment on delivery</li>
            <li>📸 Real images and carefully checked products</li>
            <li>🛠 Friendly support for beginners and pros</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black text-slate-900">Featured Products</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>
    </main>
  )
}
