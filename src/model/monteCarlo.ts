import { FILIERES } from '../data/filieres'
import { hv } from '../data/hypotheses'
import { quantileTrie } from './percentile'
import { OPTIONS_PAR_DEFAUT, simuler } from './simulate'
import type { ModelOptions, SimulationParams } from './types'

const Z90 = 1.2815515655446004

/** PRNG mulberry32 : déterministe pour une graine donnée. */
export function mulberry32(graine: number): () => number {
  let a = graine >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Générateur de normales standard par Box-Muller. */
export function gaussienne(rnd: () => number): () => number {
  let spare: number | null = null
  return () => {
    if (spare !== null) {
      const s = spare
      spare = null
      return s
    }
    const u1 = Math.max(rnd(), 1e-12)
    const u2 = rnd()
    const r = Math.sqrt(-2 * Math.log(u1))
    spare = r * Math.sin(2 * Math.PI * u2)
    return r * Math.cos(2 * Math.PI * u2)
  }
}

/** Valeur d'une loi split-normale calée sur P10/P50/P90, bornée à 0. */
export function splitNormale(p10: number, p50: number, p90: number, z: number): number {
  const sigmaBas = (p50 - p10) / Z90
  const sigmaHaut = (p90 - p50) / Z90
  return Math.max(0, p50 + z * (z < 0 ? sigmaBas : sigmaHaut))
}

export interface Histogramme {
  min: number
  max: number
  pas: number
  comptes: number[]
}

export interface Quantiles {
  p10: number
  p50: number
  p90: number
  moyenne: number
  histogramme: Histogramme
}

export interface ResultatMonteCarlo {
  n: number
  rho: number
  investissement: Quantiles
  solde: Quantiles
  emplois: Quantiles
  /** Somme des P10 individuels des filières (pour comparaison). */
  sommeP10: number
  sommeP90: number
}

function resumer(valeurs: Float64Array, classes = 30): Quantiles {
  const trie = Float64Array.from(valeurs).sort()
  let somme = 0
  for (const v of valeurs) somme += v
  const min = trie[0]
  const max = trie[trie.length - 1]
  const pas = (max - min) / classes || 1
  const comptes = new Array<number>(classes).fill(0)
  for (const v of valeurs) comptes[Math.min(classes - 1, Math.floor((v - min) / pas))]++
  return {
    p10: quantileTrie(trie, 0.1),
    p50: quantileTrie(trie, 0.5),
    p90: quantileTrie(trie, 0.9),
    moyenne: somme / valeurs.length,
    histogramme: { min, max, pas, comptes },
  }
}

export interface OptionsMonteCarlo {
  n?: number
  rho?: number
  graine?: number
  options?: ModelOptions
}

/**
 * Monte-Carlo sur le seul volume d'investissement des filières. Les autres
 * paramètres sont fixés par les curseurs. Corrélation par facteur commun.
 */
export function monteCarlo(params: SimulationParams, opt: OptionsMonteCarlo = {}): ResultatMonteCarlo {
  const n = opt.n ?? hv('nTirages')
  const rho = opt.rho ?? hv('rho')
  const options = opt.options ?? OPTIONS_PAR_DEFAUT
  const filieres = FILIERES
  const rnd = mulberry32(opt.graine ?? hv('graine'))
  const normale = gaussienne(rnd)
  const a = Math.sqrt(rho)
  const b = Math.sqrt(1 - rho)
  const invest = new Float64Array(n)
  const solde = new Float64Array(n)
  const emplois = new Float64Array(n)
  const vec = new Array<number>(filieres.length)
  for (let t = 0; t < n; t++) {
    const zc = normale()
    for (let i = 0; i < filieres.length; i++) {
      const f = filieres[i]
      vec[i] = splitNormale(f.p10, f.p50, f.p90, a * zc + b * normale())
    }
    const r = simuler(params, options, vec)
    invest[t] = r.agregat.totalInvest
    solde[t] = r.solde
    emplois[t] = r.agregat.totalEmplois
  }
  return {
    n, rho,
    investissement: resumer(invest),
    solde: resumer(solde),
    emplois: resumer(emplois),
    sommeP10: filieres.reduce((s, f) => s + f.p10, 0),
    sommeP90: filieres.reduce((s, f) => s + f.p90, 0),
  }
}
