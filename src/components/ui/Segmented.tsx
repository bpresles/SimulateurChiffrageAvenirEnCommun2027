interface Option<T extends string | number> {
  valeur: T
  label: string
}

interface Props<T extends string | number> {
  legende: string
  options: Option<T>[]
  valeur: T
  onChange: (v: T) => void
}

/** Contrôle segmenté accessible (groupe de boutons à bascule). */
export function Segmented<T extends string | number>({ legende, options, valeur, onChange }: Props<T>) {
  return (
    <div role="group" aria-label={legende} className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {options.map((o) => {
        const actif = o.valeur === valeur
        return (
          <button
            key={String(o.valeur)}
            type="button"
            aria-pressed={actif}
            onClick={() => onChange(o.valeur)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              actif ? 'bg-brand text-on-brand' : 'text-ink-soft hover:bg-brand-soft'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
