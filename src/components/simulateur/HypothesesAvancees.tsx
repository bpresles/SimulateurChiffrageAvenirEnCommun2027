import { HYPOTHESES } from '../../data/hypotheses'
import { fmtNombre, fmtPct, fmtValeurUnite } from '../../lib/format'
import type { SimulationParams } from '../../model/types'
import { Badge } from '../ui/Badge'
import { Slider } from '../ui/Slider'

interface Props {
  params: SimulationParams
  rho: number
  setRho: (v: number) => void
  setParam: <K extends keyof SimulationParams>(c: K, v: SimulationParams[K]) => void
}

export function HypothesesAvancees({ params, rho, setRho, setParam }: Props) {
  const lecture = ['tauxBonification', 'risqueSpread', 'pib2026', 'deficitTendanciel', 'dette2026', 'stockBce'] as const
  return (
    <details className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <summary className="cursor-pointer text-base font-bold">Hypothèses avancées</summary>
      <div className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
        <div>
          <Slider
            label="Retours sur dépenses courantes (année pleine)"
            valeur={params.retoursCourantsBase} min={0} max={40} pas={1}
            onChange={(v) => setParam('retoursCourantsBase', v)}
            affichage={`${fmtNombre(params.retoursCourantsBase, 0)} Md€`}
            texteVocal={`${params.retoursCourantsBase} milliards d'euros`}
            badge={<Badge statut="hypothese-non-sourcee" court />}
            aide="Valeur d’origine : 14. Proportionnel au multiplicateur, réduit en An 1."
          />
          <Slider
            label="Croissance nominale tendancielle du PIB"
            valeur={params.croissanceNominalePct} min={0} max={5} pas={0.1}
            onChange={(v) => setParam('croissanceNominalePct', v)}
            affichage={fmtPct(params.croissanceNominalePct)}
            texteVocal={`${fmtNombre(params.croissanceNominalePct)} pour cent par an`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Croissance nominale du PIB (réelle + inflation) dans les trajectoires. N’affecte pas le solde en Md€, seulement les ratios en % du PIB."
          />
          <Slider
            label="Corrélation entre filières (Monte-Carlo, ρ)"
            valeur={rho} min={0} max={0.95} pas={0.05}
            onChange={setRho}
            affichage={fmtNombre(rho, 2)}
            texteVocal={`ρ égal à ${fmtNombre(rho, 2)}`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="0 : filières indépendantes ; proche de 1 : elles évoluent ensemble."
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold">Paramètres en lecture seule</h3>
          <ul className="space-y-1.5 text-sm">
            {lecture.map((k) => (
              <li key={k} className="flex flex-wrap items-center justify-between gap-2">
                <span>{HYPOTHESES[k].libelle}</span>
                <span className="flex items-center gap-2">
                  <span className="nombre font-medium">
                    {k === 'tauxBonification' ? '8 %' : fmtValeurUnite(HYPOTHESES[k].valeur, HYPOTHESES[k].unite)}
                  </span>
                  <Badge statut={HYPOTHESES[k].statut} court />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
