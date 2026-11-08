import { SCENARIOS, type CleScenario } from '../data/scenarios'
import type { SimulationParams } from './types'

/** Préréglages disposant d'une variante « sans leviers monétaires ». */
export const CLES_AVEC_VARIANTE: readonly CleScenario[] = ['an1', 'complet', 'haut', 'median']

export const aUneVariante = (cle: CleScenario): boolean => CLES_AVEC_VARIANTE.includes(cle)

/** Mêmes paramètres, gel BCE, emprunt primaire et circuit du Trésor à 0 ; la CADES (mesure nationale sourcée, S6) est conservée. */
export function sansLeviers(p: SimulationParams): SimulationParams {
  return { ...p, gelBcePct: 0, primaireBcePct: 0, circuitTresorPct: 0 }
}

export function paramsPreset(cle: CleScenario, sans: boolean): SimulationParams {
  const base = SCENARIOS.find((s) => s.cle === cle)!.params
  return sans && aUneVariante(cle) ? sansLeviers(base) : { ...base }
}

/** Compare deux jeux de paramètres ; la croissance nominale n'en fait pas partie. */
export const memeParams = (a: SimulationParams, b: SimulationParams): boolean =>
  (Object.keys(a) as (keyof SimulationParams)[]).every((k) => k === 'croissanceNominalePct' || a[k] === b[k])

export interface PresetReconnu {
  cle: CleScenario
  sansLeviers: boolean
}

/** Retrouve le préréglage (et sa variante) correspondant aux paramètres, ou null. */
export function reconnaitrePreset(params: SimulationParams): PresetReconnu | null {
  for (const s of SCENARIOS) {
    if (memeParams(s.params, params)) return { cle: s.cle, sansLeviers: false }
    if (aUneVariante(s.cle) && memeParams(sansLeviers(s.params), params)) return { cle: s.cle, sansLeviers: true }
  }
  return null
}
