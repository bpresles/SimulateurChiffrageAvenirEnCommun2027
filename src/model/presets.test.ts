import { describe, expect, it } from 'bun:test'
import { SCENARIOS } from '../data/scenarios'
import { CLES_AVEC_VARIANTE, PARAMS_HORS_PRESET, memeParamsStrict, paramsHorsPreset, paramsPreset, parametresDeReinitialisation, reconnaitrePreset } from './presets'
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
  it('un jeu modifié n’est pas reconnu, les hypothèses macroéconomiques sont ignorées', () => {
    const p = paramsPreset('complet', false)
    expect(reconnaitrePreset({ ...p, percentile: 55 })).toBeNull()
    const macro = { croissanceLongTermePct: 1.5, inflationPct: 3, ecartDepensesPct: -1, tauxRecettesActivitePct: 45, rendementCapitalPct: 10, substitutionImports: 1, tauxBonificationPct: 2, partPretsUtilisesPct: 27, dureeMonteeInvestissement: 15, ecartPrixElectricite: 30, anneesEcartElectricite: 4, rachatEngie: false }
    expect(reconnaitrePreset({ ...p, ...macro })).toEqual({ cle: 'complet', sansLeviers: false })
  })
  it('changer de préréglage conserve les hypothèses macroéconomiques et la bonification', () => {
    const courant = { ...paramsPreset('complet', false), croissanceLongTermePct: -0.5, inflationPct: 2.2, ecartDepensesPct: 1, tauxRecettesActivitePct: 40, rendementCapitalPct: 8, substitutionImports: 0.7, tauxBonificationPct: 3, partPretsUtilisesPct: 50, dureeMonteeInvestissement: 20, ecartPrixElectricite: 48, anneesEcartElectricite: 3, rachatEngie: false }
    const suivant = { ...paramsPreset('bas', true), ...paramsHorsPreset(courant) }
    for (const k of PARAMS_HORS_PRESET) expect(suivant[k]).toBe(courant[k])
    expect(suivant.percentile).toBe(30)
    expect(reconnaitrePreset(suivant)).toEqual({ cle: 'bas', sansLeviers: true })
  })
})

describe('réinitialisation des réglages', () => {
  it('restaure le préréglage et la variante, avec les hypothèses avancées par défaut', () => {
    for (const cle of CLES_AVEC_VARIANTE)
      for (const sans of [false, true]) {
        const r = parametresDeReinitialisation(cle, sans)
        expect(r.cle).toBe(cle)
        expect(r.sansLeviers).toBe(sans)
        expect(memeParamsStrict(r.params, paramsPreset(cle, sans))).toBe(true)
        expect(r.params.retoursCourantsBase).toBe(14)
        expect(r.params.croissanceLongTermePct).toBe(1.2)
        expect(r.params.inflationPct).toBe(1.5)
        expect(r.params.ecartDepensesPct).toBe(0)
        expect(r.params.tauxRecettesActivitePct).toBeCloseTo(35, 12)
        expect(r.params.rendementCapitalPct).toBe(0)
        expect(r.params.substitutionImports).toBe(0)
        expect(r.params.tauxBonificationPct).toBe(0)
        expect(r.params.partPretsUtilisesPct).toBe(100)
        expect(r.params.dureeMonteeInvestissement).toBe(10)
        expect(r.params.ecartPrixElectricite).toBe(0)
        expect(r.params.anneesEcartElectricite).toBe(2)
        expect(r.params.rachatEngie).toBe(true)
        expect(r.params.cadesCompteDansSolde).toBe(true)
        expect(r.rho).toBe(0.5)
        expect(reconnaitrePreset(r.params)).toEqual({ cle, sansLeviers: sans })
      }
  })
  it('l’horizon revient à celui du préréglage', () => {
    expect(parametresDeReinitialisation('an1', false).params.horizon).toBe('an1')
    expect(parametresDeReinitialisation('haut', false).params.horizon).toBe('anneePleine')
  })
  it('replie sur « complet » (avec leviers) sans préréglage connu', () => {
    const r = parametresDeReinitialisation(null, false)
    expect(r.cle).toBe('complet')
    expect(memeParamsStrict(r.params, paramsPreset('complet', false))).toBe(true)
    expect(parametresDeReinitialisation(undefined, false).cle).toBe('complet')
  })
  it('un préréglage sans variante ignore l’interrupteur', () => {
    const r = parametresDeReinitialisation('stress', true)
    expect(r.sansLeviers).toBe(false)
    expect(memeParamsStrict(r.params, paramsPreset('stress', false))).toBe(true)
  })
  it('détecte un écart avec la référence (croissance modifiée)', () => {
    const ref = parametresDeReinitialisation('complet', false)
    expect(memeParamsStrict({ ...ref.params, croissanceLongTermePct: 1 }, ref.params)).toBe(false)
  })
})
