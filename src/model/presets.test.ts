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
  it('sans-leviers et stress n’ont pas de variante et sont reconnus tels quels', () => {
    for (const cle of ['sans-leviers', 'stress'] as const) {
      expect(paramsPreset(cle, true)).toEqual(paramsPreset(cle, false))
      expect(reconnaitrePreset(paramsPreset(cle, true))).toEqual({ cle, sansLeviers: false })
    }
  })
  it('un jeu modifié n’est pas reconnu, la croissance nominale est ignorée', () => {
    const p = paramsPreset('complet', false)
    expect(reconnaitrePreset({ ...p, percentile: 55 })).toBeNull()
    expect(reconnaitrePreset({ ...p, croissanceNominalePct: 1 })).toEqual({ cle: 'complet', sansLeviers: false })
  })
})
