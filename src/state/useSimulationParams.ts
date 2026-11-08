import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PARAMS_PAR_DEFAUT, SCENARIOS, type CleScenario } from '../data/scenarios'
import { hv } from '../data/hypotheses'
import type { SimulationParams } from '../model/types'

export type Onglet = 'simulateur' | 'filieres' | 'leviers' | 'matrice' | 'methodologie'
export const ONGLETS: { id: Onglet; label: string }[] = [
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'filieres', label: '10 filières' },
  { id: 'leviers', label: 'Leviers monétaires' },
  { id: 'matrice', label: 'Matrice détaillée' },
  { id: 'methodologie', label: 'Méthodologie et sources' },
]

type CleNum = Exclude<keyof SimulationParams, 'horizon' | 'cadesCompteDansSolde'>

/** Clé d'URL, bornes pour chaque paramètre numérique. */
const NUM: Record<CleNum, { k: string; min: number; max: number }> = {
  percentile: { k: 'p', min: 10, max: 90 },
  multiplicateur: { k: 'm', min: 0.8, max: 1.8 },
  recettesAnneePleinePct: { k: 'ra', min: 0, max: 100 },
  recouvrementPct: { k: 'rc', min: 55, max: 100 },
  multiplicateurPrelevements: { k: 'mp', min: 0, max: 0.7 },
  partBudgetaireCoutsEvitesPct: { k: 'pb', min: 0, max: 100 },
  retoursCourantsBase: { k: 'rb', min: 0, max: 40 },
  gelBcePct: { k: 'g', min: 0, max: 100 },
  cadesPct: { k: 'cd', min: 0, max: 100 },
  primaireBcePct: { k: 'pr', min: 0, max: 100 },
  circuitTresorPct: { k: 'ct', min: 0, max: 100 },
  croissanceNominalePct: { k: 'cr', min: 0, max: 5 },
}

export interface EtatUrl {
  params: SimulationParams
  rho: number
  onglet: Onglet
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function lireUrl(search: string): EtatUrl {
  const q = new URLSearchParams(search)
  const params: SimulationParams = { ...PARAMS_PAR_DEFAUT }
  const h = q.get('h')
  if (h === 'an1' || h === 'ap') params.horizon = h === 'an1' ? 'an1' : 'anneePleine'
  for (const cle of Object.keys(NUM) as CleNum[]) {
    const { k, min, max } = NUM[cle]
    const brut = q.get(k)
    if (brut !== null && brut.trim() !== '') {
      const n = Number(brut)
      if (Number.isFinite(n)) params[cle] = clamp(n, min, max)
    }
  }
  const cc = q.get('cc')
  if (cc === '0' || cc === '1') params.cadesCompteDansSolde = cc === '1'
  const rhoBrut = Number(q.get('rho'))
  const rho = q.get('rho') !== null && Number.isFinite(rhoBrut) ? clamp(rhoBrut, 0, 0.95) : hv('rho')
  const t = q.get('t')
  const onglet = ONGLETS.some((o) => o.id === t) ? (t as Onglet) : 'simulateur'
  return { params, rho, onglet }
}

export function ecrireUrl(etat: EtatUrl): string {
  const q = new URLSearchParams()
  if (etat.onglet !== 'simulateur') q.set('t', etat.onglet)
  q.set('h', etat.params.horizon === 'an1' ? 'an1' : 'ap')
  for (const cle of Object.keys(NUM) as CleNum[]) q.set(NUM[cle].k, String(etat.params[cle]))
  q.set('cc', etat.params.cadesCompteDansSolde ? '1' : '0')
  if (etat.rho !== hv('rho')) q.set('rho', String(etat.rho))
  return q.toString()
}

/** Compare les paramètres des préréglages ; la croissance nominale n'en fait pas partie. */
const memeParams = (a: SimulationParams, b: SimulationParams) =>
  (Object.keys(a) as (keyof SimulationParams)[]).every((k) => k === 'croissanceNominalePct' || a[k] === b[k])

export function useSimulationParams() {
  const initial = useMemo(() => lireUrl(window.location.search), [])
  const [params, setParams] = useState<SimulationParams>(initial.params)
  const [rho, setRho] = useState(initial.rho)
  const [onglet, setOngletEtat] = useState<Onglet>(initial.onglet)

  const setParam = useCallback(<K extends keyof SimulationParams>(cle: K, valeur: SimulationParams[K]) => {
    setParams((p) => ({ ...p, [cle]: valeur }))
  }, [])

  const appliquerScenario = useCallback((cle: CleScenario) => {
    const s = SCENARIOS.find((x) => x.cle === cle)
    if (s) setParams((p) => ({ ...s.params, croissanceNominalePct: p.croissanceNominalePct }))
  }, [])

  const setOnglet = useCallback((o: Onglet) => setOngletEtat(o), [])

  // Synchronisation avec l'URL (replaceState, avec debounce).
  const minuteur = useRef<number | undefined>(undefined)
  useEffect(() => {
    window.clearTimeout(minuteur.current)
    minuteur.current = window.setTimeout(() => {
      const qs = ecrireUrl({ params, rho, onglet })
      try {
        window.history.replaceState(null, '', `${window.location.pathname}?${qs}`)
      } catch {
        /* environnement restreint : on ignore */
      }
    }, 250)
    return () => window.clearTimeout(minuteur.current)
  }, [params, rho, onglet])

  const scenarioActif: CleScenario | 'personnalise' =
    SCENARIOS.find((s) => memeParams(s.params, params))?.cle ?? 'personnalise'

  return { params, setParam, appliquerScenario, rho, setRho, onglet, setOnglet, scenarioActif }
}
