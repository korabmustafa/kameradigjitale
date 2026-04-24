import { Link, NavLink } from 'react-router-dom'
import { menuItems } from '../data/navigation'

type NavBarProps = {
  cartCount: number
}

export function NavBar({ cartCount }: NavBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-ink text-white shadow-playful">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
        <Link to="/" className="mr-2 rounded-full bg-accent px-4 py-1.5 text-sm font-black text-ink">
          Kamera Digjitale
        </Link>
        <nav className="flex flex-1 flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `transition hover:text-mint ${isActive ? 'text-mint underline underline-offset-4' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
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
