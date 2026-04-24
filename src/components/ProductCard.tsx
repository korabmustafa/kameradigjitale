import type { Product } from '../data/products'

type ProductCardProps = {
  product: Product
  onAddToCart: (id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-playful">
      <img src={product.image} alt={product.name} className="h-56 w-full object-cover transition group-hover:scale-105" />
      <div className="space-y-3 p-4">
        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {product.category}
        </span>
        <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
        <p className="text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-black text-ink">${product.price}</p>
          <button
            onClick={() => onAddToCart(product.id)}
            className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  )
}
