import { hv } from '../data/hypotheses'

/**
 * Électricité vendue par un monopole public à un prix régulé égal au coût complet du nucléaire historique plus une marge
 * (trajectoires seulement). Tout est exprimé en écart au coût complet (61,5 €/MWh courants en 2026-2028, S20), en euros 2027.
 *
 * - e : écart entre le prix de marché tendanciel et le coût complet (curseur) ; m : marge du monopole, qui reste à EDF
 *   (ni baisse de facture, ni perte de recettes publiques) ;
 * - v(e) : minoration du versement nucléaire universel (VNU) dans le scénario sans programme, par MWh consommé (S30) :
 *   k × [50 % × min(max(e − s1, 0), s2 − s1) + 90 % × max(e − s2, 0)], avec s1 et s2 les seuils de taxation et d'écrêtement
 *   moins le coût complet, et k la part du nucléaire historique dans la consommation (362 ÷ 451) ;
 * - g = max(0, e − m − v(e)) : gain par MWh. Le prix régulé n'est jamais supérieur au prix payé sans programme : pas de
 *   hausse de facture, un écart négatif n'a aucun effet (l'effet n'est pas symétrique).
 *
 * Pour chaque année concernée (de 2028 à 2028 + n − 1), la baisse de la facture des consommateurs vaut
 * T = g × 451 TWh (volume constant ; 0,451 Md€ par €/MWh) × indice des prix :
 * - surcroît de PIB : 0,14 × T, effet de niveau limité aux années concernées (simulation FR-BDF de la Banque de France
 *   sur le bouclier tarifaire, S27 : le résultat d'un modèle, pas une mesure). Il passe ensuite par le taux de recettes
 *   sur le surcroît d'activité (θ × ΔPIB) dans la trajectoire ;
 * - solde public direct : −40 % × T, somme de trois pertes de recettes gardées séparées (impôt sur les sociétés d'EDF,
 *   dividende versé à l'État, TVA sur la part des ménages). Par rapport au scénario sans programme, le résultat d'EDF baisse
 *   de T (EDF ne paie plus la taxe VNU, reversée aux consommateurs et neutre pour le solde public).
 *
 * Approximations : coût complet du nucléaire appliqué à toute la consommation ; seuils du VNU supposés suivre le coût
 * complet ; minoration calculée sur la consommation annuelle ; taxe VNU neutre pour le solde public ; aucune baisse du prix du gaz.
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
/** Coût complet du nucléaire historique en 2026-2028, €/MWh courants (S20) : référence des écarts et des seuils. */
const COUT_COMPLET = hv('coutCompletNucleaire')
/** Seuil de taxation du VNU en écart au coût complet : 78 − 61,5 = 16,5 €/MWh (projet d'arrêté, S30). */
export const SEUIL_TAXATION_VNU = hv('tarifTaxationVnu') - COUT_COMPLET
/** Seuil d'écrêtement du VNU en écart au coût complet : 110 − 61,5 = 48,5 €/MWh (projet d'arrêté, S30). */
export const SEUIL_ECRETEMENT_VNU = hv('tarifEcretementVnu') - COUT_COMPLET
/** Part des revenus taxée entre les deux seuils (50 %) et au-delà du seuil d'écrêtement (90 %) (S30). */
export const TAUX_TAXATION_VNU = hv('tauxTaxationVnu') / 100
export const TAUX_ECRETEMENT_VNU = hv('tauxEcretementVnu') / 100
/** Part du nucléaire historique dans la consommation : 362 ÷ 451 (S20, S22). */
export const PART_NUCLEAIRE = hv('partNucleaireConsommation')

/** Minoration du VNU du scénario sans programme, €/MWh consommé (euros 2027), pour un écart e au coût complet. */
export function minorationVnu(e: number): number {
  const entre = Math.min(Math.max(e - SEUIL_TAXATION_VNU, 0), SEUIL_ECRETEMENT_VNU - SEUIL_TAXATION_VNU)
  const auDela = Math.max(e - SEUIL_ECRETEMENT_VNU, 0)
  return PART_NUCLEAIRE * (TAUX_TAXATION_VNU * entre + TAUX_ECRETEMENT_VNU * auDela)
}

/** Gain par MWh pour un écart e et une marge m (€/MWh, euros 2027) : jamais négatif (le prix régulé est plafonné). */
export function gainParMwh(e: number, marge: number): number {
  return Math.max(0, e - marge - minorationVnu(e))
}

/** Perte directe de recettes publiques : 25 % + 9 % + 6 % = 40 % de la baisse de la facture. */
export const PART_DIRECTE = PART_IS + PART_DIVIDENDE + PART_TVA
/** Surcroît de PIB par euro de baisse de la facture (S27). */
export const MULTIPLICATEUR_PIB = hv('multiplicateurPibElectricite')

export interface MesuresHorsMoteur {
  /** Écart entre le prix de marché tendanciel et le coût complet du nucléaire historique, €/MWh (euros 2027). */
  ecartPrixElectricite: number
  /** Marge du monopole public au-dessus du coût complet, €/MWh (euros 2027) : elle reste à EDF. */
  margeElectricite: number
  /** Nombre d'années concernées à partir de 2028. */
  anneesEcartElectricite: number
  /** Rachat en 2028 des actions d'Engie non détenues par l'État. */
  rachatEngie: boolean
}

/** Aucune mesure hors moteur : scénario tendanciel, et valeur neutre pour les tests du moteur de trajectoire. */
export const MESURES_NULLES: MesuresHorsMoteur = {
  ecartPrixElectricite: 0,
  margeElectricite: hv('margeElectricite'),
  anneesEcartElectricite: 2,
  rachatEngie: false,
}

export interface EffetElectricite {
  /** Vrai si l'année est concernée et si le gain par MWh est positif. */
  actif: boolean
  /** Minoration du VNU du scénario sans programme, €/MWh consommé (euros 2027, non indexé) ; 0 hors années concernées. */
  minorationVnu: number
  /** Gain par MWh g = max(0, e − marge − minoration), €/MWh (euros 2027, non indexé) ; 0 hors années concernées. */
  gainParMwh: number
  /** Baisse de la facture des consommateurs T (Md€ courants ; jamais négative). */
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

const SANS_EFFET: EffetElectricite = { actif: false, minorationVnu: 0, gainParMwh: 0, baisseFacture: 0, deltaPib: 0, impotSocietes: 0, dividende: 0, tva: 0, soldeDirect: 0 }

/** Effet de l'écart de prix de l'électricité une année donnée ; `prix` est l'indice des prix par rapport à 2027. */
export function effetElectricite(annee: number, m: MesuresHorsMoteur, prix: number): EffetElectricite {
  const fin = ANNEE_DEBUT_ELECTRICITE + Math.round(m.anneesEcartElectricite) - 1
  if (m.ecartPrixElectricite <= 0 || annee < ANNEE_DEBUT_ELECTRICITE || annee > fin) return SANS_EFFET
  const v = minorationVnu(m.ecartPrixElectricite)
  const g = gainParMwh(m.ecartPrixElectricite, m.margeElectricite)
  if (g <= 0) return { ...SANS_EFFET, minorationVnu: v }
  const t = g * MD_PAR_EUR_MWH * prix
  const impotSocietes = -PART_IS * t
  const dividende = -PART_DIVIDENDE * t
  const tva = -PART_TVA * t
  return {
    actif: true,
    minorationVnu: v,
    gainParMwh: g,
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
