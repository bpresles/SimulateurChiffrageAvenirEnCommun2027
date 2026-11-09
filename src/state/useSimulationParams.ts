import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PARAMS_PAR_DEFAUT, type CleScenario } from '../data/scenarios'
import { hv } from '../data/hypotheses'
import { aUneVariante, memeParamsStrict, paramsHorsPreset, paramsPreset, parametresDeReinitialisation, reconnaitrePreset } from '../model/presets'
import type { SimulationParams } from '../model/types'

export type Onglet = 'simulateur' | 'filieres' | 'leviers' | 'matrice' | 'methodologie'
export const ONGLETS: { id: Onglet; label: string }[] = [
  { id: 'simulateur', label: 'Simulateur' },
  { id: 'filieres', label: '10 filières' },
  { id: 'leviers', label: 'Leviers monétaires' },
  { id: 'matrice', label: 'Matrice détaillée' },
  { id: 'methodologie', label: 'Méthodologie et sources' },
]

type CleNum = Exclude<keyof SimulationParams, 'horizon' | 'cadesCompteDansSolde' | 'rachatEngie'>

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
  croissanceLongTermePct: { k: 'gl', min: -1, max: 3 },
  inflationPct: { k: 'in', min: 0, max: 4 },
  ecartDepensesPct: { k: 'ed', min: -2, max: 2 },
  tauxRecettesActivitePct: { k: 'tx', min: 20, max: 55 },
  rendementCapitalPct: { k: 'rk', min: 0, max: 20 },
  substitutionImports: { k: 'si', min: 0, max: 2 },
  tauxBonificationPct: { k: 'bo', min: 0, max: 8 },
  partPretsUtilisesPct: { k: 'pu', min: 0, max: 100 },
  dureeMonteeInvestissement: { k: 'di', min: 10, max: 30 },
  ecartPrixElectricite: { k: 'pe', min: 0, max: 100 },
  margeElectricite: { k: 'mg', min: 0, max: 25 },
  anneesEcartElectricite: { k: 'ne', min: 1, max: 8 },
  partChomeursMobilisablesPct: { k: 'km', min: 10, max: 50 },
  partEmploisManquantsImmigrationPct: { k: 'im', min: 0, max: 100 },
  effectifRegularisation: { k: 'rg', min: 0, max: 700000 },
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
  // Anciens liens : « h=an1 » (horizon supprimé) ouvre le préréglage « Programme complet – hypothèses centrales » ;
  // « h=ap » est lu normalement. Les hypothèses avancées du lien sont conservées dans les deux cas.
  const ancienHorizonAn1 = q.get('h') === 'an1'
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
  const re = q.get('re')
  if (re === '0' || re === '1') params.rachatEngie = re === '1'
  if (ancienHorizonAn1) Object.assign(params, paramsPreset('complet', false), paramsHorsPreset(params))
  const rhoBrut = Number(q.get('rho'))
  const rho = q.get('rho') !== null && Number.isFinite(rhoBrut) ? clamp(rhoBrut, 0, 0.95) : hv('rho')
  const t = q.get('t')
  const onglet = ONGLETS.some((o) => o.id === t) ? (t as Onglet) : 'simulateur'
  return { params, rho, onglet }
}

export function ecrireUrl(etat: EtatUrl): string {
  const q = new URLSearchParams()
  if (etat.onglet !== 'simulateur') q.set('t', etat.onglet)
  for (const cle of Object.keys(NUM) as CleNum[]) q.set(NUM[cle].k, String(etat.params[cle]))
  q.set('cc', etat.params.cadesCompteDansSolde ? '1' : '0')
  q.set('re', etat.params.rachatEngie ? '1' : '0')
  if (etat.rho !== hv('rho')) q.set('rho', String(etat.rho))
  return q.toString()
}

export function useSimulationParams() {
  const initial = useMemo(() => lireUrl(window.location.search), [])
  const [params, setParams] = useState<SimulationParams>(initial.params)
  const [rho, setRho] = useState(initial.rho)
  const [onglet, setOngletEtat] = useState<Onglet>(initial.onglet)

  const setParam = useCallback(<K extends keyof SimulationParams>(cle: K, valeur: SimulationParams[K]) => {
    setParams((p) => ({ ...p, [cle]: valeur }))
  }, [])

  const initialSans = useMemo(() => {
    const r = reconnaitrePreset(initial.params)
    return r ? r.sansLeviers : false
  }, [initial])
  const [choixSans, setChoixSans] = useState(initialSans)
  const [dernierPreset, setDernierPreset] = useState<CleScenario | null>(() => reconnaitrePreset(initial.params)?.cle ?? null)

  /** Applique un préréglage dans la variante donnée ; les hypothèses macroéconomiques et la bonification en cours sont conservées. */
  const appliquerScenario = useCallback((cle: CleScenario, sans: boolean) => {
    setDernierPreset(cle)
    setParams((p) => ({ ...paramsPreset(cle, sans), ...paramsHorsPreset(p) }))
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

  const reconnu = reconnaitrePreset(params)
  const scenarioActif: CleScenario | 'personnalise' = reconnu?.cle ?? 'personnalise'
  // L'interrupteur se déduit des paramètres quand le préréglage a une variante ; sinon on garde le dernier choix.
  const sansLeviersActif = reconnu && aUneVariante(reconnu.cle) ? reconnu.sansLeviers : choixSans

  const changerLeviers = useCallback(
    (sans: boolean) => {
      setChoixSans(sans)
      if (reconnu && aUneVariante(reconnu.cle)) appliquerScenario(reconnu.cle, sans)
    },
    [reconnu, appliquerScenario],
  )

  // Réinitialisation : dernier préréglage choisi (ou reconnu, ou « complet »), variante de l'interrupteur, hypothèses avancées par défaut.
  const presetReference = reconnu?.cle ?? dernierPreset
  const reference = parametresDeReinitialisation(presetReference, sansLeviersActif)
  const reinitialisable = !(memeParamsStrict(params, reference.params) && rho === reference.rho)
  const reinitialiser = useCallback(() => {
    setParams(reference.params)
    setRho(reference.rho)
    setDernierPreset(reference.cle)
  }, [reference.params, reference.rho, reference.cle])

  return { params, setParam, appliquerScenario, rho, setRho, onglet, setOnglet, scenarioActif, sansLeviersActif, changerLeviers, reinitialiser, reinitialisable }
}
