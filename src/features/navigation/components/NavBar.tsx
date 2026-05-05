import { Link, NavLink } from 'react-router-dom'
import type { CategoryNavigationMap, MenuItem } from '../../../data/navigation'

type NavBarProps = {
  cartCount: number
  categoryNavigation: CategoryNavigationMap
  menuItems: MenuItem[]
}

export function NavBar({ cartCount, categoryNavigation, menuItems }: NavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-ink text-white shadow-playful">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
        <Link to="/" className="mr-2 rounded-full bg-accent px-4 py-1.5 text-sm font-black text-ink">
          Kamera Digjitale
        </Link>

        <nav className="flex flex-1 flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {menuItems.map((item) => {
            const subcategories = item.category ? categoryNavigation[item.category] ?? [] : []

            return (
              <div key={item.label} className="group relative">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `inline-block transition hover:text-mint ${isActive ? 'text-mint underline underline-offset-4' : ''}`
                  }
                >
                  {item.label}
                </NavLink>

                {item.category && subcategories.length > 0 ? (
                  <div className="pointer-events-none absolute left-0 top-full mt-3 w-[68rem] max-w-[calc(100vw-3rem)] translate-y-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl border border-slate-800 bg-white/95 p-5 text-slate-900 shadow-2xl backdrop-blur">
                      <p className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-500">Explore {item.label}</p>
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`${item.path}?subcategory=${encodeURIComponent(subcategory.title)}`}
                            className="group/card block"
                          >
                            <div className="overflow-hidden rounded-xl bg-slate-100">
                              <img
                                src={subcategory.image}
                                alt={subcategory.title}
                                className="h-36 w-full object-cover transition duration-300 group-hover/card:scale-105"
                              />
                            </div>
                            <p className="mt-2 font-bold text-slate-900">{subcategory.title}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}

          <NavLink to="/checkout" className="transition hover:text-mint">
            Checkout ({cartCount})
          </NavLink>
          <NavLink to="/admin" className="transition hover:text-mint">
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
