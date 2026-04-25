import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-slate-600">
        <p>© 2026 Kamera Digjitale. Curated camera gear for local creators.</p>
        <div className="flex gap-4">
          <Link to="/info" className="transition hover:text-ink">
            Info
          </Link>
          <Link to="/condition" className="transition hover:text-ink">
            Condition Guide
          </Link>
          <Link to="/sell" className="transition hover:text-ink">
            Sell Gear
          </Link>
        </div>
      </div>
    </footer>
  )
}
