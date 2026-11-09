import { SUBSTITUTION_IMPORTS } from '../data/filieres'
import { hv } from '../data/hypotheses'
import { ANNEE_RACHAT_ENGIE, COUT_RACHAT_ENGIE, MESURES_NULLES, effetElectricite, type MesuresHorsMoteur } from './electricite'
import { BILAN_NUL, bilanMainOeuvre, depensesNouveauxHabitants, mainOeuvreDepuisParams, recettesRegularisation, type ParamsMainOeuvre } from './mainOeuvre'
import { OPTIONS_PAR_DEFAUT, simuler } from './simulate'
import type { ModelOptions, ResultatSimulation, SimulationParams } from './types'

/**
 * Trajectoires 2026-2035 en euros courants (mandat 2027-2032, puis trois ans pour voir l'après-montée en charge).
 *
 * Tendanciel : PIB 2025 (Insee) porté par la croissance réelle de chaque année (prévisions de l'Insee et de la Banque
 * de France pour 2026-2028, puis croissance de long terme réglable) et l'inflation ; recettes = taux moyen × PIB ;
 * dépenses = (taux de recettes + déficit 2026 de 5,4 %) × PIB, corrigées d'un écart de croissance réglable (nul par
 * défaut : déficit tendanciel constant).
 *
 * Programme : les montants du moteur (euros 2027, An 1 puis année pleine) montent en charge de 2027 à 2030. Les flux
 * liés à l'investissement des filières (surcroît de PIB des filières, capital, coûts évités, part de l'État dans
 * l'investissement, bonification, investissement de substitution) sont nuls en 2026 et en 2027, puis valent le rythme
 * d'année pleine × min(1, (année − 2027) / D) à partir de 2028, D étant la durée de montée en charge (10 ans par défaut,
 * réglable de 10 à 30) ; une part réglable seulement des prêts du pôle public bancaire est effectivement empruntée
 * (100 % par défaut), l'investissement financé par les prêts non empruntés n'a pas lieu (les subventions de l'État
 * restent dépensées).
 * Contrainte de main-d'œuvre (voir mainOeuvre.ts) : les emplois directs que les chômeurs mobilisables du métier ne peuvent pas
 * pourvoir sont pourvus par une nouvelle immigration de travail (la part non pourvue n'est pas créée : elle réduit d'autant les flux
 * liés à l'investissement des filières). Les nouveaux habitants coûtent une dépense variable par habitant ; la régularisation,
 * à partir de 2028, rapporte des cotisations sans effet sur le PIB.
 * Deux mesures s'ajoutent aux montants du moteur, sans le modifier : l'écart de prix de l'électricité (voir electricite.ts :
 * surcroît de PIB et effet direct sur le solde, de 2028 à 2028 + n − 1) et le rachat d'Engie (dette de 2028, sans effet
 * sur le solde ; le modèle ne calcule aucune charge d'intérêts).
 * Ils ajoutent au PIB un surcroît d'activité : effet de demande (investissements des filières × multiplicateur,
 * dépenses courantes, effet récessif des prélèvements) et, en option, effet d'offre durable (capital accumulé par les
 * filières × rendement r, à partir de l'année suivant l'investissement, sans usure ; r = 2 %/an par défaut, réglable de 0 à 20) et,
 * en option, report de la demande vers des produits français (le capital des filières de biens échangeables fait baisser
 * la part importée de la demande créée par le programme ; α = 0,45 par défaut, réglable de 0 à 2). Les recettes sur ce surcroît (taux réglable)
 * remplacent les retours fiscaux des filières, les retours sur dépenses courantes et l'effet récessif du moteur. Les
 * prélèvements nouveaux sont proportionnels au PIB avec programme ; les autres montants suivent l'inflation.
 *
 * Garde-fous automatiques du report de la demande : seules les filières retenues dans SUBSTITUTION_IMPORTS comptent ;
 * la part importée ne descend pas sous son plancher (11 %, S18) ; si l'effet d'offre et le report sont tous deux
 * positifs, seul le plus grand est retenu (avec les valeurs par défaut, l'effet d'offre ; le report est alors mis à 0) ; sans capital (ou à réglage nul), la trajectoire est inchangée.
 */

export const ANNEES = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
const ANNEE_DEPART = 2025
/** Année de référence des montants du programme (euros 2027). */
const ANNEE_EUROS = 2027

export interface PointTrajectoire {
  annee: number
  /** PIB en valeur, Md€ courants. */
  pib: number
  /** Croissance du PIB en volume par rapport à l'année précédente, %. */
  croissanceReellePct: number
  /** Solde public en Md€ courants (négatif = déficit). */
  solde: number
  soldePct: number
  dette: number
  dettePct: number
  /** Dette hors stock BCE gelé, % du PIB (indicateur non Maastricht), à partir de 2027. */
  detteHorsBcePct: number | null
}

/** Décomposition de l'effet du programme sur le solde pour une année, Md€ courants. */
export interface EffetAnnuel {
  annee: number
  /** Surcroît de PIB dû au programme (somme des six composantes suivantes). */
  deltaPib: number
  /** Effet de demande des investissements des filières : investissement de l'année × multiplicateur. */
  deltaPibFilieres: number
  deltaPibDepensesCourantes: number
  /** Perte de PIB due aux prélèvements nouveaux (négative). */
  deltaPibRecessif: number
  /** Effet d'offre : capital accumulé par les filières fin d'année précédente × rendement (0 s'il est écarté). */
  deltaPibOffre: number
  /**
   * Report de la demande vers des produits français : (facteur − 1) × (effets de demande des filières, des dépenses
   * courantes et récessif). Facteur = (1 − part importée de l'année) / (1 − part importée de départ). 0 s'il est écarté.
   */
  deltaPibSubstitution: number
  /** Surcroît de PIB dû à l'écart de prix de l'électricité (effet de niveau, années concernées seulement). */
  deltaPibElectricite: number
  /** Électricité : minoration du VNU du scénario sans programme (€/MWh consommé, euros 2027). */
  electriciteMinorationVnu: number
  /** Électricité : gain par MWh g = max(0, e − marge − minoration) (€/MWh, euros 2027). */
  electriciteGainMwh: number
  /** Électricité : baisse de la facture des consommateurs T (Md€ courants, jamais négative). */
  electriciteBaisseFacture: number
  /** Électricité : effet direct sur le solde, somme des trois lignes suivantes (−40 % × T). */
  electriciteDirect: number
  /** Électricité : impôt sur les sociétés d'EDF en moins (−25 % × T). */
  electriciteIs: number
  /** Électricité : dividende d'EDF en moins pour l'État (−9 % × T). */
  electriciteDividende: number
  /** Électricité : TVA en moins sur la part des ménages (−6 % × T). */
  electriciteTva: number
  /** Rachat d'Engie : achat de titres de l'année, Md€ (accroît la dette, pas le déficit). */
  rachatEngie: number
  /** Capital accumulé par les filières à la fin de l'année précédente, Md€ courants. */
  capital: number
  /** Capital accumulé par les filières de biens échangeables (base du report de la demande), Md€ courants. */
  capitalSubstitution: number
  /** Part importée de la demande créée par le programme cette année, %. */
  partImporteePct: number
  /** Vrai si la part importée est bloquée à son plancher. */
  plancherAtteint: boolean
  /** Garde-fou : gain lié au capital écarté parce que l'autre est plus grand (effet d'offre et report tous deux positifs). */
  gainEcarte: 'offre' | 'substitution' | null
  /** Prélèvements nouveaux, proportionnels au PIB avec programme. */
  prelevements: number
  /** Recettes publiques sur le surcroît d'activité : taux × surcroît de PIB. */
  recettesInduites: number
  coutsEvites: number
  leviers: number
  /** Dépenses nouvelles (montant positif, retranché). */
  depenses: number
  /** Frictions (montant positif, retranché). */
  frictions: number
  /** Emplois directs du programme à pourvoir cette année, avant contrainte de main-d'œuvre (somme des trois lignes suivantes). */
  emploisDirectsCrees: number
  /** Emplois directs pourvus par des chômeurs du métier. */
  emploisPourvusChomeurs: number
  /** Emplois directs pourvus par des travailleurs immigrés (stock). */
  travailleursImmigres: number
  /** Emplois directs non créés, faute de chômeur ni de nouvel arrivant (stock). */
  emploisNonCrees: number
  /** Migrants nets supplémentaires par rapport au scénario central de l'Insee (stock). */
  migrantsSupplementaires: number
  /** Solde migratoire supplémentaire de l'année : variation du stock de migrants supplémentaires. */
  soldeMigratoireSupplementaire: number
  /** Dépenses des nouveaux habitants (montant positif, retranché). */
  depensesNouveauxHabitants: number
  /** Recettes de la régularisation : cotisations des personnes régularisées en emploi (à partir de 2028). */
  recettesRegularisation: number
  /** Effet total sur le solde (hors rachat d'Engie, qui ne touche que la dette). */
  effet: number
}

/** Croissance réelle tendancielle prévue (Insee, Banque de France), % : 2026 à 2028. */
export const CROISSANCE_PREVUE: Readonly<Record<number, number>> = {
  2026: hv('croissance2026'),
  2027: hv('croissance2027'),
  2028: hv('croissance2028'),
}

/** Hypothèses macroéconomiques des trajectoires, en %. */
export interface HypothesesMacro {
  /** Croissance réelle tendancielle des années prévues (2026-2028 par défaut). */
  croissancePrevuePct: Readonly<Record<number, number>>
  /** Croissance réelle tendancielle des autres années (à partir de 2029 par défaut). */
  croissanceLongTermePct: number
  inflationPct: number
  /** Écart entre la croissance des dépenses tendancielles et celle du PIB tendanciel, en point par an. */
  ecartDepensesPct: number
  tauxRecettesActivitePct: number
  /** PIB supplémentaire par an par euro d'investissement des filières cumulé. */
  rendementCapitalPct: number
  /** Baisse de la part importée de la demande du programme, en point, par point de PIB de capital des filières de biens échangeables. */
  substitutionImports: number
  /** Durée de montée en charge de l'investissement des filières, en années à partir de 2028 (10 par défaut, S19). */
  dureeMonteeInvestissement: number
}

export const MACRO_PAR_DEFAUT: HypothesesMacro = {
  croissancePrevuePct: CROISSANCE_PREVUE,
  croissanceLongTermePct: hv('croissanceLongTerme'),
  inflationPct: hv('inflation'),
  ecartDepensesPct: hv('ecartDepenses'),
  tauxRecettesActivitePct: hv('tauxRetourFiscalPib') * 100,
  rendementCapitalPct: hv('rendementCapital'),
  substitutionImports: hv('substitutionImports'),
  dureeMonteeInvestissement: hv('dureeMonteeInvestissement'),
}

export const macroDepuisParams = (p: SimulationParams): HypothesesMacro => ({
  croissancePrevuePct: CROISSANCE_PREVUE,
  croissanceLongTermePct: p.croissanceLongTermePct,
  inflationPct: p.inflationPct,
  ecartDepensesPct: p.ecartDepensesPct,
  tauxRecettesActivitePct: p.tauxRecettesActivitePct,
  rendementCapitalPct: p.rendementCapitalPct,
  substitutionImports: p.substitutionImports,
  dureeMonteeInvestissement: p.dureeMonteeInvestissement,
})

export const mesuresDepuisParams = (p: SimulationParams): MesuresHorsMoteur => ({
  ecartPrixElectricite: p.ecartPrixElectricite,
  margeElectricite: p.margeElectricite,
  anneesEcartElectricite: p.anneesEcartElectricite,
  rachatEngie: p.rachatEngie,
})

/** Croissance réelle du PIB tendanciel une année donnée, %. */
export function croissanceTendanciellePct(annee: number, m: HypothesesMacro = MACRO_PAR_DEFAUT): number {
  return m.croissancePrevuePct[annee] ?? m.croissanceLongTermePct
}

/** Montants du programme pour un horizon, en Md€ 2027, tirés du moteur. */
export interface ComposantesProgramme {
  /** Prélèvements nouveaux : recettes An 1 + recettes d'année pleine. */
  prelevements: number
  /** Surcroît de PIB des filières : investissement × montée en charge × multiplicateur. */
  pibFilieres: number
  /** Investissement des filières de l'année : investissement × montée en charge (base du capital accumulé). */
  investissement: number
  /** Part de cet investissement faite par les filières de biens échangeables (base du report de la demande). */
  investissementSubstitution: number
  /** Surcroît de PIB des dépenses courantes : retours courants ÷ taux de retour fiscal (0,35). */
  pibDepensesCourantes: number
  /** Perte de PIB due aux prélèvements : effet récessif ÷ taux de retour fiscal (0,35). */
  pibRecessif: number
  coutsEvites: number
  leviers: number
  depenses: number
  /** Dont part de l'État dans l'investissement des filières ajoutée en année pleine (suit le rythme de l'investissement). */
  depensesInvestissement: number
  frictions: number
  /** Dont bonification des prêts du pôle public bancaire (suit le rythme de l'investissement). */
  bonification: number
  /** Solde calculé par le moteur, pour mémoire. */
  soldeMoteur: number
  /** Emplois d'année pleine réalisés de chaque filière (identifiant de filière), avec la part des prêts empruntée. */
  emploisParFiliere: Readonly<Record<string, number>>
}

export const COMPOSANTES_NULLES: ComposantesProgramme = {
  prelevements: 0, pibFilieres: 0, investissement: 0, investissementSubstitution: 0, pibDepensesCourantes: 0, pibRecessif: 0,
  coutsEvites: 0, leviers: 0, depenses: 0, depensesInvestissement: 0, frictions: 0, bonification: 0, soldeMoteur: 0, emploisParFiliere: {},
}

/** Filières dont le capital peut remplacer des importations (garde-fou automatique du report de la demande). */
export const FILIERES_SUBSTITUTION: ReadonlySet<string> = new Set(
  Object.entries(SUBSTITUTION_IMPORTS).filter(([, s]) => s.retenue).map(([id]) => id),
)

/**
 * Montants du programme tirés du moteur. `partPrets` (0 à 1, 1 par défaut) : part des prêts du pôle public bancaire
 * effectivement empruntée ; dans chaque filière, l'investissement financé par les prêts non empruntés n'a pas lieu
 * (investissement, surcroît de PIB et coûts évités réduits d'autant, bonification proportionnelle aux prêts) ; les
 * subventions de l'État (dépenses) sont inchangées. Le moteur n'est pas modifié.
 */
export function composantesProgramme(r: ResultatSimulation, multiplicateur: number, partPrets = 1): ComposantesProgramme {
  const k = hv('tauxRetourFiscalPib')
  const x = Math.min(1, Math.max(0, partPrets))
  // Investissement réalisé dans une filière : total − prêts non empruntés.
  const realise = (d: (typeof r.agregat.details)[number]) => d.invest - (1 - x) * d.banque
  const somme = (f: (d: (typeof r.agregat.details)[number]) => number, filtre: (id: string) => boolean = () => true) =>
    r.agregat.details.filter((d) => filtre(d.id)).reduce((s, d) => s + f(d), 0)
  const investissement = somme(realise)
  const investSubstitution = somme(realise, (id) => FILIERES_SUBSTITUTION.has(id))
  // Coûts évités de chaque filière au prorata de son investissement réalisé.
  const evites = somme((d) => d.evites)
  const evitesRealises = somme((d) => (d.invest > 0 ? (d.evites * realise(d)) / d.invest : d.evites))
  const partEvites = evites > 0 ? evitesRealises / evites : 1
  const bonification = r.frictions.bonification * x
  return {
    prelevements: r.recettesAn1 + r.recettesAP,
    pibFilieres: investissement * r.roiScale * multiplicateur,
    investissement: investissement * r.roiScale,
    investissementSubstitution: investSubstitution * r.roiScale,
    pibDepensesCourantes: r.retoursCourants / k,
    pibRecessif: r.effetRecessif / k,
    coutsEvites: r.coutsEvites * partEvites,
    leviers: r.leviers.total,
    depenses: r.depenses.total,
    depensesInvestissement: r.depenses.ajoutEtat,
    frictions: r.frictions.total - r.frictions.bonification + bonification,
    bonification,
    soldeMoteur: r.solde,
    // Emplois de chaque filière au prorata de son investissement réalisé (comme les coûts évités).
    emploisParFiliere: Object.fromEntries(r.agregat.details.map((d) => [d.id, d.invest > 0 ? (d.emplois * realise(d)) / d.invest : d.emplois])),
  }
}

/** Année pleine de référence du programme. */
export const ANNEE_PLEINE = 2030

/** Montée en charge : 0 en 2026, An 1 en 2027, interpolation linéaire, puis année pleine à partir de 2030. */
export function effetProgramme(annee: number, effetAn1: number, effetAP: number): number {
  if (annee < ANNEE_EUROS) return 0
  if (annee === ANNEE_EUROS) return effetAn1
  if (annee >= ANNEE_PLEINE) return effetAP
  return effetAn1 + ((effetAP - effetAn1) * (annee - ANNEE_EUROS)) / (ANNEE_PLEINE - ANNEE_EUROS)
}

/**
 * Rythme des flux liés à l'investissement des filières : 0 en 2026 et 2027, puis année pleine × min(1, (année − 2027) / D)
 * à partir de 2028, D étant la durée de montée en charge (années).
 */
export function rythmeInvestissement(annee: number, effetAP: number, duree: number): number {
  if (annee <= ANNEE_EUROS) return 0
  return effetAP * Math.min(1, (annee - ANNEE_EUROS) / Math.max(1, duree))
}

/** PIB tendanciel en valeur (Md€ courants) : PIB 2025 porté par la croissance réelle de chaque année et l'inflation. */
export function pibTendanciel(annee: number, m: HypothesesMacro = MACRO_PAR_DEFAUT): number {
  let pib = hv('pib2025')
  for (let a = ANNEE_DEPART + 1; a <= annee; a++) pib *= (1 + croissanceTendanciellePct(a, m) / 100) * (1 + m.inflationPct / 100)
  return pib
}

export interface ResultatTrajectoire {
  points: PointTrajectoire[]
  effets: EffetAnnuel[]
}

export function calculerTrajectoire(
  an1: ComposantesProgramme,
  ap: ComposantesProgramme,
  gelPct: number,
  m: HypothesesMacro = MACRO_PAR_DEFAUT,
  mesures: MesuresHorsMoteur = MESURES_NULLES,
  mainOeuvre: ParamsMainOeuvre | null = null,
): ResultatTrajectoire {
  const inflation = m.inflationPct / 100
  const tauxRecettes = hv('tauxRecettesPubliques') / 100
  const tauxInduit = m.tauxRecettesActivitePct / 100
  const rendement = m.rendementCapitalPct / 100
  const partImporteeDepart = hv('partImporteeDemande') / 100
  const partImporteeMin = hv('partImporteeMin') / 100
  // Dépenses tendancielles 2026 calées sur le déficit de 2026, puis au rythme du PIB tendanciel corrigé de l'écart.
  const tauxDepenses2026 = tauxRecettes - hv('deficitTendanciel') / 100
  const facteurEcart = 1 + m.ecartDepensesPct / 100
  const pibRef = pibTendanciel(ANNEE_EUROS, m)

  const points: PointTrajectoire[] = []
  const effets: EffetAnnuel[] = []
  let pibPrec = hv('pib2025')
  let dettePrec = hv('dette2026')
  // Capital accumulé par les filières (euros 2027) : il produit à partir de l'année suivant l'investissement.
  let capital2027 = 0
  let capitalSubstitution2027 = 0
  // Migrants nets supplémentaires de l'année précédente (stock), pour le solde migratoire supplémentaire.
  let migrantsPrec = 0
  for (const annee of ANNEES) {
    const prix = Math.pow(1 + inflation, annee - ANNEE_EUROS)
    const montant = (f: (c: ComposantesProgramme) => number) => effetProgramme(annee, f(an1), f(ap)) * prix
    // Flux liés à l'investissement des filières : nuls en 2026-2027, puis étalés sur D ans à partir de 2028.
    const montantInvest = (f: (c: ComposantesProgramme) => number) => rythmeInvestissement(annee, f(ap), m.dureeMonteeInvestissement) * prix

    // Contrainte de main-d'œuvre : la part non pourvue des emplois directs n'est pas créée et réduit d'autant les flux
    // liés à l'investissement des filières (les dépenses de l'État et la bonification restent inchangées).
    const bilan = mainOeuvre ? bilanMainOeuvre(ap.emploisParFiliere, rythmeInvestissement(annee, 1, m.dureeMonteeInvestissement), mainOeuvre) : BILAN_NUL
    const realisee = 1 - bilan.partNonRealisee

    const deltaPibFilieres = montantInvest((c) => c.pibFilieres) * realisee
    const deltaPibDepensesCourantes = montant((c) => c.pibDepensesCourantes)
    const deltaPibRecessif = montant((c) => c.pibRecessif)
    const pib0 = pibTendanciel(annee, m)
    const capital = capital2027 * prix
    const capitalSubstitution = capitalSubstitution2027 * prix

    // Report de la demande : la part importée baisse avec le capital des filières de biens échangeables, sans
    // descendre sous son plancher ; la demande reportée vers des produits français s'ajoute au PIB.
    const partVisee = partImporteeDepart - m.substitutionImports * (capitalSubstitution / pib0)
    const partImportee = Math.max(partImporteeMin, partVisee)
    const facteurSubstitution = (1 - partImportee) / (1 - partImporteeDepart)
    const substitutionBrute = (facteurSubstitution - 1) * (deltaPibFilieres + deltaPibDepensesCourantes + deltaPibRecessif)
    const offreBrute = rendement * capital
    // Les deux gains peuvent décrire la même production nouvelle : s'ils sont tous deux positifs, seul le plus grand compte.
    const lesDeux = offreBrute > 0 && substitutionBrute > 0
    const gainEcarte = !lesDeux ? null : offreBrute >= substitutionBrute ? 'substitution' : 'offre'
    const deltaPibOffre = gainEcarte === 'offre' ? 0 : offreBrute
    const deltaPibSubstitution = gainEcarte === 'substitution' ? 0 : substitutionBrute

    // Électricité à prix régulé : effet de niveau sur le PIB, limité aux années concernées (hors report de la demande).
    const elec = effetElectricite(annee, mesures, prix)
    const deltaPibElectricite = elec.deltaPib

    const deltaPib = deltaPibFilieres + deltaPibDepensesCourantes + deltaPibRecessif + deltaPibOffre + deltaPibSubstitution + deltaPibElectricite
    const pib = pib0 + deltaPib

    // Taux des prélèvements nouveaux = montant (euros 2027) / PIB tendanciel 2027, appliqué au PIB avec programme.
    const prelevements = (effetProgramme(annee, an1.prelevements, ap.prelevements) / pibRef) * pib
    const recettesInduites = tauxInduit * deltaPib
    const coutsEvites = montantInvest((c) => c.coutsEvites) * realisee
    const leviers = montant((c) => c.leviers)
    const depenses = montant((c) => c.depenses - c.depensesInvestissement) + montantInvest((c) => c.depensesInvestissement)
    const frictions = montant((c) => c.frictions - c.bonification) + montantInvest((c) => c.bonification)
    // Nouveaux habitants : dépense variable par habitant (leurs recettes passent déjà par le taux sur le surcroît de PIB).
    const depensesHabitants = depensesNouveauxHabitants(bilan.migrantsSupplementaires, pib0)
    // Régularisation à partir de 2028 : cotisations, sans effet sur le PIB ni dépense nouvelle modélisée.
    const recettesRegul = mainOeuvre && annee > ANNEE_EUROS ? recettesRegularisation(mainOeuvre.effectifRegularisation, pib0) : 0
    const effet = prelevements + recettesInduites + coutsEvites + leviers - depenses - frictions + elec.soldeDirect - depensesHabitants + recettesRegul

    const recettesTendancielles = tauxRecettes * pib0
    const depensesTendancielles = tauxDepenses2026 * pib0 * Math.pow(facteurEcart, annee - 2026)
    const solde = recettesTendancielles - depensesTendancielles + effet
    // Rachat d'Engie : achat de titres, il accroît la dette de l'année sans passer par le solde.
    const rachatEngie = mesures.rachatEngie && annee === ANNEE_RACHAT_ENGIE ? COUT_RACHAT_ENGIE : 0
    // Dette 2026 : stock de départ ; ensuite dette_t = dette_{t-1} − solde_t (+ rachat d'Engie en 2028).
    const dette = annee === 2026 ? dettePrec : dettePrec - solde + rachatEngie
    const horsBce = annee >= 2027 ? ((dette - hv('stockBce') * (gelPct / 100)) / pib) * 100 : null

    points.push({
      annee,
      pib,
      croissanceReellePct: (pib / pibPrec / (1 + inflation) - 1) * 100,
      solde,
      soldePct: (solde / pib) * 100,
      dette,
      dettePct: (dette / pib) * 100,
      detteHorsBcePct: horsBce,
    })
    effets.push({
      annee, deltaPib, deltaPibFilieres, deltaPibDepensesCourantes, deltaPibRecessif, deltaPibOffre, deltaPibSubstitution,
      deltaPibElectricite, electriciteMinorationVnu: elec.minorationVnu, electriciteGainMwh: elec.gainParMwh, electriciteBaisseFacture: elec.baisseFacture, electriciteDirect: elec.soldeDirect,
      electriciteIs: elec.impotSocietes, electriciteDividende: elec.dividende, electriciteTva: elec.tva, rachatEngie,
      capital, capitalSubstitution, partImporteePct: partImportee * 100, plancherAtteint: partVisee < partImporteeMin, gainEcarte,
      prelevements, recettesInduites, coutsEvites, leviers, depenses, frictions,
      emploisDirectsCrees: bilan.emploisDirectsCrees, emploisPourvusChomeurs: bilan.emploisPourvusChomeurs,
      travailleursImmigres: bilan.travailleursImmigres, emploisNonCrees: bilan.emploisNonCrees,
      migrantsSupplementaires: bilan.migrantsSupplementaires, soldeMigratoireSupplementaire: bilan.migrantsSupplementaires - migrantsPrec,
      depensesNouveauxHabitants: depensesHabitants, recettesRegularisation: recettesRegul, effet,
    })
    migrantsPrec = bilan.migrantsSupplementaires
    pibPrec = pib
    dettePrec = dette
    capital2027 += rythmeInvestissement(annee, ap.investissement, m.dureeMonteeInvestissement) * realisee
    capitalSubstitution2027 += rythmeInvestissement(annee, ap.investissementSubstitution, m.dureeMonteeInvestissement) * realisee
  }
  return { points, effets }
}

export interface Trajectoires {
  programme: PointTrajectoire[]
  tendanciel: PointTrajectoire[]
  /** Décomposition de l'effet du programme sur le solde, par année (Md€ courants). */
  effets: EffetAnnuel[]
  /** Montants du moteur en An 1 et en année pleine (euros 2027). */
  composantesAn1: ComposantesProgramme
  composantesAP: ComposantesProgramme
}

/** Trajectoires avec le même jeu de curseurs ; montants An 1 et année pleine calculés par le moteur. */
export function trajectoiresPourParams(
  params: SimulationParams,
  options: ModelOptions = OPTIONS_PAR_DEFAUT,
): Trajectoires {
  const partPrets = params.partPretsUtilisesPct / 100
  const composantesAn1 = composantesProgramme(simuler({ ...params, horizon: 'an1' }, options), params.multiplicateur, partPrets)
  const composantesAP = composantesProgramme(simuler({ ...params, horizon: 'anneePleine' }, options), params.multiplicateur, partPrets)
  const m = macroDepuisParams(params)
  const programme = calculerTrajectoire(composantesAn1, composantesAP, params.gelBcePct, m, mesuresDepuisParams(params), mainOeuvreDepuisParams(params))
  const tendanciel = calculerTrajectoire(COMPOSANTES_NULLES, COMPOSANTES_NULLES, 0, m)
  return { programme: programme.points, tendanciel: tendanciel.points, effets: programme.effets, composantesAn1, composantesAP }
}

export interface AmeliorationDeficit {
  annee: number
  /** Déficit tendanciel, en % du PIB (valeur positive si déficit). */
  deficitTendanciel: number
  /** Déficit avec le programme, en % du PIB (valeur positive si déficit). */
  deficitProgramme: number
  /** Effet du programme sur le solde, Md€ courants. */
  effet: number
  /** Amélioration du solde en points de PIB (solde % avec programme − solde % tendanciel). */
  pointsPib: number
  /** Vrai si le programme supprime le déficit. */
  suffisant: boolean
}

/** Amélioration du déficit une année donnée (2030 par défaut : année pleine du programme, hors investissement des filières). */
export function ameliorationDeficit(t: Trajectoires, annee = 2030): AmeliorationDeficit {
  const prog = t.programme.find((p) => p.annee === annee)!
  const tend = t.tendanciel.find((p) => p.annee === annee)!
  return {
    annee,
    deficitTendanciel: -tend.soldePct,
    deficitProgramme: -prog.soldePct,
    effet: prog.solde - tend.solde,
    pointsPib: prog.soldePct - tend.soldePct,
    suffisant: prog.soldePct >= 0,
  }
}
