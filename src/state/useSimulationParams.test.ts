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
  it('les hypothèses macroéconomiques sont synchronisées avec l’URL et bornées', () => {
    const d = lireUrl('').params
    expect([d.croissanceLongTermePct, d.inflationPct, d.ecartDepensesPct]).toEqual([1.2, 1.5, 0])
    expect(d.tauxRecettesActivitePct).toBeCloseTo(35, 12)
    const macro = { croissanceLongTermePct: -0.3, inflationPct: 2.1, ecartDepensesPct: -0.5, tauxRecettesActivitePct: 42 }
    const e = lireUrl(ecrireUrl({ params: { ...PARAMS_PAR_DEFAUT, ...macro }, rho: 0.5, onglet: 'simulateur' }))
    expect(e.params).toEqual({ ...PARAMS_PAR_DEFAUT, ...macro })
    const b = lireUrl('?gl=9&in=-2&ed=-5&tx=90').params
    expect([b.croissanceLongTermePct, b.inflationPct, b.ecartDepensesPct, b.tauxRecettesActivitePct]).toEqual([3, 0, -2, 55])
  })
  it('anciens liens : la croissance nominale « cr » est ignorée (elle valait toujours 2,5 %, valeur par défaut d’alors)', () => {
    expect(lireUrl('?cr=2.5').params.croissanceLongTermePct).toBe(1.2)
    expect(lireUrl('?cr=9').params.croissanceLongTermePct).toBe(1.2)
    expect(lireUrl('?cr=2.5&gl=0.2').params.croissanceLongTermePct).toBe(0.2)
  })
  it('l’effet durable des investissements est synchronisé avec l’URL et borné', () => {
    expect(lireUrl('').params.rendementCapitalPct).toBe(0)
    expect(lireUrl('?rk=0').params.rendementCapitalPct).toBe(0)
    expect(lireUrl('?rk=12').params.rendementCapitalPct).toBe(12)
    expect(lireUrl('?rk=50').params.rendementCapitalPct).toBe(20)
    const e = lireUrl(ecrireUrl({ params: { ...PARAMS_PAR_DEFAUT, rendementCapitalPct: 8 }, rho: 0.5, onglet: 'simulateur' }))
    expect(e.params.rendementCapitalPct).toBe(8)
  })
  it('le report de la demande vers des produits français est synchronisé avec l’URL et borné', () => {
    expect(lireUrl('').params.substitutionImports).toBe(0)
    expect(lireUrl('?si=0.5').params.substitutionImports).toBe(0.5)
    expect(lireUrl('?si=9').params.substitutionImports).toBe(2)
    expect(lireUrl('?si=-1').params.substitutionImports).toBe(0)
    const e = lireUrl(ecrireUrl({ params: { ...PARAMS_PAR_DEFAUT, substitutionImports: 1.3 }, rho: 0.5, onglet: 'simulateur' }))
    expect(e.params.substitutionImports).toBe(1.3)
  })
  it('le taux de bonification est synchronisé avec l’URL', () => {
    expect(lireUrl('').params.tauxBonificationPct).toBe(0)
    expect(lireUrl('?bo=4.5').params.tauxBonificationPct).toBe(4.5)
    expect(lireUrl('?bo=20').params.tauxBonificationPct).toBe(8)
  })
  it('la part des prêts empruntée et la durée de montée en charge de l’investissement sont synchronisées avec l’URL et bornées', () => {
    expect(lireUrl('').params.partPretsUtilisesPct).toBe(100)
    expect(lireUrl('?pu=27').params.partPretsUtilisesPct).toBe(27)
    expect(lireUrl('?pu=150').params.partPretsUtilisesPct).toBe(100)
    expect(lireUrl('?pu=-5').params.partPretsUtilisesPct).toBe(0)
    expect(lireUrl('').params.dureeMonteeInvestissement).toBe(10)
    expect(lireUrl('?di=15').params.dureeMonteeInvestissement).toBe(15)
    expect(lireUrl('?di=50').params.dureeMonteeInvestissement).toBe(30)
    expect(lireUrl('?di=2').params.dureeMonteeInvestissement).toBe(10)
    const e = lireUrl(ecrireUrl({ params: { ...PARAMS_PAR_DEFAUT, partPretsUtilisesPct: 40, dureeMonteeInvestissement: 20 }, rho: 0.5, onglet: 'simulateur' }))
    expect(e.params.partPretsUtilisesPct).toBe(40)
    expect(e.params.dureeMonteeInvestissement).toBe(20)
  })
  it('une ancienne URL avec l’année pleine (ai) est lue sans erreur : le paramètre est ignoré', () => {
    for (const q of ['?ai=2031', '?ai=2040', '?ai=abc', '?ai=2033&pu=27']) {
      const e = lireUrl(q)
      expect(e.params.dureeMonteeInvestissement).toBe(10)
      expect(e.onglet).toBe('simulateur')
    }
    expect(lireUrl('?ai=2033&pu=27').params.partPretsUtilisesPct).toBe(27)
    expect(Object.keys(lireUrl('?ai=2031').params)).not.toContain('anneePleineInvestissement')
    expect(ecrireUrl({ params: PARAMS_PAR_DEFAUT, rho: 0.5, onglet: 'simulateur' })).not.toContain('ai=')
  })
  it('l’électricité à prix régulé et le rachat d’Engie sont synchronisés avec l’URL et bornés', () => {
    const d = lireUrl('').params
    expect(d.ecartPrixElectricite).toBe(0)
    expect(d.anneesEcartElectricite).toBe(2)
    expect(d.rachatEngie).toBe(true)
    expect(lireUrl('?pe=48').params.ecartPrixElectricite).toBe(48)
    expect(lireUrl('?pe=500').params.ecartPrixElectricite).toBe(100)
    expect(lireUrl('?pe=-50').params.ecartPrixElectricite).toBe(-20)
    expect(lireUrl('?ne=5').params.anneesEcartElectricite).toBe(5)
    expect(lireUrl('?ne=20').params.anneesEcartElectricite).toBe(8)
    expect(lireUrl('?ne=0').params.anneesEcartElectricite).toBe(1)
    expect(lireUrl('?re=0').params.rachatEngie).toBe(false)
    expect(lireUrl('?re=1').params.rachatEngie).toBe(true)
    const e = lireUrl(ecrireUrl({ params: { ...PARAMS_PAR_DEFAUT, ecartPrixElectricite: -12, anneesEcartElectricite: 4, rachatEngie: false }, rho: 0.5, onglet: 'simulateur' }))
    expect(e.params.ecartPrixElectricite).toBe(-12)
    expect(e.params.anneesEcartElectricite).toBe(4)
    expect(e.params.rachatEngie).toBe(false)
  })
})
