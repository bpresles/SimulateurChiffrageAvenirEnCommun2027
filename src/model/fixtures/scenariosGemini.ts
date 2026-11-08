import type { SimulationParams } from '../types'
import { NOUVEAUX_PARAMS_DEFAUT } from '../../data/scenarios'

/** Préréglages d'origine (modèle Gemini), figés pour le test de non-régression. Ne pas modifier. */
const g = (p: Omit<SimulationParams, keyof typeof NOUVEAUX_PARAMS_DEFAUT>): SimulationParams => ({ ...p, ...NOUVEAUX_PARAMS_DEFAUT })

export const SCENARIOS_GEMINI = {
  an1: g({ horizon: 'an1', percentile: 50, multiplicateur: 1.35, recettesAnneePleinePct: 0, recouvrementPct: 100, gelBcePct: 0, cadesPct: 0, primaireBcePct: 50, circuitTresorPct: 50 }),
  complet: g({ horizon: 'anneePleine', percentile: 50, multiplicateur: 1.45, recettesAnneePleinePct: 100, recouvrementPct: 92, gelBcePct: 100, cadesPct: 100, primaireBcePct: 100, circuitTresorPct: 100 }),
  haut: g({ horizon: 'anneePleine', percentile: 90, multiplicateur: 1.65, recettesAnneePleinePct: 100, recouvrementPct: 98, gelBcePct: 100, cadesPct: 100, primaireBcePct: 100, circuitTresorPct: 100 }),
  median: g({ horizon: 'anneePleine', percentile: 50, multiplicateur: 1.35, recettesAnneePleinePct: 85, recouvrementPct: 82, gelBcePct: 50, cadesPct: 100, primaireBcePct: 60, circuitTresorPct: 100 }),
  orthodoxe: g({ horizon: 'anneePleine', percentile: 30, multiplicateur: 1.05, recettesAnneePleinePct: 35, recouvrementPct: 72, gelBcePct: 0, cadesPct: 0, primaireBcePct: 0, circuitTresorPct: 0 }),
  stress: g({ horizon: 'anneePleine', percentile: 10, multiplicateur: 0.85, recettesAnneePleinePct: 25, recouvrementPct: 60, gelBcePct: 0, cadesPct: 0, primaireBcePct: 0, circuitTresorPct: 0 }),
} as const
