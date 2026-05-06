import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  normalizeSubcategory,
  type CategoryNavigationMap,
  type MenuItem,
  type NavSubcategory,
} from '../../../data/navigation'
import logo2 from '../../../assets/kamera_digjitale_logo_transparent.png'

type NavBarProps = {
  cartCount: number
  categoryNavigation: CategoryNavigationMap
  menuItems: MenuItem[]
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-mint ${
    isActive ? 'bg-white/10 text-mint' : 'text-white/90'
  }`

const subcategoryPath = (item: MenuItem, subcategory: NavSubcategory) =>
  `${item.path}?subcategory=${encodeURIComponent(normalizeSubcategory(subcategory.title) ?? '')}`

export function NavBar({ cartCount, categoryNavigation, menuItems }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const location = useLocation()

  const categoryItems = useMemo(() => menuItems.filter((item) => item.category), [menuItems])
  const utilityItems = useMemo(() => menuItems.filter((item) => !item.category), [menuItems])

  useEffect(() => {
    setMobileMenuOpen(false)
    setOpenCategory(null)
  }, [location.pathname, location.search])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white shadow-playful backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 xl:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center transition hover:-translate-y-0.5"
            aria-label="Kamera Digjitale home"
          >
            <img src={logo2} alt="Kamera Digjitale" className="h-8 w-auto object-contain" />
          </Link>

          <nav
            className="hidden flex-1 items-center justify-center gap-1 text-sm font-bold xl:flex"
            aria-label="Primary navigation"
          >
            {utilityItems.slice(0, 1).map((item) => (
              <NavLink key={item.label} to={item.path} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}

            {categoryItems.map((item) => {
              const subcategories = item.category ? (categoryNavigation[item.category] ?? []) : []

              return (
                <div key={item.label} className="group">
                  <NavLink to={item.path} className={navLinkClass}>
                    {item.label}
                  </NavLink>

                  {subcategories.length > 0 ? (
                    <div className="pointer-events-none absolute left-1/2 top-full z-50 w-[min(64rem,calc(100vw-3rem))] -translate-x-1/2 pt-4 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white text-slate-900 shadow-2xl">
                        <div className="grid gap-0 xl:grid-cols-[0.8fr_2.2fr]">
                          <div className="bg-gradient-to-br from-mint via-white to-amber-100 p-6">
                            <p className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                              Explore {item.label}
                            </p>
                            <h2 className="mt-4 text-2xl font-black leading-tight text-ink">
                              Shop by style, format, and workflow.
                            </h2>
                            <p className="mt-3 text-sm font-semibold text-slate-700">
                              Fresh subcategories are synced from the backend navigation API.
                            </p>
                          </div>

                          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                            {subcategories.map((subcategory) => (
                              <Link
                                key={subcategory.id}
                                to={subcategoryPath(item, subcategory)}
                                className="group/card rounded-2xl p-2 transition hover:bg-slate-100"
                              >
                                <div className="overflow-hidden rounded-xl bg-slate-100">
                                  <img
                                    src={subcategory.image}
                                    alt={subcategory.title}
                                    className="h-32 w-full object-cover transition duration-300 group-hover/card:scale-105"
                                  />
                                </div>
                                <p className="mt-2 font-black text-slate-900">{subcategory.title}</p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}

            {utilityItems.slice(1).map((item) => (
              <NavLink key={item.label} to={item.path} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <NavLink
              to="/order-lookup"
              className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-mint sm:inline-flex"
            >
              Order Status
            </NavLink>

            <NavLink
              to="/checkout"
              className="rounded-full border border-white/15 px-3 py-2 text-sm font-black text-white/90 transition hover:border-mint hover:text-mint"
            >
              Cart <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-ink">{cartCount}</span>
            </NavLink>

            <NavLink
              to="/admin"
              className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-mint sm:inline-flex"
            >
              Admin
            </NavLink>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-xl font-black transition hover:border-mint hover:text-mint xl:hidden"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? '×' : '☰'}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div id="mobile-navigation" className="xl:hidden">
            <div className="mt-4 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-[1.75rem] border border-white/10 bg-white p-3 text-ink shadow-2xl">
              <nav className="space-y-2" aria-label="Mobile navigation">
                {menuItems.map((item) => {
                  const subcategories = item.category ? (categoryNavigation[item.category] ?? []) : []
                  const expanded = openCategory === item.label

                  if (subcategories.length === 0) {
                    return (
                      <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition ${
                            isActive ? 'bg-mint text-ink' : 'bg-slate-50 hover:bg-amber-100'
                          }`
                        }
                      >
                        {item.label}
                        <span aria-hidden="true">→</span>
                      </NavLink>
                    )
                  }

                  return (
                    <div key={item.label} className="rounded-2xl bg-slate-50 p-2">
                      <div className="flex items-center gap-2">
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `flex-1 rounded-xl px-3 py-2 text-sm font-black transition ${
                              isActive ? 'bg-mint text-ink' : 'hover:bg-white'
                            }`
                          }
                        >
                          {item.label}
                        </NavLink>

                        <button
                          type="button"
                          className="h-10 w-10 rounded-xl bg-white text-lg font-black shadow-sm transition hover:bg-amber-100"
                          aria-expanded={expanded}
                          aria-label={`${expanded ? 'Hide' : 'Show'} ${item.label} subcategories`}
                          onClick={() => setOpenCategory(expanded ? null : item.label)}
                        >
                          {expanded ? '−' : '+'}
                        </button>
                      </div>

                      {expanded ? (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              to={subcategoryPath(item, subcategory)}
                              className="flex items-center gap-3 rounded-xl bg-white p-2 shadow-sm transition hover:bg-amber-50"
                            >
                              <img src={subcategory.image} alt="" className="h-14 w-16 rounded-lg object-cover" />
                              <span className="text-sm font-black text-slate-900">{subcategory.title}</span>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )
                })}

                <NavLink
                  to="/order-lookup"
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition sm:hidden ${
                      isActive ? 'bg-mint text-ink' : 'bg-slate-50 hover:bg-amber-100'
                    }`
                  }
                >
                  Order Status
                  <span aria-hidden="true">→</span>
                </NavLink>

                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-black transition sm:hidden ${
                      isActive ? 'bg-mint text-ink' : 'bg-slate-50 hover:bg-amber-100'
                    }`
                  }
                >
                  Admin
                  <span aria-hidden="true">→</span>
                </NavLink>
              </nav>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}