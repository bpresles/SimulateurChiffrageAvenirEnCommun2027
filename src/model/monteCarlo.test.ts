import { describe, expect, it } from 'bun:test'
import { SCENARIOS } from '../data/scenarios'
import { monteCarlo, mulberry32, splitNormale } from './monteCarlo'

const complet = SCENARIOS.find((s) => s.cle === 'complet')!.params

describe('monte-carlo', () => {
  it('est déterministe pour une graine donnée', () => {
    const a = monteCarlo(complet, { n: 500, graine: 42 })
    const b = monteCarlo(complet, { n: 500, graine: 42 })
    expect(a).toEqual(b)
    const c = monteCarlo(complet, { n: 500, graine: 43 })
    expect(c.solde.p50).not.toBe(a.solde.p50)
  })
  it('mulberry32 reste dans [0,1[', () => {
    const r = mulberry32(1)
    for (let i = 0; i < 1000; i++) {
      const v = r()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
  it('la split-normale est calée sur P10/P50/P90', () => {
    expect(splitNormale(36.5, 47.6, 55, 0)).toBe(47.6)
    expect(splitNormale(36.5, 47.6, 55, -1.2815515655446004)).toBeCloseTo(36.5, 9)
    expect(splitNormale(36.5, 47.6, 55, 1.2815515655446004)).toBeCloseTo(55, 9)
    expect(splitNormale(1, 2, 3, -100)).toBe(0)
  })
  it('P10(total) > somme des P10 quand ρ < 1', () => {
    const r = monteCarlo(complet, { n: 5000, rho: 0.5 })
    expect(r.investissement.p10).toBeGreaterThan(r.sommeP10)
    expect(r.investissement.p90).toBeLessThan(r.sommeP90)
    expect(r.investissement.p50).toBeGreaterThan(110)
    expect(r.investissement.p50).toBeLessThan(130)
  })
  it('à ρ = 1 l’intervalle se rapproche de la somme des quantiles', () => {
    const r = monteCarlo(complet, { n: 5000, rho: 1 })
    expect(Math.abs(r.investissement.p10 - r.sommeP10)).toBeLessThan(1.5)
  })
})
