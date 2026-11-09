import type { Filiere } from '../data/filieres'

export type Horizon = 'an1' | 'anneePleine'

export interface SimulationParams {
  horizon: Horizon
  /** Même percentile appliqué à chaque filière, 10..90. */
  percentile: number
  /** 0,80..1,80 */
  multiplicateur: number
  /** 0..100, sans effet en An 1. */
  recettesAnneePleinePct: number
  /** 55..100 */
  recouvrementPct: number
  /** 0..0,7 : multiplicateur récessif des prélèvements nouveaux. */
  multiplicateurPrelevements: number
  /** 0..100 : part des coûts évités qui est une recette budgétaire. */
  partBudgetaireCoutsEvitesPct: number
  /** 0..40 : retours sur dépenses courantes (année pleine). */
  retoursCourantsBase: number
  gelBcePct: number
  cadesPct: number
  primaireBcePct: number
  circuitTresorPct: number
  cadesCompteDansSolde: boolean
  /** −1..3 : croissance réelle tendancielle du PIB sans le programme à partir de 2029 (%/an), trajectoires seulement ; 2026-2028 suivent les prévisions. */
  croissanceLongTermePct: number
  /** 0..4 : inflation, hausse du déflateur du PIB (%/an), trajectoires seulement. */
  inflationPct: number
  /** −2..2 : écart entre la croissance des dépenses publiques et celle du PIB sans le programme (point/an), trajectoires seulement. */
  ecartDepensesPct: number
  /** 20..55 : recettes publiques par euro de PIB supplémentaire dû au programme (%), trajectoires seulement. */
  tauxRecettesActivitePct: number
  /** 0..20 : PIB supplémentaire par an par euro d'investissement des filières cumulé (%), trajectoires seulement. */
  rendementCapitalPct: number
  /** 0..2 : baisse de la part importée de la demande créée par le programme, en point, par point de PIB de capital des filières de biens échangeables, trajectoires seulement. */
  substitutionImports: number
  /** 0..8 : coût de bonification du pôle public bancaire (% des prêts du pôle), 0 par défaut. */
  tauxBonificationPct: number
  /** 0..100 : part des prêts du pôle public bancaire effectivement empruntée (%), trajectoires seulement. */
  partPretsUtilisesPct: number
  /** 10..30 : durée (années) de montée en charge de l'investissement des filières, nul en 2026-2027 puis linéaire à partir de 2028, trajectoires seulement. */
  dureeMonteeInvestissement: number
  /** 0..100 : écart entre le prix de marché tendanciel et le coût complet du nucléaire historique (€/MWh, euros 2027, indexé sur les prix), trajectoires seulement. */
  ecartPrixElectricite: number
  /** 0..25 : marge du monopole public au-dessus du coût complet (€/MWh, euros 2027), 16,5 par défaut ; elle reste à EDF, trajectoires seulement. */
  margeElectricite: number
  /** 1..8 : nombre d'années concernées par cet écart, à partir de 2028, trajectoires seulement. */
  anneesEcartElectricite: number
  /** Rachat en 2028 des actions d'Engie non détenues par l'État : accroît la dette, pas le déficit, trajectoires seulement. */
  rachatEngie: boolean
  /** 10..50 : part des demandeurs d'emploi ABC de chaque groupe de métiers mobilisables pour les emplois créés (%), trajectoires seulement. */
  partChomeursMobilisablesPct: number
  /** 0..100 : part des emplois manquants pourvus par une nouvelle immigration de travail (%) ; le reste n'est pas créé, trajectoires seulement. */
  partEmploisManquantsImmigrationPct: number
  /** 0..700 000 : personnes régularisées à partir de 2028, trajectoires seulement. */
  effectifRegularisation: number
}

export interface ModelOptions {
  /** Jeu de filières alternatif (tests de non-régression). Par défaut : données actuelles. */
  filieres?: readonly Filiere[]
  /** Gain brut du gel BCE (Md€/an) alternatif, pour figer le modèle d'origine (22). */
  gelBceBrut?: number
  /** Taux de bonification alternatif (ratio, ex. 0,08), pour figer le modèle d'origine. Sinon : paramètre des curseurs. */
  tauxBonification?: number
  corrections: {
    bonification: boolean
    cades: boolean
    coutsEvites: boolean
    effetRecessif: boolean
  }
}

export type CleCorrection = keyof ModelOptions['corrections']

export interface FiliereCalculee {
  id: string
  invest: number
  etat: number
  banque: number
  direct: number
  indirect: number
  evites: number
  emplois: number
}

export interface Agregat {
  totalInvest: number
  totalEtat: number
  totalBanque: number
  totalDirect: number
  totalIndirect: number
  totalEvites: number
  totalEmplois: number
  details: FiliereCalculee[]
}

export interface ResultatSimulation {
  horizon: Horizon
  roiScale: number
  agregat: Agregat
  depenses: { base: number; ajoutEtat: number; sociales: number; total: number }
  recettesAn1: number
  recettesAP: number
  /** Montant nominal des recettes AP au curseur, avant recouvrement. */
  recettesAPNominal: number
  retoursCourants: number
  /** Retours directs des filières + retours courants (mis à l'échelle). */
  roiDirect: number
  roiDirectFilieres: number
  roiIndirect: number
  coutsEvitesBruts: number
  coutsEvites: number
  basePrelevements: number
  effetRecessif: number
  leviers: {
    gelBce: number
    cadesBrute: number
    cadesComptee: number
    primaire: number
    tresor: number
    total: number
  }
  frictions: { bonification: number; bonificationSansLevier: number; spread: number; importations: number; total: number }
  leviersNets: number
  /** Retours attribués aux filières comptés dans le solde (direct, indirect, évités budgétaires). */
  retoursFilieres: number
  /** retoursFilieres / (investissements × montée en charge), en %. */
  autofinancementPct: number
  solde: number
}
