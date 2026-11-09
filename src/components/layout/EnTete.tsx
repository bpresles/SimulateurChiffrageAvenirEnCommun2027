import { Moon, Scale, Sun } from 'lucide-react'
import { fmtMd } from '../../lib/format'
import type { Theme } from '../../state/useTheme'
import type { Onglet } from '../../state/useSimulationParams'
import { Onglets } from './Onglets'

export const TITRE_APPLICATION = 'Simulateur de chiffrage de l’Avenir en Commun 2027'

interface Props {
  onglet: Onglet
  onChange: (o: Onglet) => void
  solde: number
  theme: Theme
  onBasculerTheme: () => void
}

export function EnTete({ onglet, onChange, solde, theme, onBasculerTheme }: Props) {
  const libelle = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'
  return (
    <header className="bg-entete text-white">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 pb-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <div className="flex min-w-0 items-center gap-3">
            <Scale aria-hidden="true" className="h-7 w-7 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-extrabold leading-tight sm:text-xl">{TITRE_APPLICATION}</h1>
              <p className="text-xs text-white/80 sm:text-sm">Outil pédagogique d’exploration d’un chiffrage</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBasculerTheme}
            aria-label={libelle}
            title={libelle}
            className="order-2 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 sm:order-3"
          >
            {theme === 'dark' ? <Sun aria-hidden="true" className="h-5 w-5" /> : <Moon aria-hidden="true" className="h-5 w-5" />}
          </button>
          <p className="order-3 col-span-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm sm:order-2 sm:col-span-1" aria-live="polite">
            <span className="text-white/80">Solde calculé (année pleine) : </span>
            <strong className="nombre">{fmtMd(solde, { signe: true })}/an</strong>
          </p>
        </div>
        <Onglets actif={onglet} onChange={onChange} />
      </div>
    </header>
  )
}
