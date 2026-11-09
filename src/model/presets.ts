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

/** Hypothèses avancées conservées quand on change de préréglage : macroéconomie des trajectoires et taux de bonification. */
export const PARAMS_HORS_PRESET = [
  'croissanceLongTermePct',
  'inflationPct',
  'ecartDepensesPct',
  'tauxRecettesActivitePct',
  'rendementCapitalPct',
  'substitutionImports',
  'tauxBonificationPct',
  'partPretsUtilisesPct',
  'dureeMonteeInvestissement',
  'ecartPrixElectricite',
  'anneesEcartElectricite',
  'rachatEngie',
] as const satisfies readonly (keyof SimulationParams)[]

type CleHorsPreset = (typeof PARAMS_HORS_PRESET)[number]

const horsPreset = (k: keyof SimulationParams): boolean => (PARAMS_HORS_PRESET as readonly string[]).includes(k)

/** Valeurs courantes des hypothèses avancées conservées d'un préréglage à l'autre. */
export function paramsHorsPreset(p: SimulationParams): Pick<SimulationParams, CleHorsPreset> {
  return {
    croissanceLongTermePct: p.croissanceLongTermePct,
    inflationPct: p.inflationPct,
    ecartDepensesPct: p.ecartDepensesPct,
    tauxRecettesActivitePct: p.tauxRecettesActivitePct,
    rendementCapitalPct: p.rendementCapitalPct,
    substitutionImports: p.substitutionImports,
    tauxBonificationPct: p.tauxBonificationPct,
    partPretsUtilisesPct: p.partPretsUtilisesPct,
    dureeMonteeInvestissement: p.dureeMonteeInvestissement,
    ecartPrixElectricite: p.ecartPrixElectricite,
    anneesEcartElectricite: p.anneesEcartElectricite,
    rachatEngie: p.rachatEngie,
  }
}

/** Compare deux jeux de paramètres, hors hypothèses macroéconomiques et taux de bonification. */
export const memeParams = (a: SimulationParams, b: SimulationParams): boolean =>
  (Object.keys(a) as (keyof SimulationParams)[]).every((k) => horsPreset(k) || a[k] === b[k])

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
 * (retours courants 14, ρ 0,5, croissance réelle 1,2 % à partir de 2029, inflation 1,5 %, écart des dépenses 0,
 * recettes sur le surcroît d'activité 35 %, effet durable des investissements 0 %, report de la demande vers des
 * produits français 0, bonification 0 %, durée de montée en charge de l'investissement 10 ans, écart de prix de l'électricité 0,
 * rachat d'Engie coché, CADES comptée).
 */
export function parametresDeReinitialisation(dernierPreset: CleScenario | null | undefined, sans: boolean): ReglagesReference {
  const cle = dernierPreset ?? 'complet'
  return { cle, sansLeviers: sans && aUneVariante(cle), params: paramsPreset(cle, sans), rho: hv('rho') }
}
