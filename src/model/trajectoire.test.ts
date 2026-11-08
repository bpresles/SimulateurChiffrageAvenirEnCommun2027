import { describe, expect, it } from 'bun:test'
import { SCENARIOS } from '../data/scenarios'
import { simuler } from './simulate'
import { calculerTrajectoire, effetProgramme, trajectoiresPourParams } from './trajectoire'

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

describe('indexation de l’effet du programme sur le PIB nominal', () => {
  const effetAn1 = 10, effetAP = 40
  it('croissance nulle : identique à la trajectoire non indexée', () => {
    const t = calculerTrajectoire(effetAn1, effetAP, 0, 0)
    for (const p of t) {
      expect(p.solde).toBeCloseTo(-0.054 * 3000 + effetProgramme(p.annee, effetAn1, effetAP), 9)
    }
  })
  it('croissance 2,5 % : effet 2030 = effet année pleine × 1,025³', () => {
    const prog = calculerTrajectoire(effetAn1, effetAP, 0, 2.5)
    const tend = calculerTrajectoire(0, 0, 0, 2.5)
    const effet2030 = prog[4].solde - tend[4].solde
    expect(effet2030).toBeCloseTo(effetAP * Math.pow(1.025, 3), 9)
    expect(prog[1].solde - tend[1].solde).toBeCloseTo(effetAn1, 9)
  })
})
