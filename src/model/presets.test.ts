import { describe, expect, it } from 'bun:test'
import { SCENARIOS } from '../data/scenarios'
import { CLES_AVEC_VARIANTE, paramsPreset, reconnaitrePreset } from './presets'
import { simuler } from './simulate'

describe('variantes sans leviers monétaires', () => {
  for (const cle of CLES_AVEC_VARIANTE) {
    it(`${cle} : gel, primaire et trésor à 0, CADES et autres paramètres identiques`, () => {
      const base = SCENARIOS.find((s) => s.cle === cle)!.params
      const v = paramsPreset(cle, true)
      expect([v.gelBcePct, v.primaireBcePct, v.circuitTresorPct]).toEqual([0, 0, 0])
      expect(v.cadesPct).toBe(base.cadesPct)
      for (const k of Object.keys(base) as (keyof typeof base)[]) {
        if (!['gelBcePct', 'primaireBcePct', 'circuitTresorPct'].includes(k)) expect(v[k]).toBe(base[k])
      }
      expect(simuler(v).solde).toBeLessThanOrEqual(simuler(base).solde)
    })
    it(`${cle} : reconnu avec et sans leviers`, () => {
      expect(reconnaitrePreset(paramsPreset(cle, false))).toEqual({ cle, sansLeviers: false })
      expect(reconnaitrePreset(paramsPreset(cle, true))).toEqual({ cle, sansLeviers: true })
    })
  }
  it('stress n’a pas de variante, reste inchangé (CADES à 0) et est reconnu tel quel', () => {
    expect(paramsPreset('stress', true)).toEqual(paramsPreset('stress', false))
    expect(paramsPreset('stress', false).cadesPct).toBe(0)
    expect(reconnaitrePreset(paramsPreset('stress', true))).toEqual({ cle: 'stress', sansLeviers: false })
  })
  it('« bas » (P30) : CADES à 100 % dans les deux variantes, seul le gel BCE est actif avec (100), tout à 0 sans', () => {
    const avec = paramsPreset('bas', false)
    const sans = paramsPreset('bas', true)
    expect([avec.percentile, avec.multiplicateur, avec.recettesAnneePleinePct, avec.recouvrementPct]).toEqual([30, 1.05, 35, 72])
    expect(avec.cadesPct).toBe(100)
    expect(sans.cadesPct).toBe(100)
    expect([avec.gelBcePct, avec.primaireBcePct, avec.circuitTresorPct]).toEqual([100, 0, 0])
    expect([sans.gelBcePct, sans.primaireBcePct, sans.circuitTresorPct]).toEqual([0, 0, 0])
    expect(simuler(sans).solde).toBeLessThan(simuler(avec).solde)
    // les deux variantes ne diffèrent que par le gel BCE
    expect({ ...sans, gelBcePct: 100 }).toEqual(avec)
  })
  it('« bas » sans leviers n’est confondu avec aucun autre préréglage', () => {
    expect(reconnaitrePreset(paramsPreset('bas', true))).toEqual({ cle: 'bas', sansLeviers: true })
    expect(reconnaitrePreset(paramsPreset('bas', false))).toEqual({ cle: 'bas', sansLeviers: false })
    for (const cle of CLES_AVEC_VARIANTE.filter((c) => c !== 'bas'))
      for (const sans of [true, false]) expect(reconnaitrePreset(paramsPreset(cle, sans))!.cle).toBe(cle)
  })
  it('un jeu modifié n’est pas reconnu, la croissance nominale est ignorée', () => {
    const p = paramsPreset('complet', false)
    expect(reconnaitrePreset({ ...p, percentile: 55 })).toBeNull()
    expect(reconnaitrePreset({ ...p, croissanceNominalePct: 1 })).toEqual({ cle: 'complet', sansLeviers: false })
  })
})
