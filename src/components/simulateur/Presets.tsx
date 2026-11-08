import { SCENARIOS, type CleScenario } from '../../data/scenarios'
import { fmtMd } from '../../lib/format'
import { aUneVariante } from '../../model/presets'
import { BoutonReinitialiser } from '../ui/BoutonReinitialiser'
import { Segmented } from '../ui/Segmented'

interface Props {
  actif: CleScenario | 'personnalise'
  sansLeviers: boolean
  soldes: Record<CleScenario, number>
  soldesSans: Record<CleScenario, number>
  onChoisir: (c: CleScenario) => void
  onChangerLeviers: (sans: boolean) => void
  onReinitialiser: () => void
  reinitialisable: boolean
}

const ton = (v: number) => (v >= 0 ? 'text-positif' : 'text-negatif')

export function Presets({ actif, sansLeviers, soldes, soldesSans, onChoisir, onChangerLeviers, onReinitialiser, reinitialisable }: Props) {
  const libelleActif = (() => {
    if (actif === 'personnalise') return null
    const base = SCENARIOS.find((s) => s.cle === actif)!.libelle
    return aUneVariante(actif) && sansLeviers ? `${base} (sans leviers monétaires)` : base
  })()
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h3 className="text-sm font-bold">Préréglages</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" id="switch-leviers">Leviers monétaires</span>
          <Segmented<'avec' | 'sans'>
            legende="Leviers monétaires : avec ou sans"
            valeur={sansLeviers ? 'sans' : 'avec'}
            onChange={(v) => onChangerLeviers(v === 'sans')}
            options={[{ valeur: 'avec', label: 'Avec' }, { valeur: 'sans', label: 'Sans' }]}
          />
        </div>
        {actif === 'personnalise' ? (
          <span className="rounded-full bg-neutre-soft px-2 py-0.5 text-xs font-semibold text-ink-soft">Personnalisé</span>
        ) : (
          <span className="text-xs text-ink-soft">Actif : <strong className="text-ink">{libelleActif}</strong></span>
        )}
        <BoutonReinitialiser onClick={onReinitialiser} actif={reinitialisable} />
      </div>
      <p className="mb-3 text-xs text-ink-soft">
        « Sans » met à 0 le gel BCE, l’emprunt primaire et le circuit du Trésor ; les autres paramètres sont inchangés. La CADES est conservée : c’est une mesure budgétaire nationale sourcée (S6), qui ne dépend ni de la BCE ni des marchés.
        L’interrupteur est sans effet sur « Stress-test », qui n’utilise aucun levier.
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SCENARIOS.map((s) => {
          const sel = s.cle === actif
          const variante = aUneVariante(s.cle)
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
              {variante ? (
                <span className="mt-2 flex flex-col gap-0.5 text-xs text-ink-soft">
                  <span className={sansLeviers ? '' : 'font-bold text-ink'}>
                    Avec leviers : <span className={`nombre text-sm ${ton(soldes[s.cle])} ${sansLeviers ? '' : 'font-bold'}`}>{fmtMd(soldes[s.cle], { signe: true })}</span>
                  </span>
                  <span className={sansLeviers ? 'font-bold text-ink' : ''}>
                    Sans : <span className={`nombre text-sm ${ton(soldesSans[s.cle])} ${sansLeviers ? 'font-bold' : ''}`}>{fmtMd(soldesSans[s.cle], { signe: true })}</span>
                  </span>
                </span>
              ) : (
                <span className="mt-2 text-xs text-ink-soft">
                  Solde calculé :{' '}
                  <strong className={`nombre text-sm ${ton(soldes[s.cle])}`}>{fmtMd(soldes[s.cle], { signe: true })}</strong>
                  <span className="block">Sans variante : l’interrupteur est sans effet.</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
