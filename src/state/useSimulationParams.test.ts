import { describe, expect, it } from 'bun:test'
import { ecrireUrl, lireUrl } from './useSimulationParams'
import { SCENARIOS } from '../data/scenarios'

describe('synchronisation URL', () => {
  it('aller-retour sans perte', () => {
    for (const s of SCENARIOS) {
      const e = lireUrl(ecrireUrl({ params: s.params, rho: 0.5, onglet: 'filieres' }))
      expect(e.params).toEqual(s.params)
      expect(e.onglet).toBe('filieres')
    }
  })
  it('borne les valeurs hors plage et ignore les valeurs invalides', () => {
    const e = lireUrl('?p=500&m=abc&rc=10&t=nimportequoi')
    expect(e.params.percentile).toBe(90)
    expect(e.params.recouvrementPct).toBe(55)
    expect(e.params.multiplicateur).toBe(1.45)
    expect(e.onglet).toBe('simulateur')
  })
})
