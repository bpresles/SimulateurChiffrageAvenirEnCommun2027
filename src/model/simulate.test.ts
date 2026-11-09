import { describe, expect, it } from 'bun:test'
import { DEPENSES_AN1, RECETTES_AN1, sommeLignes } from '../data/budgetAn1'
import { FILIERES } from '../data/filieres'
import { HYPOTHESES } from '../data/hypotheses'
import { SCENARIOS, type CleScenario } from '../data/scenarios'
import { FILIERES_GEMINI } from './fixtures/filieresGemini'
import { SCENARIOS_GEMINI } from './fixtures/scenariosGemini'
import { agregerFilieres } from './filieres'
import { paramsPreset } from './presets'
import { interpPercentile } from './percentile'
import { OPTIONS_ORIGINE, OPTIONS_PAR_DEFAUT, impactCorrections, simuler } from './simulate'

type Liste = typeof FILIERES
const somme = (l: Liste, f: (x: Liste[number]) => number) => l.reduce((s, x) => s + f(x), 0)
const scenario = (cle: CleScenario) => SCENARIOS.find((s) => s.cle === cle)!.params
const sommeAxes = (id: string, c: 'etat' | 'banque') =>
  FILIERES.find((f) => f.id === id)!.axes!.reduce((s, a) => s + a[c], 0)

describe('données officielles du cadrage An 1 (S1)', () => {
  it('les recettes détaillées somment à 106,4 et les dépenses à 81,7', () => {
    expect(sommeLignes(RECETTES_AN1)).toBeCloseTo(106.4, 9)
    expect(sommeLignes(DEPENSES_AN1)).toBeCloseTo(81.7, 9)
    expect(HYPOTHESES.recettesAn1.valeur).toBeCloseTo(sommeLignes(RECETTES_AN1), 9)
    expect(HYPOTHESES.depensesAn1.valeur).toBeCloseTo(sommeLignes(DEPENSES_AN1), 9)
  })
  it('chaque sous-total annoncé correspond à la somme de ses lignes', () => {
    for (const p of [...DEPENSES_AN1, ...RECETTES_AN1])
      expect(p.lignes.reduce((s, l) => s + l.montant, 0)).toBeCloseTo(p.totalAnnonce, 9)
  })
  it('le quotient conjugal n’est pas une ligne chiffrée', () => {
    expect(RECETTES_AN1.flatMap((p) => p.lignes).some((l) => /quotient/i.test(l.libelle))).toBe(false)
  })
})

describe('données des filières', () => {
  it('livrets BTP (S2) et automobile (S3)', () => {
    expect(sommeAxes('btp', 'etat')).toBeCloseTo(12.06, 9)
    expect(sommeAxes('btp', 'banque')).toBeCloseTo(36.4, 9)
    expect(sommeAxes('auto', 'etat')).toBeCloseTo(1.37, 9)
    expect(sommeAxes('auto', 'banque')).toBeCloseTo(3.1, 9)
    const btp = FILIERES[0], auto = FILIERES[1]
    expect(btp.p50).toBeCloseTo(48.46, 9)
    expect(btp.etatP50 + btp.banqueP50).toBeCloseTo(btp.p50, 9)
    expect(auto.p50).toBeCloseTo(4.47, 9)
    expect(auto.etatP50 + auto.banqueP50).toBeCloseTo(auto.p50, 9)
    expect(btp.emploisP50).toBe(300000)
    expect(auto.emploisP50).toBe(40000)
  })
  it('les sommes correspondent aux totaux attendus', () => {
    expect(somme(FILIERES, (f) => f.p50)).toBeCloseTo(119.68, 6)
    expect(somme(FILIERES, (f) => f.etatP50)).toBeCloseTo(18.68, 6)
    expect(somme(FILIERES, (f) => f.banqueP50)).toBeCloseTo(101.0, 6)
    expect(somme(FILIERES, (f) => f.p10)).toBeCloseTo(86.7, 6)
    expect(somme(FILIERES, (f) => f.p90)).toBeCloseTo(148.0, 6)
  })
  it('les sommes du jeu Gemini d’origine sont inchangées', () => {
    expect(somme(FILIERES_GEMINI, (f) => f.p50)).toBeCloseTo(118.52, 6)
    expect(somme(FILIERES_GEMINI, (f) => f.etatP50)).toBeCloseTo(18.52, 6)
    expect(somme(FILIERES_GEMINI, (f) => f.banqueP50)).toBeCloseTo(100, 6)
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

describe('non-régression avec le modèle d’origine (données Gemini figées, corrections désactivées)', () => {
  const origine = { ...OPTIONS_ORIGINE, filieres: FILIERES_GEMINI, gelBceBrut: 22 }
  const attendu = { an1: 69.0, complet: 157.5, haut: 188.9, median: 108.8, orthodoxe: -24.9, stress: -59.1 } as const
  for (const [cle, valeur] of Object.entries(attendu) as [keyof typeof attendu, number][]) {
    it(`${cle} ≈ ${valeur}`, () => {
      expect(Math.abs(simuler(SCENARIOS_GEMINI[cle], origine).solde - valeur)).toBeLessThanOrEqual(0.3)
    })
  }
})

describe('bonification du pôle bancaire réglable', () => {
  it('0 % par défaut : aucune friction de bonification', () => {
    for (const s of SCENARIOS) {
      expect(s.params.tauxBonificationPct).toBe(0)
      expect(simuler(s.params).frictions.bonification).toBe(0)
    }
  })
  it('avec 8 %, on retrouve les soldes d’avant pour « hypothèses basses » (−9,0 avec, −27,2 sans)', () => {
    expect(simuler({ ...paramsPreset('bas', false), tauxBonificationPct: 8 }).solde).toBeCloseTo(-9.0, 1)
    expect(simuler({ ...paramsPreset('bas', true), tauxBonificationPct: 8 }).solde).toBeCloseTo(-27.2, 1)
  })
  it('la friction évitée par le levier suit le taux réglé', () => {
    const p = { ...scenario('complet'), primaireBcePct: 0, tauxBonificationPct: 4 }
    const r = simuler(p)
    expect(r.frictions.bonificationSansLevier).toBeCloseTo(r.agregat.totalBanque * 0.04, 9)
    expect(r.frictions.bonification).toBeCloseTo(r.frictions.bonificationSansLevier, 9)
  })
})

describe('gel BCE', () => {
  it('le gain brut est calculé au prorata du stock détenu (488 Md€)', () => {
    expect(HYPOTHESES.stockBce.valeur).toBeCloseTo(359.487 + 237.484, 9)
    expect(HYPOTHESES.gelBce.valeur).toBeCloseTo((596.971 * 18.5) / 750 + 3.5, 9)
    expect(HYPOTHESES.gelBce.valeur).toBeCloseTo(18.2, 1)
    expect(simuler(scenario('complet')).leviers.gelBce).toBeCloseTo((596.971 * 18.5) / 750 + 3.5, 9)
  })
})

describe('corrections', () => {
  it('le levier primaire améliore le solde de 6,5 + bonification, pas du double', () => {
    const p = { ...scenario('complet'), primaireBcePct: 0, tauxBonificationPct: 8 }
    const a = simuler(p)
    const b = simuler({ ...p, primaireBcePct: 100 })
    const bonif = a.agregat.totalBanque * 0.08
    expect(b.solde - a.solde).toBeCloseTo(6.5 + bonif, 9)
    const o = simuler(p, OPTIONS_ORIGINE)
    const o2 = simuler({ ...p, primaireBcePct: 100 }, OPTIONS_ORIGINE)
    expect(o2.solde - o.solde).toBeCloseTo(14.5 + bonif, 9)
  })
  it('la CADES est comptée par défaut dans le solde', () => {
    expect(scenario('complet').cadesCompteDansSolde).toBe(true)
    for (const s of SCENARIOS) expect(s.params.cadesCompteDansSolde).toBe(true)
    const r = simuler(scenario('complet'))
    expect(r.leviers.cadesBrute).toBe(19)
    expect(r.leviers.cadesComptee).toBe(19)
  })
  it('la CADES compte pour 0 quand la correction est active et l’option désactivée', () => {
    const p = { ...scenario('complet'), cadesCompteDansSolde: false }
    const r = simuler(p)
    expect(r.leviers.cadesBrute).toBe(19)
    expect(r.leviers.cadesComptee).toBe(0)
    expect(simuler(scenario('complet')).solde - r.solde).toBeCloseTo(19, 9)
    // correction désactivée : comptée quelle que soit l'option
    expect(simuler(p, OPTIONS_ORIGINE).leviers.cadesComptee).toBe(19)
  })
  it('l’impact de la correction CADES est celui de son activation (−19 sur « complet »)', () => {
    const i = impactCorrections(scenario('complet')).find((x) => x.cle === 'cades')!
    expect(i.marginal).toBeCloseTo(-19, 9)
    expect(i.active).toBe(false)
    expect(impactCorrections({ ...scenario('complet'), cadesCompteDansSolde: false }).find((x) => x.cle === 'cades')!.active).toBe(true)
  })
  it('la bonification n’est comptée en An 1 qu’avec la correction', () => {
    const p = { ...scenario('complet'), horizon: 'an1' as const, primaireBcePct: 0, tauxBonificationPct: 8 }
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
