export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated: 3 October 2026</p>
      <div className="mt-8 space-y-8 text-sm leading-6 text-zinc-700">{children}</div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}
