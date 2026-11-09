import { describe, expect, it } from 'bun:test'
import { FILIERES, SUBSTITUTION_IMPORTS } from '../data/filieres'
import { hv } from '../data/hypotheses'
import { SCENARIOS } from '../data/scenarios'
import { COUT_RACHAT_ENGIE, MESURES_NULLES, PART_NUCLEAIRE, SEUIL_ECRETEMENT_VNU, SEUIL_TAXATION_VNU, gainParMwh, minorationVnu, MULTIPLICATEUR_PIB, PART_DIRECTE, MD_PAR_EUR_MWH, type MesuresHorsMoteur } from './electricite'
import { mainOeuvreDepuisParams, partDirecteEmplois } from './mainOeuvre'
import { simuler } from './simulate'
import {
  ANNEES,
  COMPOSANTES_NULLES,
  FILIERES_SUBSTITUTION,
  MACRO_PAR_DEFAUT,
  ameliorationDeficit,
  calculerTrajectoire,
  composantesProgramme,
  croissanceTendanciellePct,
  effetProgramme,
  macroDepuisParams,
  mesuresDepuisParams,
  pibTendanciel,
  rythmeInvestissement,
  trajectoiresPourParams,
  type ComposantesProgramme,
  type HypothesesMacro,
} from './trajectoire'

const complet = SCENARIOS.find((s) => s.cle === 'complet')!.params
/** Préréglage complet sans effet d'offre ni report : isole l'effet de demande (réglages explicitement à 0). */
const sansCapital = { ...complet, rendementCapitalPct: 0, substitutionImports: 0 }
const macro = (m: Partial<HypothesesMacro>): HypothesesMacro => ({ ...MACRO_PAR_DEFAUT, ...m })
/** Ni croissance réelle (aucune année prévue, long terme nul) ni inflation. */
const FIGE = { croissancePrevuePct: {}, croissanceLongTermePct: 0, inflationPct: 0 }
const tendanciel = (m: HypothesesMacro = MACRO_PAR_DEFAUT) => calculerTrajectoire(COMPOSANTES_NULLES, COMPOSANTES_NULLES, 0, m)
const sansActivite = (c: ComposantesProgramme): ComposantesProgramme => ({
  ...c, pibFilieres: 0, investissement: 0, investissementSubstitution: 0, pibDepensesCourantes: 0, pibRecessif: 0,
})
const annee = <T extends { annee: number }>(l: T[], a: number) => l.find((x) => x.annee === a)!

describe('montée en charge du programme', () => {
  it('0 en 2026, An 1 en 2027, interpolation puis année pleine dès 2030', () => {
    expect(effetProgramme(2026, 10, 40)).toBe(0)
    expect(effetProgramme(2027, 10, 40)).toBe(10)
    expect(effetProgramme(2028, 10, 40)).toBeCloseTo(20, 9)
    expect(effetProgramme(2029, 10, 40)).toBeCloseTo(30, 9)
    expect(effetProgramme(2030, 10, 40)).toBe(40)
    expect(effetProgramme(2032, 10, 40)).toBe(40)
  })
  it('investissement des filières : 0 en 2026 et 2027, puis année pleine × min(1, (année − 2027) / D)', () => {
    expect(rythmeInvestissement(2026, 40, 10)).toBe(0)
    expect(rythmeInvestissement(2027, 40, 10)).toBe(0)
    expect(rythmeInvestissement(2028, 40, 10)).toBeCloseTo(4, 9)
    expect(rythmeInvestissement(2032, 40, 10)).toBeCloseTo(20, 9)
    expect(rythmeInvestissement(2037, 40, 10)).toBe(40)
    expect(rythmeInvestissement(2040, 40, 10)).toBe(40)
    expect(rythmeInvestissement(2032, 40, 20)).toBeCloseTo(10, 9)
    expect(rythmeInvestissement(2032, 40, 20)).toBeLessThan(rythmeInvestissement(2032, 40, 10))
  })
})

describe('scénario tendanciel', () => {
  it('croissance réelle de l’Insee et de la Banque de France en 2026-2028, puis croissance de long terme', () => {
    expect(ANNEES.map((a) => croissanceTendanciellePct(a))).toEqual([0.4, 0.9, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2])
    expect(tendanciel().points.map((p) => p.croissanceReellePct)).toEqual(ANNEES.map((a) => expect.closeTo(croissanceTendanciellePct(a), 9)))
    const m = macro({ croissanceLongTermePct: 2 })
    expect(ANNEES.map((a) => croissanceTendanciellePct(a, m))).toEqual([0.4, 0.9, 1.2, 2, 2, 2, 2, 2, 2, 2])
  })
  it('part du PIB 2025 de l’Insee, porté par la croissance de chaque année et l’inflation', () => {
    expect(pibTendanciel(2025)).toBe(hv('pib2025'))
    expect(pibTendanciel(2026)).toBeCloseTo(hv('pib2025') * 1.004 * 1.015, 9)
    expect(pibTendanciel(2029)).toBeCloseTo(hv('pib2025') * 1.004 * 1.009 * 1.012 * 1.012 * Math.pow(1.015, 4), 9)
  })
  it('dépenses au rythme du PIB (écart nul) : déficit tendanciel constant de 5,4 %, quelle que soit la croissance', () => {
    for (const g of [-1, 0, 1.2, 3])
      for (const p of tendanciel(macro({ croissanceLongTermePct: g })).points) expect(p.soldePct).toBeCloseTo(-5.4, 9)
    for (const p of tendanciel(macro(FIGE)).points) expect(p.soldePct).toBeCloseTo(-5.4, 9)
  })
  it('écart des dépenses : négatif, le déficit tendanciel se réduit ; positif, il se creuse ; 2026 reste à 5,4 %', () => {
    const econome = tendanciel(macro({ ecartDepensesPct: -0.5 })).points
    const depensier = tendanciel(macro({ ecartDepensesPct: 0.5 })).points
    expect(econome[0].soldePct).toBeCloseTo(-5.4, 9)
    expect(depensier[0].soldePct).toBeCloseTo(-5.4, 9)
    for (let i = 1; i < econome.length; i++) {
      expect(econome[i].soldePct).toBeGreaterThan(econome[i - 1].soldePct)
      expect(depensier[i].soldePct).toBeLessThan(depensier[i - 1].soldePct)
    }
  })
  it('aucun effet du programme', () => {
    for (const e of tendanciel().effets) expect(e.effet).toBe(0)
  })
})

describe('tous les facteurs du moteur sont repris', () => {
  for (const s of SCENARIOS)
    it(`${s.cle} : identité comptable avec le solde du moteur (An 1 et année pleine)`, () => {
      for (const horizon of ['an1', 'anneePleine'] as const) {
        const r = simuler({ ...s.params, horizon })
        const c = composantesProgramme(r, s.params.multiplicateur)
        const k = hv('tauxRetourFiscalPib')
        const reconstitue =
          c.prelevements + k * (c.pibDepensesCourantes + c.pibRecessif) + r.roiDirectFilieres + r.roiIndirect +
          c.coutsEvites + c.leviers - c.depenses - c.frictions
        expect(reconstitue).toBeCloseTo(r.solde, 9)
        expect(c.soldeMoteur).toBe(r.solde)
      }
    })
  it('sans croissance ni inflation et sans surcroît d’activité, l’effet vaut les montants du moteur hors retours', () => {
    const t = trajectoiresPourParams(complet)
    // Durée de 3 ans : l'investissement des filières est à plein rythme dès 2030 (le moteur n'impose pas la borne de 10 ans du curseur).
    const m = macro({ ...FIGE, dureeMonteeInvestissement: 3 })
    const { effets } = calculerTrajectoire(sansActivite(t.composantesAn1), sansActivite(t.composantesAP), 0, m)
    const attendu = (c: ComposantesProgramme) => c.prelevements + c.coutsEvites + c.leviers - c.depenses - c.frictions
    // En 2027, les flux d'investissement (coûts évités, part de l'État, bonification) sont nuls ; le reste suit l'An 1.
    const an1 = t.composantesAn1
    expect(annee(effets, 2027).coutsEvites).toBe(0)
    expect(annee(effets, 2027).effet).toBeCloseTo(
      an1.prelevements + an1.leviers - (an1.depenses - an1.depensesInvestissement) - (an1.frictions - an1.bonification), 9)
    expect(annee(effets, 2030).effet).toBeCloseTo(attendu(t.composantesAP), 9)
    expect(annee(effets, 2030).prelevements).toBeCloseTo(t.composantesAP.prelevements, 9)
  })
  it('à 35 centimes par euro, retours courants et effet récessif égalent ceux du moteur', () => {
    const r = simuler({ ...complet, horizon: 'anneePleine' })
    const c = composantesProgramme(r, complet.multiplicateur)
    const m = macro({ ...FIGE, tauxRecettesActivitePct: 35, rendementCapitalPct: 0, substitutionImports: 0 })
    const e = annee(calculerTrajectoire(COMPOSANTES_NULLES, { ...c, pibFilieres: 0, investissement: 0 }, 0, m).effets, 2030)
    expect(e.recettesInduites).toBeCloseTo(r.retoursCourants + r.effetRecessif, 9)
  })
})

describe('trajectoire avec le programme', () => {
  const t = trajectoiresPourParams(sansCapital)
  it('recettes sur le surcroît d’activité = taux × surcroît de PIB, effet = somme des lignes', () => {
    for (const e of t.effets) {
      expect(e.recettesInduites).toBeCloseTo((complet.tauxRecettesActivitePct / 100) * e.deltaPib, 9)
      expect(e.deltaPib).toBeCloseTo(
        e.deltaPibFilieres + e.deltaPibDepensesCourantes + e.deltaPibRecessif + e.deltaPibOffre + e.deltaPibSubstitution + e.deltaPibElectricite, 9)
      expect(e.effet).toBeCloseTo(
        e.prelevements + e.recettesInduites + e.coutsEvites + e.leviers - e.depenses - e.frictions + e.electriciteDirect
          - e.depensesNouveauxHabitants + e.recettesRegularisation, 9)
    }
    for (const a of ANNEES) {
      expect(annee(t.programme, a).solde - annee(t.tendanciel, a).solde).toBeCloseTo(annee(t.effets, a).effet, 9)
      expect(annee(t.programme, a).pib - annee(t.tendanciel, a).pib).toBeCloseTo(annee(t.effets, a).deltaPib, 9)
    }
  })
  it('2027 reprend l’An 1 en euros 2027, les années suivantes sont indexées sur l’inflation', () => {
    const e27 = annee(t.effets, 2027)
    expect(e27.depenses).toBeCloseTo(t.composantesAn1.depenses, 9)
    const prix = Math.pow(1 + complet.inflationPct / 100, 5)
    const ap = t.composantesAP
    const rythme = Math.min(1, (2032 - 2027) / complet.dureeMonteeInvestissement)
    expect(annee(t.effets, 2032).depenses).toBeCloseTo((ap.depenses - ap.depensesInvestissement) * prix + ap.depensesInvestissement * rythme * prix, 9)
  })
  it('prélèvements nouveaux proportionnels au PIB avec programme', () => {
    const taux = (a: number) => annee(t.effets, a).prelevements / annee(t.programme, a).pib
    expect(taux(2031)).toBeCloseTo(taux(2030), 12)
    expect(taux(2030)).toBeCloseTo(t.composantesAP.prelevements / pibTendanciel(2027), 12)
  })
  it('r = 0 (réglage explicite), effet de demande seul : la croissance reste au-dessus de la tendance pendant toute la montée en charge de 10 ans', () => {
    expect(sansCapital.rendementCapitalPct).toBe(0)
    expect(complet.dureeMonteeInvestissement).toBe(10)
    expect(annee(t.programme, 2026).croissanceReellePct).toBeCloseTo(0.4, 9)
    // L'investissement des filières monte en charge de 2028 à 2037 : au-delà de l'horizon, la croissance reste au-dessus de la tendance.
    for (const a of [2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035])
      expect(annee(t.programme, a).croissanceReellePct).toBeGreaterThan(annee(t.tendanciel, a).croissanceReellePct)
    // Rythme complet atteint dans l'horizon (D = 5, via le moteur) : la croissance revient ensuite vers la tendance.
    const court = calculerTrajectoire(t.composantesAn1, t.composantesAP, 0, macro({ dureeMonteeInvestissement: 5, rendementCapitalPct: 0, substitutionImports: 0 }))
    for (const a of [2033, 2034, 2035]) {
      expect(annee(court.points, a).croissanceReellePct).toBeGreaterThan(annee(t.tendanciel, a).croissanceReellePct - 0.1)
      expect(annee(court.points, a).croissanceReellePct).toBeLessThanOrEqual(annee(t.tendanciel, a).croissanceReellePct)
    }
    for (const e of t.effets) expect(e.deltaPibOffre).toBe(0)
  })
  it('l’investissement des filières est nul en 2026 et 2027 : surcroît de PIB, coûts évités, capital et bonification', () => {
    for (const a of [2026, 2027]) {
      const e = annee(t.effets, a)
      expect(e.deltaPibFilieres).toBe(0)
      expect(e.coutsEvites).toBe(0)
      expect(e.capital).toBe(0)
      expect(e.deltaPibSubstitution).toBe(0)
    }
    expect(annee(t.effets, 2028).deltaPibFilieres).toBeGreaterThan(0)
    expect(annee(t.effets, 2028).capital).toBe(0)
    expect(annee(t.effets, 2029).capital).toBeGreaterThan(0)
  })
  it('rampe linéaire selon D : le rythme d’une année vaut l’année pleine × (année − 2027) / D', () => {
    const prix = (a: number) => Math.pow(1 + complet.inflationPct / 100, a - 2027)
    for (const d of [10, 15, 20]) {
      const u = trajectoiresPourParams({ ...complet, dureeMonteeInvestissement: d })
      for (const a of ANNEES) {
        const part = a <= 2027 ? 0 : Math.min(1, (a - 2027) / d)
        const e = annee(u.effets, a)
        expect(e.deltaPibFilieres).toBeCloseTo(u.composantesAP.pibFilieres * part * prix(a), 9)
        expect(e.coutsEvites).toBeCloseTo(u.composantesAP.coutsEvites * part * prix(a), 9)
        expect(e.depenses).toBeCloseTo(
          (effetProgramme(a, u.composantesAn1.depenses - u.composantesAn1.depensesInvestissement, u.composantesAP.depenses - u.composantesAP.depensesInvestissement)
            + u.composantesAP.depensesInvestissement * part) * prix(a), 9)
      }
    }
    // Avec 10 ans, environ la moitié du rythme est atteinte en 2032.
    expect(annee(t.effets, 2032).deltaPibFilieres / prix(2032) / t.composantesAP.pibFilieres).toBeCloseTo(0.5, 9)
  })
  it('effet de D : plus la montée en charge est longue, moins de PIB et de coûts évités, un déficit plus lourd à moyen terme ; le moteur est inchangé', () => {
    const court = trajectoiresPourParams({ ...complet, dureeMonteeInvestissement: 10 })
    const long = trajectoiresPourParams({ ...complet, dureeMonteeInvestissement: 20 })
    for (const a of [2030, 2032, 2035]) {
      expect(annee(long.effets, a).deltaPibFilieres).toBeLessThan(annee(court.effets, a).deltaPibFilieres)
      expect(annee(long.effets, a).coutsEvites).toBeLessThan(annee(court.effets, a).coutsEvites)
    }
    // Les autres mesures gardent leur calendrier 2027-2030.
    for (const a of ANNEES) {
      expect(annee(long.effets, a).leviers).toBeCloseTo(annee(court.effets, a).leviers, 9)
      expect(annee(long.effets, a).prelevements / annee(long.programme, a).pib).toBeCloseTo(annee(court.effets, a).prelevements / annee(court.programme, a).pib, 12)
    }
    expect(long.composantesAn1).toEqual(court.composantesAn1)
    expect(long.composantesAP).toEqual(court.composantesAP)
    expect(annee(long.programme, 2032).soldePct).not.toBeCloseTo(annee(court.programme, 2032).soldePct, 6)
  })
  it('effet d’offre (option) : le capital accumulé produit dès l’année suivante et maintient la croissance au-dessus de la tendance', () => {
    const o = trajectoiresPourParams({ ...complet, rendementCapitalPct: 5 })
    const r = 0.05
    expect(annee(o.effets, 2026).deltaPibOffre).toBe(0)
    expect(annee(o.effets, 2027).deltaPibOffre).toBe(0)
    let cumul = 0
    for (const a of ANNEES) {
      const e = annee(o.effets, a)
      const prix = Math.pow(1 + complet.inflationPct / 100, a - 2027)
      expect(e.capital).toBeCloseTo(cumul * prix, 9)
      expect(e.deltaPibOffre).toBeCloseTo(r * cumul * prix, 9)
      cumul += rythmeInvestissement(a, o.composantesAP.investissement, complet.dureeMonteeInvestissement)
    }
    for (let a = 2030; a <= 2032; a++) expect(annee(o.effets, a).deltaPibOffre).toBeGreaterThan(annee(o.effets, a - 1).deltaPibOffre)
    for (const a of [2031, 2032]) expect(annee(o.programme, a).croissanceReellePct).toBeGreaterThan(annee(o.tendanciel, a).croissanceReellePct)
    expect(annee(o.programme, 2032).soldePct).toBeGreaterThan(annee(t.programme, 2032).soldePct)
    expect(t.composantesAP.investissement * complet.multiplicateur).toBeCloseTo(t.composantesAP.pibFilieres, 9)
  })
  it('la dette suit dette_t = dette_{t-1} − solde_t ; indicateur hors BCE dès 2027', () => {
    const p = calculerTrajectoire(t.composantesAn1, t.composantesAP, 100).points
    expect(p[0].dette).toBe(hv('dette2026'))
    expect(p[0].detteHorsBcePct).toBeNull()
    for (let i = 1; i < p.length; i++) expect(p[i].dette).toBeCloseTo(p[i - 1].dette - p[i].solde, 9)
    expect(p[1].detteHorsBcePct).toBeCloseTo(((p[1].dette - hv('stockBce')) / p[1].pib) * 100, 9)
  })
  it('plus de croissance ou de recettes par euro de PIB améliore le solde ; le moteur n’en dépend pas', () => {
    const fort = trajectoiresPourParams({ ...complet, croissanceLongTermePct: 2.5 })
    expect(fort.programme[6].soldePct).toBeGreaterThan(t.programme[6].soldePct)
    expect(fort.programme[6].dettePct).toBeLessThan(t.programme[6].dettePct)
    const riche = trajectoiresPourParams({ ...complet, tauxRecettesActivitePct: 50 })
    expect(annee(riche.effets, 2030).effet).toBeGreaterThan(annee(t.effets, 2030).effet)
    expect(simuler({
      ...complet, croissanceLongTermePct: -1, inflationPct: 4, ecartDepensesPct: 2, tauxRecettesActivitePct: 20, rendementCapitalPct: 20,
      substitutionImports: 2,
    }).solde).toBe(simuler(complet).solde)
  })
})

describe('report de la demande vers des produits français (garde-fous automatiques)', () => {
  const t = trajectoiresPourParams(sansCapital)
  const mu0 = hv('partImporteeDemande') / 100
  const muMin = hv('partImporteeMin') / 100
  const demande = (e: { deltaPibFilieres: number; deltaPibDepensesCourantes: number; deltaPibRecessif: number }) =>
    e.deltaPibFilieres + e.deltaPibDepensesCourantes + e.deltaPibRecessif

  it('part importée de départ 22 % (S18, 2019) et plancher 11 % (S18, 1965)', () => {
    expect(mu0).toBeCloseTo(0.22, 12)
    expect(muMin).toBeCloseTo(0.11, 12)
  })
  it('garde-fou : la liste d’éligibilité couvre exactement les dix filières, avec un motif pour chacune', () => {
    expect(Object.keys(SUBSTITUTION_IMPORTS).sort()).toEqual(FILIERES.map((f) => f.id).sort())
    for (const s of Object.values(SUBSTITUTION_IMPORTS)) expect(s.motif.length).toBeGreaterThan(20)
    expect([...FILIERES_SUBSTITUTION].sort()).toEqual(['agri', 'auto', 'industrie', 'mer', 'numerique'])
  })
  it('garde-fou : seul l’investissement des filières de biens échangeables entre dans le capital du report', () => {
    const r = simuler({ ...complet, horizon: 'anneePleine' })
    const attendu = r.agregat.details.filter((d) => SUBSTITUTION_IMPORTS[d.id].retenue).reduce((s, d) => s + d.invest, 0) * r.roiScale
    expect(t.composantesAP.investissementSubstitution).toBeCloseTo(attendu, 9)
    expect(t.composantesAP.investissementSubstitution).toBeGreaterThan(0)
    expect(t.composantesAP.investissementSubstitution).toBeLessThan(t.composantesAP.investissement)
    const sansEligibles = { ...t.composantesAP, investissementSubstitution: 0 }
    const e = calculerTrajectoire({ ...t.composantesAn1, investissementSubstitution: 0 }, sansEligibles, 0, macro({ substitutionImports: 2 })).effets
    for (const x of e) expect(x.deltaPibSubstitution).toBe(0)
  })
  it('valeurs par défaut : r = 2 %, α = 0,45 ; l’effet d’offre est retenu et le report est écarté', () => {
    expect(complet.rendementCapitalPct).toBe(2)
    expect(complet.substitutionImports).toBe(0.45)
    const d = trajectoiresPourParams(complet)
    const seul = trajectoiresPourParams({ ...complet, rendementCapitalPct: 0 })
    let ecartes = 0
    for (const a of ANNEES) {
      const e = annee(d.effets, a)
      const report = annee(seul.effets, a).deltaPibSubstitution
      if (e.deltaPibOffre > 0 && report > 0) {
        ecartes++
        expect(e.gainEcarte).toBe('substitution')
        expect(e.deltaPibSubstitution).toBe(0)
        expect(e.deltaPibOffre).toBeGreaterThan(report)
      }
    }
    expect(ecartes).toBeGreaterThan(0)
    expect(annee(d.effets, 2032).deltaPibOffre).toBeCloseTo(0.02 * annee(d.effets, 2032).capital, 9)
  })
  it('garde-fou : à α = 0 (réglage explicite), la trajectoire est exactement celle sans report', () => {
    expect(sansCapital.substitutionImports).toBe(0)
    for (const e of t.effets) {
      expect(e.deltaPibSubstitution).toBe(0)
      expect(e.partImporteePct).toBeCloseTo(22, 12)
      expect(e.gainEcarte).toBeNull()
      expect(e.deltaPib).toBe(e.deltaPibFilieres + e.deltaPibDepensesCourantes + e.deltaPibRecessif + e.deltaPibOffre)
    }
  })
  it('la part importée baisse avec le capital de l’année précédente ; le gain vaut (facteur − 1) × effets de demande', () => {
    const p = { ...sansCapital, substitutionImports: 1 }
    const s = trajectoiresPourParams(p)
    const m = macroDepuisParams(p)
    let cumul = 0
    for (const a of ANNEES) {
      const e = annee(s.effets, a)
      const prix = Math.pow(1 + p.inflationPct / 100, a - 2027)
      expect(e.capitalSubstitution).toBeCloseTo(cumul * prix, 9)
      const mu = Math.max(muMin, mu0 - (cumul * prix) / pibTendanciel(a, m))
      expect(e.partImporteePct).toBeCloseTo(mu * 100, 9)
      expect(e.deltaPibSubstitution).toBeCloseTo(((1 - mu) / (1 - mu0) - 1) * demande(e), 9)
      cumul += rythmeInvestissement(a, s.composantesAP.investissementSubstitution, p.dureeMonteeInvestissement)
    }
    expect(annee(s.effets, 2027).deltaPibSubstitution).toBe(0)
    for (let a = 2030; a <= 2032; a++) expect(annee(s.effets, a).deltaPibSubstitution).toBeGreaterThan(annee(s.effets, a - 1).deltaPibSubstitution)
    expect(annee(s.programme, 2032).soldePct).toBeGreaterThan(annee(t.programme, 2032).soldePct)
    // Le moteur et les autres composantes n'en dépendent pas.
    for (const a of ANNEES) {
      expect(annee(s.effets, a).deltaPibFilieres).toBe(annee(t.effets, a).deltaPibFilieres)
      expect(annee(s.effets, a).coutsEvites).toBe(annee(t.effets, a).coutsEvites)
    }
  })
  it('garde-fou : la part importée ne descend pas sous son plancher (gain au plus (1 − 11 %) / (1 − 22 %) − 1)', () => {
    const enorme = { ...t.composantesAP, investissementSubstitution: 2000 }
    const e = calculerTrajectoire({ ...t.composantesAn1, investissementSubstitution: 2000 }, enorme, 0, macro({ substitutionImports: 2 })).effets
    const e32 = annee(e, 2032)
    expect(e32.plancherAtteint).toBe(true)
    expect(e32.partImporteePct).toBeCloseTo(11, 9)
    expect(e32.deltaPibSubstitution).toBeCloseTo(((1 - muMin) / (1 - mu0) - 1) * demande(e32), 9)
    for (const x of e) expect(x.partImporteePct).toBeGreaterThanOrEqual(11 - 1e-9)
  })
  it('garde-fou : effet d’offre et report tous deux positifs, seul le plus grand compte', () => {
    const offre = trajectoiresPourParams({ ...complet, rendementCapitalPct: 5, substitutionImports: 0 })
    const report = trajectoiresPourParams({ ...complet, rendementCapitalPct: 0, substitutionImports: 2 })
    const lesDeux = trajectoiresPourParams({ ...complet, rendementCapitalPct: 5, substitutionImports: 2 })
    let ecartes = 0
    for (const a of ANNEES) {
      const o = annee(offre.effets, a).deltaPibOffre
      const r = annee(report.effets, a).deltaPibSubstitution
      const e = annee(lesDeux.effets, a)
      if (o > 0 && r > 0) {
        ecartes++
        expect(e.deltaPibOffre + e.deltaPibSubstitution).toBeCloseTo(Math.max(o, r), 9)
        expect(e.deltaPibOffre === 0 || e.deltaPibSubstitution === 0).toBe(true)
        expect(e.gainEcarte).toBe(o >= r ? 'substitution' : 'offre')
      } else {
        expect(e.deltaPibOffre).toBeCloseTo(o, 9)
        expect(e.deltaPibSubstitution).toBeCloseTo(r, 9)
        expect(e.gainEcarte).toBeNull()
      }
    }
    expect(ecartes).toBeGreaterThan(0)
  })
  it('si la demande créée est négative, le report (négatif) est conservé par prudence, sans écarter l’effet d’offre', () => {
    const recessif = { ...COMPOSANTES_NULLES, pibRecessif: -100, investissement: 50, investissementSubstitution: 50 }
    const e = annee(calculerTrajectoire(recessif, recessif, 0, macro({ substitutionImports: 2, rendementCapitalPct: 5 })).effets, 2030)
    expect(e.deltaPibSubstitution).toBeLessThan(0)
    expect(e.deltaPibOffre).toBeGreaterThan(0)
    expect(e.gainEcarte).toBeNull()
  })
})

describe('amélioration du déficit', () => {
  it('2030 par défaut : effet en Md€ courants et écart de solde en points de PIB', () => {
    const t = trajectoiresPourParams(complet)
    const r = ameliorationDeficit(t)
    expect(r.annee).toBe(2030)
    expect(r.effet).toBeCloseTo(annee(t.effets, 2030).effet, 9)
    expect(r.pointsPib).toBeCloseTo(annee(t.programme, 2030).soldePct - annee(t.tendanciel, 2030).soldePct, 9)
    expect(r.deficitTendanciel).toBeCloseTo(5.4, 9)
    expect(r.deficitProgramme).toBeCloseTo(-annee(t.programme, 2030).soldePct, 9)
    expect(r.suffisant).toBe(false)
  })
  it('un effet très favorable supprime le déficit', () => {
    const t = trajectoiresPourParams(complet)
    const fort = { ...COMPOSANTES_NULLES, prelevements: 400 }
    const r = ameliorationDeficit({ ...t, programme: calculerTrajectoire(fort, fort, 0).points, tendanciel: tendanciel().points })
    expect(r.suffisant).toBe(true)
  })
})

describe('réalisation de l’investissement : prêts empruntés et calendrier', () => {
  const rAP = simuler({ ...complet, horizon: 'anneePleine' })
  const details = rAP.agregat.details
  it('à 100 % de prêts empruntés, les composantes sont celles du moteur', () => {
    const c = composantesProgramme(rAP, complet.multiplicateur, 1)
    expect(c).toEqual(composantesProgramme(rAP, complet.multiplicateur))
    expect(c.investissement).toBeCloseTo(rAP.agregat.totalInvest * rAP.roiScale, 9)
    expect(c.coutsEvites).toBeCloseTo(rAP.coutsEvites, 9)
    expect(c.frictions).toBeCloseTo(rAP.frictions.total, 9)
    expect(c.bonification).toBeCloseTo(rAP.frictions.bonification, 9)
    expect(c.depensesInvestissement).toBe(rAP.depenses.ajoutEtat)
  })
  it('sans prêt emprunté, seul l’investissement financé par l’État a lieu ; dépenses inchangées', () => {
    const r = simuler({ ...complet, horizon: 'anneePleine', tauxBonificationPct: 4, primaireBcePct: 0 })
    const plein = composantesProgramme(r, complet.multiplicateur, 1)
    const c = composantesProgramme(r, complet.multiplicateur, 0)
    const etat = r.agregat.details.reduce((s, d) => s + d.invest - d.banque, 0)
    expect(c.investissement).toBeCloseTo(etat * r.roiScale, 9)
    expect(c.pibFilieres).toBeCloseTo(c.investissement * complet.multiplicateur, 9)
    expect(c.bonification).toBe(0)
    expect(r.frictions.bonification).toBeGreaterThan(0)
    expect(c.frictions).toBeCloseTo(r.frictions.total - r.frictions.bonification, 9)
    expect(c.depenses).toBe(plein.depenses)
    expect(c.prelevements).toBe(plein.prelevements)
    expect(c.leviers).toBe(plein.leviers)
    expect(c.coutsEvites).toBeLessThan(plein.coutsEvites)
  })
  it('à x %, investissement et coûts évités de chaque filière réduits des prêts non empruntés', () => {
    const x = 0.27
    const c = composantesProgramme(rAP, complet.multiplicateur, x)
    const realise = (d: (typeof details)[number]) => d.invest - (1 - x) * d.banque
    expect(c.investissement).toBeCloseTo(details.reduce((s, d) => s + realise(d), 0) * rAP.roiScale, 9)
    const sub = details.filter((d) => FILIERES_SUBSTITUTION.has(d.id)).reduce((s, d) => s + realise(d), 0)
    expect(c.investissementSubstitution).toBeCloseTo(sub * rAP.roiScale, 9)
    const evites = details.reduce((s, d) => s + d.evites, 0)
    const evitesRealises = details.reduce((s, d) => s + (d.evites * realise(d)) / d.invest, 0)
    expect(c.coutsEvites).toBeCloseTo((rAP.coutsEvites * evitesRealises) / evites, 9)
    expect(c.bonification).toBeCloseTo(rAP.frictions.bonification * x, 9)
  })
  it('moins de prêts empruntés : moins de PIB et un solde plus dégradé', () => {
    const t = trajectoiresPourParams(complet)
    const u = trajectoiresPourParams({ ...complet, partPretsUtilisesPct: 27 })
    for (const a of [2028, 2030, 2032]) {
      expect(annee(u.effets, a).deltaPibFilieres).toBeLessThan(annee(t.effets, a).deltaPibFilieres)
      expect(annee(u.effets, a).effet).toBeLessThan(annee(t.effets, a).effet)
      expect(annee(u.effets, a).prelevements).toBeLessThanOrEqual(annee(t.effets, a).prelevements)
    }
    expect(annee(u.effets, 2030).depenses).toBeCloseTo(annee(t.effets, 2030).depenses, 9)
  })
  it('seuls les flux liés à l’investissement sont étalés sur D ans ; les autres suivent le calendrier 2027-2030', () => {
    const t = trajectoiresPourParams(complet)
    const an1 = t.composantesAn1
    const ap = t.composantesAP
    const m = macro({})
    const d = m.dureeMonteeInvestissement
    const e = calculerTrajectoire(an1, ap, 0, m).effets
    const prix = (a: number) => Math.pow(1 + m.inflationPct / 100, a - 2027)
    for (const a of ANNEES) {
      expect(annee(e, a).deltaPibFilieres).toBeCloseTo(rythmeInvestissement(a, ap.pibFilieres, d) * prix(a), 9)
      expect(annee(e, a).coutsEvites).toBeCloseTo(rythmeInvestissement(a, ap.coutsEvites, d) * prix(a), 9)
      const depenses = effetProgramme(a, an1.depenses - an1.depensesInvestissement, ap.depenses - ap.depensesInvestissement)
        + rythmeInvestissement(a, ap.depensesInvestissement, d)
      expect(annee(e, a).depenses).toBeCloseTo(depenses * prix(a), 9)
      const frictions = effetProgramme(a, an1.frictions - an1.bonification, ap.frictions - ap.bonification)
        + rythmeInvestissement(a, ap.bonification, d)
      expect(annee(e, a).frictions).toBeCloseTo(frictions * prix(a), 9)
      expect(annee(e, a).leviers).toBeCloseTo(effetProgramme(a, an1.leviers, ap.leviers) * prix(a), 9)
      expect(annee(e, a).deltaPibDepensesCourantes).toBeCloseTo(effetProgramme(a, an1.pibDepensesCourantes, ap.pibDepensesCourantes) * prix(a), 9)
    }
  })
  it('la durée passe des paramètres à la trajectoire ; une durée plus longue étale davantage', () => {
    expect(macroDepuisParams({ ...complet, dureeMonteeInvestissement: 15 }).dureeMonteeInvestissement).toBe(15)
    expect(MACRO_PAR_DEFAUT.dureeMonteeInvestissement).toBe(10)
    expect(complet.partPretsUtilisesPct).toBe(100)
    const t = trajectoiresPourParams({ ...complet, dureeMonteeInvestissement: 20 })
    expect(annee(t.effets, 2032).deltaPibFilieres).toBeLessThan(annee(trajectoiresPourParams(complet).effets, 2032).deltaPibFilieres)
  })
})

describe('électricité à prix régulé (trajectoires seulement)', () => {
  const base = trajectoiresPourParams(complet)
  const avec = (ecart: number, annees = 2, autres: Partial<typeof complet> = {}) =>
    trajectoiresPourParams({ ...complet, ecartPrixElectricite: ecart, anneesEcartElectricite: annees, ...autres })
  const prix = (a: number) => Math.pow(1 + complet.inflationPct / 100, a - 2027)
  it('écart nul : aucun changement, quel que soit le nombre d’années', () => {
    expect(complet.ecartPrixElectricite).toBe(0)
    for (const n of [1, 2, 8]) {
      const u = avec(0, n)
      expect(u.effets).toEqual(base.effets)
      expect(u.programme).toEqual(base.programme)
    }
  })
  it('écart supérieur à la marge : baisse de facture T = g × 0,451 Md€, ΔPIB = 0,14 T, effet direct −40 % T, plus θ × ΔPIB', () => {
    const u = avec(48)
    for (const a of [2028, 2029]) {
      const e = annee(u.effets, a)
      const b = annee(base.effets, a)
      const T = gainParMwh(48, 16.5) * 0.451 * prix(a)
      expect(T).toBeGreaterThan(0)
      expect(MD_PAR_EUR_MWH).toBeCloseTo(0.451, 12)
      expect(e.electriciteBaisseFacture).toBeCloseTo(T, 9)
      expect(e.deltaPibElectricite).toBeCloseTo(0.14 * T, 9)
      expect(MULTIPLICATEUR_PIB).toBe(0.14)
      expect(PART_DIRECTE).toBeCloseTo(0.4, 12)
      expect(e.electriciteDirect).toBeCloseTo(-0.4 * T, 9)
      expect(e.electriciteIs + e.electriciteDividende + e.electriciteTva).toBeCloseTo(e.electriciteDirect, 12)
      expect(e.electriciteIs).toBeCloseTo(-0.25 * T, 9)
      expect(e.electriciteDividende).toBeCloseTo(-0.09 * T, 9)
      expect(e.electriciteTva).toBeCloseTo(-0.06 * T, 9)
      // Le surcroît de PIB passe par θ × ΔPIB ; les prélèvements nouveaux, proportionnels au PIB, suivent aussi.
      expect(e.deltaPib - b.deltaPib).toBeCloseTo(0.14 * T, 9)
      expect(e.recettesInduites - b.recettesInduites).toBeCloseTo((complet.tauxRecettesActivitePct / 100) * 0.14 * T, 9)
      expect(e.effet - b.effet).toBeCloseTo(-0.4 * T + (e.prelevements - b.prelevements) + (complet.tauxRecettesActivitePct / 100) * 0.14 * T, 9)
      expect(annee(u.programme, a).pib - annee(base.programme, a).pib).toBeCloseTo(0.14 * T, 9)
    }
    // Hors années concernées : aucun effet direct ni sur le PIB.
    for (const a of [2026, 2027, 2030, 2031, 2035]) {
      expect(annee(u.effets, a).electriciteDirect).toBe(0)
      expect(annee(u.effets, a).deltaPibElectricite).toBe(0)
      expect(annee(u.effets, a).effet).toBeCloseTo(annee(base.effets, a).effet, 9)
    }
    // Le tendanciel ne finance aucun bouclier : il ne change pas.
    expect(u.tendanciel).toEqual(base.tendanciel)
  })
  it('en euros 2027 indexé sur les prix : la baisse de facture en euros courants suit l’inflation', () => {
    const u = avec(48, 3)
    expect(annee(u.effets, 2027).electriciteBaisseFacture).toBe(0)
    expect(annee(u.effets, 2031).electriciteBaisseFacture).toBe(0)
    const f = (a: number) => annee(u.effets, a).electriciteBaisseFacture
    expect(f(2029) / f(2028)).toBeCloseTo(1 + complet.inflationPct / 100, 12)
    expect(f(2030) / f(2029)).toBeCloseTo(1 + complet.inflationPct / 100, 12)
  })
  it('le nombre d’années concernées commence en 2028', () => {
    const u = avec(30, 3)
    expect(ANNEES.filter((a) => annee(u.effets, a).electriciteBaisseFacture !== 0)).toEqual([2028, 2029, 2030])
    const v = avec(30, 8)
    expect(ANNEES.filter((a) => annee(v.effets, a).electriciteBaisseFacture !== 0)).toEqual([2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035])
  })
  it('constantes du VNU : seuils en écart au coût complet et part du nucléaire', () => {
    expect(SEUIL_TAXATION_VNU).toBeCloseTo(16.5, 12)
    expect(SEUIL_ECRETEMENT_VNU).toBeCloseTo(48.5, 12)
    expect(PART_NUCLEAIRE).toBeCloseTo(362 / 451, 12)
    expect(complet.margeElectricite).toBeCloseTo(16.5, 12)
  })
  it('écart inférieur ou égal à la marge, ou négatif : aucun effet (le prix régulé est plafonné)', () => {
    for (const e of [-20, -1, 0, 5, 16.5]) {
      expect(gainParMwh(e, 16.5)).toBe(0)
      const u = avec(e)
      expect(u.effets).toEqual(base.effets)
      expect(u.programme).toEqual(base.programme)
    }
    expect(annee(avec(16.5).effets, 2028).electriciteBaisseFacture).toBe(0)
    expect(annee(avec(-20).effets, 2028).deltaPibElectricite).toBe(0)
    expect(annee(avec(-20).effets, 2028).electriciteDirect).toBe(0)
  })
  it('zone à 50 % (e = 30, m = 16,5) : g = 13,5 × (1 − 0,5 k)', () => {
    const k = 362 / 451
    expect(minorationVnu(30)).toBeCloseTo(0.5 * k * 13.5, 12)
    expect(gainParMwh(30, 16.5)).toBeCloseTo(13.5 * (1 - 0.5 * k), 12)
    const e = annee(avec(30).effets, 2028)
    expect(e.electriciteMinorationVnu).toBeCloseTo(0.5 * k * 13.5, 12)
    expect(e.electriciteGainMwh).toBeCloseTo(13.5 * (1 - 0.5 * k), 12)
    expect(e.electriciteBaisseFacture).toBeCloseTo(13.5 * (1 - 0.5 * k) * 0.451 * prix(2028), 9)
  })
  it('zone à 90 % (e = 80, m = 16,5)', () => {
    const k = 362 / 451
    const v = k * (0.5 * (48.5 - 16.5) + 0.9 * (80 - 48.5))
    expect(minorationVnu(80)).toBeCloseTo(v, 12)
    expect(gainParMwh(80, 16.5)).toBeCloseTo(80 - 16.5 - v, 12)
    expect(annee(avec(80).effets, 2029).electriciteBaisseFacture).toBeCloseTo((80 - 16.5 - v) * 0.451 * prix(2029), 9)
  })
  it('la minoration est continue aux seuils et croissante', () => {
    expect(minorationVnu(16.5)).toBe(0)
    expect(minorationVnu(48.5)).toBeCloseTo((362 / 451) * 0.5 * 32, 12)
    expect(minorationVnu(48.5 + 1e-9)).toBeCloseTo(minorationVnu(48.5), 6)
    expect(minorationVnu(100)).toBeGreaterThan(minorationVnu(60))
  })
  it('marge nulle et e = 10 : pas de minoration, g = 10', () => {
    expect(minorationVnu(10)).toBe(0)
    expect(gainParMwh(10, 0)).toBe(10)
    const u = avec(10, 2, { margeElectricite: 0 })
    expect(annee(u.effets, 2028).electriciteBaisseFacture).toBeCloseTo(10 * 0.451 * prix(2028), 9)
  })
  it('la marge réduit le gain', () => {
    const t = (m: number) => annee(avec(40, 2, { margeElectricite: m }).effets, 2028).electriciteBaisseFacture
    expect(t(0)).toBeGreaterThan(t(16.5))
    expect(t(16.5)).toBeGreaterThan(t(25))
  })
  it('l’effet direct sur le solde est défavorable (gain positif) et l’effet net reste inférieur à l’effet de la baisse de facture', () => {
    const u = avec(48)
    expect(annee(u.programme, 2028).solde).toBeLessThan(annee(base.programme, 2028).solde)
    expect(annee(u.programme, 2029).solde).toBeLessThan(annee(base.programme, 2029).solde)
  })
})

describe('rachat d’Engie (trajectoires seulement)', () => {
  const sans = trajectoiresPourParams({ ...complet, rachatEngie: false })
  const avec = trajectoiresPourParams({ ...complet, rachatEngie: true })
  it('le coût vaut (1 − 22,7 %) × 62 Md€, soit environ 48 Md€', () => {
    expect(COUT_RACHAT_ENGIE).toBeCloseTo((1 - 0.227) * 62, 9)
    expect(COUT_RACHAT_ENGIE).toBeGreaterThan(47.9)
    expect(COUT_RACHAT_ENGIE).toBeLessThan(48)
  })
  it('la dette augmente du coût du rachat dès 2028, le déficit et le PIB ne changent pas', () => {
    for (const a of ANNEES) {
      expect(annee(avec.programme, a).solde).toBeCloseTo(annee(sans.programme, a).solde, 9)
      expect(annee(avec.programme, a).pib).toBeCloseTo(annee(sans.programme, a).pib, 9)
      expect(annee(avec.programme, a).dette - annee(sans.programme, a).dette).toBeCloseTo(a >= 2028 ? COUT_RACHAT_ENGIE : 0, 9)
    }
    expect(annee(avec.effets, 2028).rachatEngie).toBeCloseTo(COUT_RACHAT_ENGIE, 9)
    expect(annee(avec.effets, 2029).rachatEngie).toBe(0)
    expect(annee(avec.programme, 2035).dettePct).toBeGreaterThan(annee(sans.programme, 2035).dettePct)
    // Le tendanciel ne contient pas le rachat.
    expect(avec.tendanciel).toEqual(sans.tendanciel)
  })
  it('désactivé, la trajectoire est celle sans mesure hors moteur ; par défaut, la case est cochée', () => {
    expect(complet.rachatEngie).toBe(true)
    expect(mesuresDepuisParams({ ...complet, rachatEngie: false })).toEqual({ ...MESURES_NULLES, rachatEngie: false } satisfies MesuresHorsMoteur)
    const direct = calculerTrajectoire(sans.composantesAn1, sans.composantesAP, complet.gelBcePct, macroDepuisParams(complet), mesuresDepuisParams({ ...complet, rachatEngie: false }), mainOeuvreDepuisParams(complet))
    expect(direct.points).toEqual(sans.programme)
  })
})

describe('contrainte de main-d’œuvre, immigration de travail et régularisation', () => {
  const avec = (p: Partial<typeof complet>) => trajectoiresPourParams({ ...complet, ...p })
  const base = avec({})
  const final = (t: ReturnType<typeof avec>, a = 2035) => annee(t.effets, a)

  it('bouclage : effet = somme des lignes, y compris les dépenses des nouveaux habitants et la régularisation', () => {
    for (const p of [{}, { partEmploisManquantsImmigrationPct: 0 }, { partChomeursMobilisablesPct: 50, effectifRegularisation: 700000 }]) {
      for (const e of avec(p).effets)
        expect(e.effet).toBeCloseTo(
          e.prelevements + e.recettesInduites + e.coutsEvites + e.leviers - e.depenses - e.frictions + e.electriciteDirect
          - e.depensesNouveauxHabitants + e.recettesRegularisation, 9)
    }
  })
  it('emplois directs = pourvus par des chômeurs + travailleurs immigrés + emplois non créés', () => {
    for (const p of [{}, { partEmploisManquantsImmigrationPct: 40 }]) {
      for (const e of avec(p).effets)
        expect(e.emploisDirectsCrees).toBeCloseTo(e.emploisPourvusChomeurs + e.travailleursImmigres + e.emploisNonCrees, 6)
    }
  })
  it('φ = 100 % : le PIB est celui du modèle sans contrainte ; seuls les dépenses des nouveaux habitants et les recettes de la régularisation changent', () => {
    const sansContrainte = calculerTrajectoire(base.composantesAn1, base.composantesAP, complet.gelBcePct, macroDepuisParams(complet), mesuresDepuisParams(complet))
    for (const a of ANNEES) {
      expect(annee(base.programme, a).pib).toBeCloseTo(annee(sansContrainte.points, a).pib, 9)
      const e = annee(base.effets, a)
      expect(annee(base.programme, a).solde - annee(sansContrainte.points, a).solde).toBeCloseTo(e.recettesRegularisation - e.depensesNouveauxHabitants, 9)
      expect(e.emploisNonCrees).toBe(0)
    }
    expect(final(base).depensesNouveauxHabitants).toBeGreaterThan(0)
  })
  it('φ = 0 : PIB plus bas, aucun migrant, des emplois non créés', () => {
    const zero = avec({ partEmploisManquantsImmigrationPct: 0 })
    for (const a of ANNEES.filter((x) => x >= 2029)) {
      expect(annee(zero.programme, a).pib).toBeLessThan(annee(base.programme, a).pib)
      expect(annee(zero.effets, a).migrantsSupplementaires).toBe(0)
      expect(annee(zero.effets, a).depensesNouveauxHabitants).toBe(0)
    }
    expect(final(zero).emploisNonCrees).toBeGreaterThan(0)
    expect(final(zero).travailleursImmigres).toBe(0)
  })
  it('k = 50 % : moins de migrants qu’à k = 25 %', () => {
    const k50 = avec({ partChomeursMobilisablesPct: 50 })
    expect(final(k50).migrantsSupplementaires).toBeLessThan(final(base).migrantsSupplementaires)
    expect(final(avec({ partChomeursMobilisablesPct: 10 })).migrantsSupplementaires).toBeGreaterThan(final(base).migrantsSupplementaires)
  })
  it('régularisation : nulle sans effectif, proportionnelle à l’effectif, à partir de 2028, sans effet sur le PIB', () => {
    const nul = avec({ effectifRegularisation: 0 })
    const demi = avec({ effectifRegularisation: 205000 })
    for (const e of nul.effets) expect(e.recettesRegularisation).toBe(0)
    for (const a of ANNEES) {
      expect(annee(base.effets, a).recettesRegularisation).toBeCloseTo(2 * annee(demi.effets, a).recettesRegularisation, 9)
      expect(annee(base.programme, a).pib).toBeCloseTo(annee(nul.programme, a).pib, 9)
    }
    expect(annee(base.effets, 2027).recettesRegularisation).toBe(0)
    expect(annee(base.effets, 2028).recettesRegularisation).toBeGreaterThan(0)
    // 410 000 × 4 960 € ≈ 2,0 Md€ en euros 2025.
    const pibRel = pibTendanciel(2028) / hv('pib2025')
    expect(annee(base.effets, 2028).recettesRegularisation / pibRel).toBeCloseTo(2.03, 1)
  })
  it('part directe des emplois : 65 % au multiplicateur de référence', () => {
    expect(partDirecteEmplois(1.45)).toBeCloseTo(0.65, 9)
    expect(partDirecteEmplois(1.05)).toBeGreaterThan(0.65)
  })
  it('contrôle V2 de la recherche : k = 25 %, φ = 100 %, D = 10, prêts à 100 %, multiplicateur 1,45', () => {
    const t = avec({ partChomeursMobilisablesPct: 25, dureeMonteeInvestissement: 10, partPretsUtilisesPct: 100, multiplicateur: 1.45 })
    const attendu: Record<number, number> = { 2028: 0, 2029: 5300, 2030: 33800, 2031: 56500, 2032: 70900, 2033: 77300, 2034: 83500, 2035: 83500 }
    for (const [a, v] of Object.entries(attendu)) {
      const reel = annee(t.effets, Number(a)).soldeMigratoireSupplementaire
      // La recherche arrondit à la centaine ; le moteur donne exactement 1 035 000 emplois : écart d’arrondi seulement.
      expect(Math.abs(reel - v)).toBeLessThanOrEqual(50)
    }
  })
})
