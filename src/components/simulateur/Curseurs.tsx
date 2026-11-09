import { LEVIERS, type CleLevier } from '../../data/leviers'
import { fmtMd, fmtMult, fmtNombre, fmtPct } from '../../lib/format'
import type { ResultatSimulation, SimulationParams } from '../../model/types'
import { Badge } from '../ui/Badge'
import { Carte } from '../ui/Carte'
import { Slider } from '../ui/Slider'

type SetParam = <K extends keyof SimulationParams>(c: K, v: SimulationParams[K]) => void

interface Props {
  params: SimulationParams
  r: ResultatSimulation
  setParam: SetParam
}

const BadgeJuridique = ({ id }: { id: CleLevier }) => {
  const b = LEVIERS.find((l) => l.id === id)!.badgeJuridique
  const classes = b.ton === 'bce' ? 'border-negatif/40 bg-negatif-soft text-negatif' : 'border-line bg-neutre-soft text-ink-soft'
  return <span className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${classes}`}>{b.texte}</span>
}

export function CurseursEconomie({ params, r, setParam }: Props) {
  const pLabel = params.percentile === 50 ? 'P50, central' : `P${params.percentile}`
  return (
    <Carte titre="Économie réelle">
      <Slider
        label="Volume d’investissement des filières (percentile)"
        valeur={params.percentile} min={10} max={90} pas={5}
        onChange={(v) => setParam('percentile', v)}
        affichage={`${pLabel} (${fmtMd(r.agregat.totalInvest)}/an)`}
        texteVocal={`${pLabel}, soit ${fmtNombre(r.agregat.totalInvest)} milliards d'euros par an`}
        badge={<Badge statut="hypothese-non-sourcee" court />}
        aide="Même percentile appliqué à chaque filière."
      />
      <Slider
        label="Multiplicateur de relocalisation"
        valeur={params.multiplicateur} min={0.8} max={1.8} pas={0.05}
        onChange={(v) => setParam('multiplicateur', v)}
        affichage={fmtMult(params.multiplicateur)}
        texteVocal={`${fmtNombre(params.multiplicateur, 2)} fois`}
        badge={<Badge statut="hypothese-non-sourcee" court />}
        aide={`Retours indirects : ${fmtMd(r.roiIndirect, { signe: true })}.`}
      />
      <Slider
        label="Recettes sociales et fiscales d’année pleine"
        valeur={params.recettesAnneePleinePct} min={0} max={100} pas={5}
        onChange={(v) => setParam('recettesAnneePleinePct', v)}
        affichage={`${fmtPct(params.recettesAnneePleinePct, 0)} (${fmtMd(r.recettesAPNominal)})`}
        texteVocal={`${params.recettesAnneePleinePct} pour cent, soit ${fmtNombre(r.recettesAPNominal)} milliards d'euros avant recouvrement`}
        badge={<Badge statut="hypothese-non-sourcee" court />}
        aide={`Après recouvrement : ${fmtMd(r.recettesAP)}.`}
      />
      <Slider
        label="Recouvrement des recettes du cadrage"
        valeur={params.recouvrementPct} min={55} max={100} pas={1}
        onChange={(v) => setParam('recouvrementPct', v)}
        affichage={`${fmtPct(params.recouvrementPct, 0)} (${fmtMd(r.recettesAn1)})`}
        texteVocal={`${params.recouvrementPct} pour cent, soit ${fmtNombre(r.recettesAn1)} milliards d'euros`}
        badge={<Badge statut="officiel" court />}
        aide="Part des 106,4 Md€ annoncés effectivement perçue."
      />
      <Slider
        label="Multiplicateur récessif des prélèvements nouveaux"
        valeur={params.multiplicateurPrelevements} min={0} max={0.7} pas={0.05}
        onChange={(v) => setParam('multiplicateurPrelevements', v)}
        affichage={`${fmtNombre(params.multiplicateurPrelevements, 2)} (${fmtMd(r.effetRecessif, { signe: true })})`}
        texteVocal={`${fmtNombre(params.multiplicateurPrelevements, 2)}, soit ${fmtNombre(r.effetRecessif)} milliards d'euros sur le solde`}
        badge={<Badge statut="hypothese-modele" court />}
        aide="Effet sur le PIB de chaque Md€ prélevé, converti en recettes perdues."
      />
      <Slider
        label="Part budgétaire des coûts évités"
        valeur={params.partBudgetaireCoutsEvitesPct} min={0} max={100} pas={5}
        onChange={(v) => setParam('partBudgetaireCoutsEvitesPct', v)}
        affichage={`${fmtPct(params.partBudgetaireCoutsEvitesPct, 0)} (${fmtMd(r.coutsEvites, { signe: true })})`}
        texteVocal={`${params.partBudgetaireCoutsEvitesPct} pour cent, soit ${fmtNombre(r.coutsEvites)} milliards d'euros comptés`}
        badge={<Badge statut="hypothese-modele" court />}
        aide="Santé, factures d’énergie et importations ne sont pas toutes des recettes publiques."
      />
    </Carte>
  )
}

export function CurseursLeviers({ params, r, setParam }: Props) {
  const ligne = (v: number) => fmtMd(v, { signe: true })
  return (
    <Carte titre="Leviers monétaires">
      <Slider
        label="Gel ou conversion du stock détenu par la BCE"
        valeur={params.gelBcePct} min={0} max={100} pas={5}
        onChange={(v) => setParam('gelBcePct', v)}
        affichage={`${fmtPct(params.gelBcePct, 0)} (${ligne(r.leviers.gelBce)})`}
        texteVocal={`${params.gelBcePct} pour cent, soit ${fmtNombre(r.leviers.gelBce)} milliards d'euros par an`}
        badge={<BadgeJuridique id="gelBce" />}
      />
      <Slider
        label="Arrêt de l’amortissement CADES"
        valeur={params.cadesPct} min={0} max={100} pas={5}
        onChange={(v) => setParam('cadesPct', v)}
        badge={<><Badge statut="officiel" court /><BadgeJuridique id="cades" /></>}
        affichage={`${fmtPct(params.cadesPct, 0)} (brut ${fmtMd(r.leviers.cadesBrute)} ; compté ${fmtMd(r.leviers.cadesComptee)})`}
        texteVocal={`${params.cadesPct} pour cent, soit ${fmtNombre(r.leviers.cadesBrute)} milliards d'euros bruts et ${fmtNombre(r.leviers.cadesComptee)} comptés dans le solde`}
        aide="Le programme chiffre la réforme à 19 Md€/an (S6). En lecture APU consolidée, cette somme est une recette déjà présente dans la trajectoire de base : décocher pour cette lecture."
      />
      <div className="pb-1">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={params.cadesCompteDansSolde}
            onChange={(e) => setParam('cadesCompteDansSolde', e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Compter la réaffectation CADES dans le solde (19 Md€, S6)
        </label>
      </div>
      <Slider
        label="Emprunt primaire à 0 % auprès de la banque centrale"
        valeur={params.primaireBcePct} min={0} max={100} pas={5}
        onChange={(v) => setParam('primaireBcePct', v)}
        affichage={`${fmtPct(params.primaireBcePct, 0)} (${ligne(r.leviers.primaire)})`}
        texteVocal={`${params.primaireBcePct} pour cent, soit ${fmtNombre(r.leviers.primaire)} milliards d'euros par an`}
        badge={<BadgeJuridique id="primaireBce" />}
        aide={`Bonification restante comptée en friction : ${fmtMd(r.frictions.bonification)}.`}
      />
      <Slider
        label="Circuit du Trésor"
        valeur={params.circuitTresorPct} min={0} max={100} pas={5}
        onChange={(v) => setParam('circuitTresorPct', v)}
        affichage={`${fmtPct(params.circuitTresorPct, 0)} (${ligne(r.leviers.tresor)})`}
        texteVocal={`${params.circuitTresorPct} pour cent, soit ${fmtNombre(r.leviers.tresor)} milliards d'euros par an`}
        badge={<BadgeJuridique id="circuitTresor" />}
        aide={`Risque de spread résiduel : ${fmtMd(r.frictions.spread)}.`}
      />
    </Carte>
  )
}
