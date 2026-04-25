type StaticPageProps = {
  title: string
  description: string
  bullets: readonly string[]
}

export function StaticPage({ title, description, bullets }: StaticPageProps) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <section className="rounded-2xl bg-white p-8 shadow-playful">
        <h1 className="mb-3 text-3xl font-black">{title}</h1>
        <p className="text-slate-700">{description}</p>
        <ul className="mt-5 space-y-2 text-sm text-slate-700">
          {bullets.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
