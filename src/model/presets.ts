import { hv } from '../data/hypotheses'
import { SCENARIOS, type CleScenario } from '../data/scenarios'
import type { SimulationParams } from './types'

/** Préréglages disposant d'une variante « sans leviers monétaires ». */
export const CLES_AVEC_VARIANTE: readonly CleScenario[] = ['an1', 'complet', 'haut', 'median', 'bas']

export const aUneVariante = (cle: CleScenario): boolean => CLES_AVEC_VARIANTE.includes(cle)

/** Mêmes paramètres, gel BCE, emprunt primaire et circuit du Trésor à 0 ; la CADES (mesure nationale sourcée, S6) est conservée. */
export function sansLeviers(p: SimulationParams): SimulationParams {
  return { ...p, gelBcePct: 0, primaireBcePct: 0, circuitTresorPct: 0 }
}

export function paramsPreset(cle: CleScenario, sans: boolean): SimulationParams {
  const base = SCENARIOS.find((s) => s.cle === cle)!.params
  return sans && aUneVariante(cle) ? sansLeviers(base) : { ...base }
}

/** Compare deux jeux de paramètres ; la croissance nominale et le taux de bonification n'en font pas partie. */
export const memeParams = (a: SimulationParams, b: SimulationParams): boolean =>
  (Object.keys(a) as (keyof SimulationParams)[]).every((k) => k === 'croissanceNominalePct' || k === 'tauxBonificationPct' || a[k] === b[k])

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

/** Égalité stricte de tous les paramètres (y compris croissance et bonification). */
export const memeParamsStrict = (a: SimulationParams, b: SimulationParams): boolean =>
  (Object.keys(a) as (keyof SimulationParams)[]).every((k) => a[k] === b[k])

export interface ReglagesReference {
  cle: CleScenario
  sansLeviers: boolean
  params: SimulationParams
  rho: number
}

/**
 * Réglages de référence pour la réinitialisation : le dernier préréglage choisi (« complet » à défaut)
 * dans la variante donnée, avec les hypothèses avancées à leurs valeurs par défaut
 * (retours courants 14, ρ 0,5, croissance 2,5 %, bonification 0 %, CADES comptée).
 */
export function parametresDeReinitialisation(dernierPreset: CleScenario | null | undefined, sans: boolean): ReglagesReference {
  const cle = dernierPreset ?? 'complet'
  return { cle, sansLeviers: sans && aUneVariante(cle), params: paramsPreset(cle, sans), rho: hv('rho') }
}
