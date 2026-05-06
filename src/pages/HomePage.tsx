import type { Product } from '../data/products'
import { ProductCard } from '../features/products/components/ProductCard'
import desktopHome from '../assets/desktop-home.png'
import mobileHome from '../assets/mobile-home.png'

type HomePageProps = {
  products: Product[]
  onAddToCart: (id: string) => void
}

export function HomePage({ products, onAddToCart }: HomePageProps) {
  const featured = products.filter((product) => product.featured)

  return (
    <main className="space-y-10 py-8">
      <section className="mx-auto w-full max-w-[1700px] px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl">
          <picture>
            <source media="(max-width: 767px)" srcSet={mobileHome} />
            <img
              src={desktopHome}
              alt="Local Camera Store homepage banner"
              className="h-auto w-full object-cover"
            />
          </picture>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1650px] px-4 sm:px-6">
        <h2 className="mb-4 text-2xl font-black text-slate-900">
          Featured Products
        </h2>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    </main>
  )
}