import { useRef, type KeyboardEvent } from 'react'
import { ONGLETS, type Onglet } from '../../state/useSimulationParams'

export const idOnglet = (o: Onglet) => `onglet-${o}`
export const idPanneau = (o: Onglet) => `panneau-${o}`

export function Onglets({ actif, onChange }: { actif: Onglet; onChange: (o: Onglet) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})

  const surTouche = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let cible = -1
    if (e.key === 'ArrowRight') cible = (i + 1) % ONGLETS.length
    else if (e.key === 'ArrowLeft') cible = (i - 1 + ONGLETS.length) % ONGLETS.length
    else if (e.key === 'Home') cible = 0
    else if (e.key === 'End') cible = ONGLETS.length - 1
    if (cible >= 0) {
      e.preventDefault()
      const o = ONGLETS[cible].id
      onChange(o)
      refs.current[o]?.focus()
    }
  }

  return (
    <div className="relative">
    <div role="tablist" aria-label="Sections du simulateur" className="-mb-px flex gap-1 overflow-x-auto pr-10 md:pr-0">
      {ONGLETS.map((o, i) => {
        const sel = o.id === actif
        return (
          <button
            key={o.id}
            ref={(el) => { refs.current[o.id] = el }}
            id={idOnglet(o.id)}
            role="tab"
            type="button"
            aria-selected={sel}
            aria-controls={idPanneau(o.id)}
            tabIndex={sel ? 0 : -1}
            onClick={() => onChange(o.id)}
            onKeyDown={(e) => surTouche(e, i)}
            className={`whitespace-nowrap rounded-t-lg border-b-4 px-3.5 py-2.5 text-sm font-semibold transition-colors ${
              sel ? 'border-white bg-white/15 text-white' : 'border-transparent text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-entete to-transparent md:hidden" />
    </div>
  )
}
