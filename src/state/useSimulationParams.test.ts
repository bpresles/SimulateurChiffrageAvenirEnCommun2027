import { describe, expect, it } from 'bun:test'
import { ecrireUrl, lireUrl } from './useSimulationParams'
import { PARAMS_PAR_DEFAUT, SCENARIOS } from '../data/scenarios'

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
  it('la croissance nominale est synchronisée avec l’URL, 2,5 par défaut', () => {
    expect(lireUrl('').params.croissanceNominalePct).toBe(2.5)
    const e = lireUrl(ecrireUrl({ params: { ...PARAMS_PAR_DEFAUT, croissanceNominalePct: 1.3 }, rho: 0.5, onglet: 'simulateur' }))
    expect(e.params.croissanceNominalePct).toBe(1.3)
    expect(lireUrl('?cr=9').params.croissanceNominalePct).toBe(5)
    expect(lireUrl('').params.tauxBonificationPct).toBe(0)
    expect(lireUrl('?bo=4.5').params.tauxBonificationPct).toBe(4.5)
    expect(lireUrl('?bo=20').params.tauxBonificationPct).toBe(8)
  })
})
