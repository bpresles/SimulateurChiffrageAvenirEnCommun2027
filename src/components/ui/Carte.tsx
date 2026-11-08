import type { ReactNode } from 'react'

export function Carte({ titre, children, className = '', actions }: { titre?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={`rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5 ${className}`}>
      {(titre || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {titre && <h2 className="text-base font-bold text-ink">{titre}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export function Avertissement({ children, titre }: { children: ReactNode; titre?: string }) {
  return (
    <div role="note" className="rounded-lg border border-attention/40 bg-attention-soft p-3 text-sm text-ink">
      {titre && <p className="mb-1 font-bold text-attention">{titre}</p>}
      {children}
    </div>
  )
}
