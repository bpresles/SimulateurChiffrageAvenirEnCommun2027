import type { SimulationParams } from '../model/types'

export type CleScenario = 'an1' | 'complet' | 'haut' | 'median' | 'sans-leviers' | 'stress'

/** Valeurs par défaut des paramètres ajoutés par la refonte. */
export const NOUVEAUX_PARAMS_DEFAUT = {
  multiplicateurPrelevements: 0.3,
  partBudgetaireCoutsEvitesPct: 25,
  retoursCourantsBase: 14,
  cadesCompteDansSolde: false,
} as const

export interface Scenario {
  cle: CleScenario
  libelle: string
  description: string
  params: SimulationParams
}

const base = (
  p: Omit<SimulationParams, keyof typeof NOUVEAUX_PARAMS_DEFAUT>,
): SimulationParams => ({ ...p, ...NOUVEAUX_PARAMS_DEFAUT })

export const SCENARIOS: Scenario[] = [
  {
    cle: 'an1', libelle: 'Cadrage An 1 (2027)',
    description: 'Lecture du cadrage de première année : dépenses et recettes annoncées, première tranche des investissements, leviers monétaires à moitié.',
    params: base({ horizon: 'an1', percentile: 50, multiplicateur: 1.35, recettesAnneePleinePct: 0, recouvrementPct: 100, gelBcePct: 0, cadesPct: 0, primaireBcePct: 50, circuitTresorPct: 50 }),
  },
  {
    cle: 'complet', libelle: 'Programme complet – hypothèses centrales',
    description: 'Année pleine : toutes les dépenses sociales, les 10 filières au P50, les recettes d’année pleine et les quatre leviers monétaires activés.',
    params: base({ horizon: 'anneePleine', percentile: 50, multiplicateur: 1.45, recettesAnneePleinePct: 100, recouvrementPct: 92, gelBcePct: 100, cadesPct: 100, primaireBcePct: 100, circuitTresorPct: 100 }),
  },
  {
    cle: 'haut', libelle: 'Hypothèses hautes (P90)',
    description: 'Année pleine avec investissements au P90, multiplicateur élevé, recouvrement quasi complet et leviers monétaires pleinement mobilisés.',
    params: base({ horizon: 'anneePleine', percentile: 90, multiplicateur: 1.65, recettesAnneePleinePct: 100, recouvrementPct: 98, gelBcePct: 100, cadesPct: 100, primaireBcePct: 100, circuitTresorPct: 100 }),
  },
  {
    cle: 'median', libelle: 'Médian – leviers monétaires partiels',
    description: 'Année pleine : leviers nationaux activés, gel partiel du stock BCE, recouvrement et recettes d’année pleine partiels.',
    params: base({ horizon: 'anneePleine', percentile: 50, multiplicateur: 1.35, recettesAnneePleinePct: 85, recouvrementPct: 82, gelBcePct: 50, cadesPct: 100, primaireBcePct: 60, circuitTresorPct: 100 }),
  },
  {
    cle: 'sans-leviers', libelle: 'Sans leviers monétaires (traités UE inchangés)',
    description: 'Année pleine sans aucun levier monétaire, avec une faible part des recettes d’année pleine et un multiplicateur bas.',
    params: base({ horizon: 'anneePleine', percentile: 30, multiplicateur: 1.05, recettesAnneePleinePct: 35, recouvrementPct: 72, gelBcePct: 0, cadesPct: 0, primaireBcePct: 0, circuitTresorPct: 0 }),
  },
  {
    cle: 'stress', libelle: 'Stress-test (P10)',
    description: 'Année pleine pessimiste : investissements au P10, recouvrement faible, aucun levier monétaire.',
    params: base({ horizon: 'anneePleine', percentile: 10, multiplicateur: 0.85, recettesAnneePleinePct: 25, recouvrementPct: 60, gelBcePct: 0, cadesPct: 0, primaireBcePct: 0, circuitTresorPct: 0 }),
  },
]

export const PARAMS_PAR_DEFAUT: SimulationParams = SCENARIOS[1].params
