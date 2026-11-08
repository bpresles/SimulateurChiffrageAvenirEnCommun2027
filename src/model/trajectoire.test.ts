import { describe, expect, it } from 'bun:test'
import { SCENARIOS } from '../data/scenarios'
import { simuler } from './simulate'
import { ameliorationDeficit2030, calculerTrajectoire, effetProgramme, trajectoiresPourParams } from './trajectoire'

describe('trajectoire', () => {
  it('le tendanciel garde un déficit de 5,4 % du PIB', () => {
    for (const p of calculerTrajectoire(0, 0, 0)) expect(p.soldePct).toBeCloseTo(-5.4, 9)
  })
  it('effet : 0 en 2026, An 1 en 2027, interpolation puis année pleine dès 2030', () => {
    expect(effetProgramme(2026, 10, 40)).toBe(0)
    expect(effetProgramme(2027, 10, 40)).toBe(10)
    expect(effetProgramme(2028, 10, 40)).toBeCloseTo(20, 9)
    expect(effetProgramme(2029, 10, 40)).toBeCloseTo(30, 9)
    expect(effetProgramme(2030, 10, 40)).toBe(40)
    expect(effetProgramme(2032, 10, 40)).toBe(40)
  })
  it('la dette suit dette_t = dette_{t-1} − solde_t', () => {
    const t = calculerTrajectoire(10, 40, 100)
    expect(t[1].dette).toBeCloseTo(t[0].dette - t[1].solde, 9)
    expect(t[0].detteHorsBcePct).toBeNull()
    expect(t[1].detteHorsBcePct).toBeCloseTo(((t[1].dette - 596.971) / t[1].pib) * 100, 9)
    expect(t[0].dette).toBe(3595)
    expect(t[0].dettePct).toBeCloseTo((3595 / 3000) * 100, 9)
  })
})

describe('croissance nominale réglable', () => {
  it('change les ratios en % du PIB mais pas le solde du moteur en Md€', () => {
    const base = SCENARIOS.find((s) => s.cle === 'complet')!.params
    const lente = { ...base, croissanceNominalePct: 0.5 }
    expect(simuler(lente).solde).toBe(simuler(base).solde)
    const a = trajectoiresPourParams(base)
    const b = trajectoiresPourParams(lente)
    expect(b.effetAn1).toBe(a.effetAn1)
    expect(b.effetAP).toBe(a.effetAP)
    expect(b.programme[6].dettePct).toBeGreaterThan(a.programme[6].dettePct)
    expect(b.programme[6].soldePct).not.toBeCloseTo(a.programme[6].soldePct, 3)
    expect(b.tendanciel[6].pib).toBeLessThan(a.tendanciel[6].pib)
  })
})

describe('effet du programme en euros 2027 (non indexé)', () => {
  const effetAn1 = 10, effetAP = 40
  it('l’effet 2030 vaut l’effet année pleine, quelle que soit la croissance', () => {
    for (const g of [0, 1, 2.5, 5]) {
      const prog = calculerTrajectoire(effetAn1, effetAP, 0, g)
      const tend = calculerTrajectoire(0, 0, 0, g)
      expect(prog[4].solde - tend[4].solde).toBeCloseTo(effetAP, 9)
      expect(prog[1].solde - tend[1].solde).toBeCloseTo(effetAn1, 9)
    }
  })
})

describe('amélioration du déficit 2030 en points de PIB', () => {
  it('Z = effet / PIB 2030 × 100, déficit tendanciel 5,4 %', () => {
    const base = SCENARIOS.find((s) => s.cle === 'complet')!.params
    const r = ameliorationDeficit2030(trajectoiresPourParams(base))
    const pib2030 = 3000 * Math.pow(1.025, 4)
    const effetAP = simuler({ ...base, horizon: 'anneePleine' }).solde
    expect(r.effet).toBeCloseTo(effetAP, 9)
    expect(r.pointsPib).toBeCloseTo((effetAP / pib2030) * 100, 9)
    expect(r.deficitTendanciel).toBeCloseTo(5.4, 9)
    expect(r.suffisant).toBe(false)
  })
  it('à croissance nulle, Z = effet / 3000 ; un effet très favorable annule le déficit', () => {
    const base = SCENARIOS.find((s) => s.cle === 'complet')!.params
    const r = ameliorationDeficit2030(trajectoiresPourParams({ ...base, croissanceNominalePct: 0 }))
    expect(r.pointsPib).toBeCloseTo((r.effet / 3000) * 100, 9)
    const fort = ameliorationDeficit2030({ ...trajectoiresPourParams(base), programme: calculerTrajectoire(0, 400, 0, 2.5), tendanciel: calculerTrajectoire(0, 0, 0, 2.5), effetAn1: 0, effetAP: 400 })
    expect(fort.suffisant).toBe(true)
  })
})
