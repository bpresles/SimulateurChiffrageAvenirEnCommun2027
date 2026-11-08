import { SCENARIOS, type CleScenario } from '../../data/scenarios'
import { fmtMd } from '../../lib/format'

interface Props {
  actif: CleScenario | 'personnalise'
  soldes: Record<CleScenario, number>
  onChoisir: (c: CleScenario) => void
}

export function Presets({ actif, soldes, onChoisir }: Props) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-bold">Préréglages</h3>
        {actif === 'personnalise' && (
          <span className="rounded-full bg-neutre-soft px-2 py-0.5 text-xs font-semibold text-ink-soft">Personnalisé</span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => {
          const sel = s.cle === actif
          return (
            <button
              key={s.cle}
              type="button"
              aria-pressed={sel}
              onClick={() => onChoisir(s.cle)}
              className={`flex flex-col justify-between rounded-lg border-2 p-3 text-left transition-colors ${
                sel ? 'border-brand bg-brand-soft' : 'border-line bg-surface hover:border-brand/50'
              }`}
            >
              <span className="text-sm font-bold">{s.libelle}</span>
              <span className="mt-1 text-xs text-ink-soft">{s.description}</span>
              <span className="mt-2 text-xs text-ink-soft">
                Solde calculé :{' '}
                <strong className={`nombre text-sm ${soldes[s.cle] >= 0 ? 'text-positif' : 'text-negatif'}`}>
                  {fmtMd(soldes[s.cle], { signe: true })}
                </strong>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
