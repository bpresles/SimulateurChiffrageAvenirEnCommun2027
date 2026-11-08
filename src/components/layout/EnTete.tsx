import { Scale } from 'lucide-react'
import { fmtMd } from '../../lib/format'
import type { Onglet } from '../../state/useSimulationParams'
import { Onglets } from './Onglets'

interface Props {
  onglet: Onglet
  onChange: (o: Onglet) => void
  solde: number
  horizonLabel: string
}

export function EnTete({ onglet, onChange, solde, horizonLabel }: Props) {
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="flex items-center gap-3">
            <Scale aria-hidden="true" className="h-7 w-7" />
            <div>
              <p className="text-lg font-extrabold leading-tight sm:text-xl">Simulateur budgétaire</p>
              <p className="text-xs text-white/80 sm:text-sm">Outil pédagogique d’exploration d’un chiffrage</p>
            </div>
          </div>
          <p className="rounded-lg bg-white/10 px-3 py-1.5 text-sm" aria-live="polite">
            <span className="text-white/80">Solde calculé ({horizonLabel}) : </span>
            <strong className="nombre">{fmtMd(solde, { signe: true })}/an</strong>
          </p>
        </div>
        <Onglets actif={onglet} onChange={onChange} />
      </div>
    </header>
  )
}
