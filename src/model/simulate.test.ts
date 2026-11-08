import { describe, expect, it } from 'bun:test'
import { FILIERES } from '../data/filieres'
import { SCENARIOS, type CleScenario } from '../data/scenarios'
import { agregerFilieres } from './filieres'
import { interpPercentile } from './percentile'
import { OPTIONS_ORIGINE, OPTIONS_PAR_DEFAUT, impactCorrections, simuler } from './simulate'

const somme = (f: (x: (typeof FILIERES)[number]) => number) => FILIERES.reduce((s, x) => s + f(x), 0)
const scenario = (cle: CleScenario) => SCENARIOS.find((s) => s.cle === cle)!.params

describe('données des filières', () => {
  it('les sommes correspondent aux totaux attendus', () => {
    expect(somme((f) => f.p50)).toBeCloseTo(118.52, 6)
    expect(somme((f) => f.etatP50)).toBeCloseTo(18.52, 6)
    expect(somme((f) => f.banqueP50)).toBeCloseTo(100, 6)
    expect(somme((f) => f.p10)).toBeCloseTo(86.7, 6)
    expect(somme((f) => f.p90)).toBeCloseTo(148.0, 6)
  })
  it('l’interpolation est exacte à 10, 50 et 90', () => {
    for (const f of FILIERES) {
      expect(interpPercentile(f.p10, f.p50, f.p90, 10)).toBe(f.p10)
      expect(interpPercentile(f.p10, f.p50, f.p90, 50)).toBe(f.p50)
      expect(interpPercentile(f.p10, f.p50, f.p90, 90)).toBe(f.p90)
    }
    expect(agregerFilieres(10, 1.45).totalInvest).toBeCloseTo(86.7, 6)
    expect(agregerFilieres(90, 1.45).totalInvest).toBeCloseTo(148.0, 6)
  })
})

describe('non-régression avec le modèle d’origine (corrections désactivées)', () => {
  const attendu: Record<CleScenario, number> = {
    an1: 69.0, complet: 157.5, haut: 188.9, median: 108.8, 'sans-leviers': -24.9, stress: -59.1,
  }
  for (const [cle, valeur] of Object.entries(attendu) as [CleScenario, number][]) {
    it(`${cle} ≈ ${valeur}`, () => {
      expect(Math.abs(simuler(scenario(cle), OPTIONS_ORIGINE).solde - valeur)).toBeLessThanOrEqual(0.3)
    })
  }
})

describe('corrections', () => {
  it('le levier primaire améliore le solde de 6,5 + bonification, pas du double', () => {
    const p = { ...scenario('complet'), primaireBcePct: 0 }
    const a = simuler(p)
    const b = simuler({ ...p, primaireBcePct: 100 })
    const bonif = a.agregat.totalBanque * 0.08
    expect(b.solde - a.solde).toBeCloseTo(6.5 + bonif, 9)
    // modèle d'origine : 14,5 + bonification
    const o = simuler(p, OPTIONS_ORIGINE)
    const o2 = simuler({ ...p, primaireBcePct: 100 }, OPTIONS_ORIGINE)
    expect(o2.solde - o.solde).toBeCloseTo(14.5 + bonif, 9)
  })
  it('la CADES compte pour 0 quand la correction est active et l’option désactivée', () => {
    const r = simuler(scenario('complet'))
    expect(r.leviers.cadesBrute).toBe(19)
    expect(r.leviers.cadesComptee).toBe(0)
    const r2 = simuler({ ...scenario('complet'), cadesCompteDansSolde: true })
    expect(r2.leviers.cadesComptee).toBe(19)
    expect(simuler(scenario('complet'), OPTIONS_ORIGINE).leviers.cadesComptee).toBe(19)
  })
  it('la bonification n’est comptée en An 1 qu’avec la correction', () => {
    const p = { ...scenario('an1'), primaireBcePct: 0 }
    expect(simuler(p, OPTIONS_ORIGINE).frictions.bonification).toBe(0)
    expect(simuler(p).frictions.bonification).toBeGreaterThan(0)
  })
  it('l’effet récessif est négatif et nul si le multiplicateur est nul', () => {
    expect(simuler(scenario('complet')).effetRecessif).toBeLessThan(0)
    expect(simuler({ ...scenario('complet'), multiplicateurPrelevements: 0 }).effetRecessif).toBeCloseTo(0, 12)
  })
  it('impactCorrections est cohérent avec simuler', () => {
    const p = scenario('complet')
    const total = simuler(p).solde - simuler(p, OPTIONS_ORIGINE).solde
    const marginaux = impactCorrections(p, OPTIONS_PAR_DEFAUT)
    expect(marginaux).toHaveLength(4)
    for (const i of marginaux) expect(Number.isFinite(i.marginal + i.isole)).toBe(true)
    expect(total).toBeLessThan(0)
  })
  it('les résultats sont déterministes et sans arrondi intermédiaire', () => {
    expect(simuler(scenario('median'))).toEqual(simuler(scenario('median')))
  })
})
