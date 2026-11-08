import { useDeferredValue, useMemo } from 'react'
import { SCENARIOS, type CleScenario } from '../data/scenarios'
import { paramsPreset } from '../model/presets'
import { monteCarlo } from '../model/monteCarlo'
import { impactCorrections, simuler } from '../model/simulate'
import { trajectoiresPourParams } from '../model/trajectoire'
import type { SimulationParams } from '../model/types'

const SOLDES_SCENARIOS = Object.fromEntries(SCENARIOS.map((s) => [s.cle, simuler(s.params).solde])) as Record<CleScenario, number>

/** Tous les calculs dérivés des curseurs. Le Monte-Carlo est différé pour éviter les saccades. */
const SOLDES_SANS_LEVIERS = Object.fromEntries(
  SCENARIOS.map((s) => [s.cle, simuler(paramsPreset(s.cle, true)).solde]),
) as Record<CleScenario, number>

export function useModele(params: SimulationParams, rho: number) {
  const resultat = useMemo(() => simuler(params), [params])
  const trajectoires = useMemo(() => trajectoiresPourParams(params), [params])
  const impacts = useMemo(() => impactCorrections(params), [params])

  const paramsDifferes = useDeferredValue(params)
  const rhoDiffere = useDeferredValue(rho)
  const mc = useMemo(() => monteCarlo(paramsDifferes, { rho: rhoDiffere }), [paramsDifferes, rhoDiffere])
  const mcAJour = paramsDifferes === params && rhoDiffere === rho

  return { resultat, trajectoires, impacts, mc, mcAJour, soldesScenarios: SOLDES_SCENARIOS, soldesSansLeviers: SOLDES_SANS_LEVIERS }
}

export type Modele = ReturnType<typeof useModele>
