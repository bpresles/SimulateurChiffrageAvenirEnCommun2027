import { hv } from '../data/hypotheses'

/**
 * Électricité vendue par un monopole public à un prix régulé égal au coût moyen de production (trajectoires seulement).
 *
 * Pour chaque année concernée (de 2028 à 2028 + n − 1), la baisse de la facture des consommateurs vaut
 * T = écart (€/MWh, euros 2027, indexé sur les prix) × 451 TWh (volume constant ; 0,451 Md€ par €/MWh) :
 * - surcroît de PIB : 0,14 × T, effet de niveau limité aux années concernées (simulation FR-BDF de la Banque de France
 *   sur le bouclier tarifaire, S27 : le résultat d'un modèle, pas une mesure). Il passe ensuite par le taux de recettes
 *   sur le surcroît d'activité (θ × ΔPIB) dans la trajectoire ;
 * - solde public direct : −40 % × T, somme de trois pertes de recettes gardées séparées (impôt sur les sociétés d'EDF,
 *   dividende versé à l'État, TVA sur la part des ménages).
 * L'effet est symétrique : un écart négatif inverse tous les signes.
 *
 * Référence : le scénario tendanciel ne finance aucun bouclier tarifaire. Si le tendanciel en avait financé un comme en
 * 2022, le programme l'économiserait ; ce gain n'est pas compté.
 */

/** Première année concernée par l'écart de prix. */
export const ANNEE_DEBUT_ELECTRICITE = 2028

/** Md€ par €/MWh d'écart et par an : volume de 451 TWh (S22) constant. */
export const MD_PAR_EUR_MWH = hv('volumeElectricite') / 1000

/** Part de la baisse de la facture perdue en impôt sur les sociétés d'EDF (taux normal de 25 %). */
export const PART_IS = hv('tauxIsElectricite') / 100
/** Dividende d'EDF versé à l'État : 12 % du résultat net (S24, S25), appliqué après impôt, soit 12 % × (1 − 25 %) = 9 %. */
export const PART_DIVIDENDE = (hv('tauxDividendeElectricite') / 100) * (1 - PART_IS)
/** TVA de 20 % sur la part des ménages (144,2 TWh sur 451 TWh, S26 et S22), soit environ 6,4 %, arrondie à 6 %. */
export const PART_TVA = hv('partTvaElectricite') / 100
/** Perte directe de recettes publiques : 25 % + 9 % + 6 % = 40 % de la baisse de la facture. */
export const PART_DIRECTE = PART_IS + PART_DIVIDENDE + PART_TVA
/** Surcroît de PIB par euro de baisse de la facture (S27). */
export const MULTIPLICATEUR_PIB = hv('multiplicateurPibElectricite')

export interface MesuresHorsMoteur {
  /** Écart entre le prix de marché tendanciel et le coût moyen de production, €/MWh (euros 2027). */
  ecartPrixElectricite: number
  /** Nombre d'années concernées à partir de 2028. */
  anneesEcartElectricite: number
  /** Rachat en 2028 des actions d'Engie non détenues par l'État. */
  rachatEngie: boolean
}

/** Aucune mesure hors moteur : scénario tendanciel, et valeur neutre pour les tests du moteur de trajectoire. */
export const MESURES_NULLES: MesuresHorsMoteur = { ecartPrixElectricite: 0, anneesEcartElectricite: 2, rachatEngie: false }

export interface EffetElectricite {
  /** Vrai si l'année est concernée par l'écart de prix (et l'écart n'est pas nul). */
  actif: boolean
  /** Baisse de la facture des consommateurs T (Md€ courants ; négative si l'écart est négatif). */
  baisseFacture: number
  /** Surcroît de PIB : 0,14 × T. */
  deltaPib: number
  /** Effet direct sur le solde : impôt sur les sociétés d'EDF (négatif quand T est positif). */
  impotSocietes: number
  /** Effet direct sur le solde : dividende d'EDF versé à l'État. */
  dividende: number
  /** Effet direct sur le solde : TVA sur la part des ménages. */
  tva: number
  /** Effet direct total sur le solde : −40 % × T. */
  soldeDirect: number
}

const SANS_EFFET: EffetElectricite = { actif: false, baisseFacture: 0, deltaPib: 0, impotSocietes: 0, dividende: 0, tva: 0, soldeDirect: 0 }

/** Effet de l'écart de prix de l'électricité une année donnée ; `prix` est l'indice des prix par rapport à 2027. */
export function effetElectricite(annee: number, m: MesuresHorsMoteur, prix: number): EffetElectricite {
  const fin = ANNEE_DEBUT_ELECTRICITE + Math.round(m.anneesEcartElectricite) - 1
  if (m.ecartPrixElectricite === 0 || annee < ANNEE_DEBUT_ELECTRICITE || annee > fin) return SANS_EFFET
  const t = m.ecartPrixElectricite * MD_PAR_EUR_MWH * prix
  const impotSocietes = -PART_IS * t
  const dividende = -PART_DIVIDENDE * t
  const tva = -PART_TVA * t
  return {
    actif: true,
    baisseFacture: t,
    deltaPib: MULTIPLICATEUR_PIB * t,
    impotSocietes,
    dividende,
    tva,
    soldeDirect: impotSocietes + dividende + tva,
  }
}

/** Année du rachat d'Engie. */
export const ANNEE_RACHAT_ENGIE = 2028
/** Coût du rachat des actions non détenues par l'État, Md€ : (1 − 22,7 %) × 62 Md€ (S28, S29), hors prime de contrôle. */
export const COUT_RACHAT_ENGIE = hv('coutRachatEngie')
