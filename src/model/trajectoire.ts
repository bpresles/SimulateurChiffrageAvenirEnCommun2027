import { hv } from '../data/hypotheses'
import { simuler } from './simulate'
import type { ModelOptions, SimulationParams } from './types'
import { OPTIONS_PAR_DEFAUT } from './simulate'

export interface PointTrajectoire {
  annee: number
  pib: number
  /** Solde public en Md€ (négatif = déficit). */
  solde: number
  soldePct: number
  dette: number
  dettePct: number
  /** Dette hors stock BCE gelé, % du PIB (indicateur non Maastricht), à partir de 2027. */
  detteHorsBcePct: number | null
}

export const ANNEES = [2026, 2027, 2028, 2029, 2030, 2031, 2032]

/** Effet du programme sur le solde, par année : 0 / An 1 / interpolation / année pleine. */
export function effetProgramme(annee: number, effetAn1: number, effetAP: number): number {
  if (annee <= 2026) return 0
  if (annee === 2027) return effetAn1
  if (annee >= 2030) return effetAP
  return effetAn1 + ((effetAP - effetAn1) * (annee - 2027)) / 3
}

export function calculerTrajectoire(
  effetAn1: number,
  effetAP: number,
  gelPct: number,
  croissancePct: number = hv('croissanceNominale'),
): PointTrajectoire[] {
  const pib0 = hv('pib2026')
  const g = croissancePct / 100
  const def = hv('deficitTendanciel') / 100
  let dettePrec = hv('dette2026')
  return ANNEES.map((annee) => {
    const pib = pib0 * Math.pow(1 + g, annee - 2026)
    // Montants du programme constants en euros 2027 (non indexés sur le PIB).
    const solde = def * pib + effetProgramme(annee, effetAn1, effetAP)
    // Dette 2026 : stock de départ ; ensuite dette_t = dette_{t-1} − solde_t.
    const dette = annee === 2026 ? dettePrec : dettePrec - solde
    dettePrec = dette
    const horsBce = annee >= 2027 ? ((dette - hv('stockBce') * (gelPct / 100)) / pib) * 100 : null
    return { annee, pib, solde, soldePct: (solde / pib) * 100, dette, dettePct: (dette / pib) * 100, detteHorsBcePct: horsBce }
  })
}

export interface Trajectoires {
  programme: PointTrajectoire[]
  tendanciel: PointTrajectoire[]
  effetAn1: number
  effetAP: number
}

/** Trajectoires avec le même jeu de curseurs, soldes An 1 et année pleine calculés par le moteur. */
export function trajectoiresPourParams(
  params: SimulationParams,
  options: ModelOptions = OPTIONS_PAR_DEFAUT,
): Trajectoires {
  const effetAn1 = simuler({ ...params, horizon: 'an1' }, options).solde
  const effetAP = simuler({ ...params, horizon: 'anneePleine' }, options).solde
  return {
    programme: calculerTrajectoire(effetAn1, effetAP, params.gelBcePct, params.croissanceNominalePct),
    tendanciel: calculerTrajectoire(0, 0, 0, params.croissanceNominalePct),
    effetAn1,
    effetAP,
  }
}

export interface AmeliorationDeficit2030 {
  /** Déficit tendanciel, en % du PIB (valeur positive). */
  deficitTendanciel: number
  /** Effet du programme en 2030 (Md€ constants, euros 2027). */
  effet: number
  /** Effet du programme en 2030 en points de PIB (effet / PIB 2030 × 100). */
  pointsPib: number
  /** Vrai si l'effet suffit à annuler le déficit tendanciel. */
  suffisant: boolean
}

/** Amélioration du déficit en 2030 : effet du programme rapporté au PIB 2030. */
export function ameliorationDeficit2030(t: Trajectoires): AmeliorationDeficit2030 {
  const prog = t.programme.find((p) => p.annee === 2030)!
  const tend = t.tendanciel.find((p) => p.annee === 2030)!
  const effet = prog.solde - tend.solde
  const pointsPib = (effet / tend.pib) * 100
  const deficitTendanciel = -tend.soldePct
  return { deficitTendanciel, effet, pointsPib, suffisant: pointsPib >= deficitTendanciel }
}
