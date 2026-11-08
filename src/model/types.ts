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
}

export interface ModelOptions {
  /** Jeu de filières alternatif (tests de non-régression). Par défaut : données actuelles. */
  filieres?: readonly Filiere[]
  /** Gain brut du gel BCE (Md€/an) alternatif, pour figer le modèle d'origine (22). */
  gelBceBrut?: number
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
  frictions: { bonification: number; spread: number; importations: number; total: number }
  leviersNets: number
  /** Retours attribués aux filières comptés dans le solde (direct, indirect, évités budgétaires). */
  retoursFilieres: number
  /** retoursFilieres / (investissements × montée en charge), en %. */
  autofinancementPct: number
  solde: number
}
