import { GROUPES_METIERS, REPARTITION_FILIERES } from '../data/metiers'
import { hv } from '../data/hypotheses'
import type { SimulationParams } from './types'

/**
 * Contrainte de main-d'œuvre, immigration de travail et régularisation (trajectoires seulement).
 *
 * Principe : le surcroît de PIB du programme suppose déjà que tous les emplois créés sont pourvus. Les travailleurs immigrés
 * n'ajoutent donc pas de PIB en plus : ils rendent possible celui déjà compté, là où il n'y a pas assez de chômeurs du métier.
 * Les emplois qui ne trouvent ni chômeur ni nouvel arrivant ne sont pas créés, et le PIB correspondant non plus.
 *
 * Pour une année t et une filière f : E_f,t = emplois d'année pleine réalisés de la filière × rythme(t), avec
 * rythme(t) = min(1, (t − 2027) / D). Seule la part directe des emplois est soumise à la contrainte :
 * fj / (fj + (1 − fj) × mult / 1,45), fj = 0,65 ; le reste (emplois induits par le multiplicateur) est supposé pourvu par des
 * chômeurs de l'ensemble de l'économie, sans contrainte.
 * Emplois directs à pourvoir par groupe de métiers g : J_g,t = Σ_f (part directe × E_f,t × part_f,g).
 * Réserve de chômeurs : k × DE ABC_g (stock fixe de 09/2026). Manque M_g,t = max(0 ; J_g,t − k × DE_g), G_t = Σ_g M_g,t.
 * Travailleurs immigrés W_t = φ × G_t ; emplois non créés N_t = (1 − φ) × G_t ; migrants nets supplémentaires (stock)
 * P_t = W_t / 0,7.
 */

/** Paramètres de la contrainte de main-d'œuvre et de la régularisation. */
export interface ParamsMainOeuvre {
  /** Part des demandeurs d'emploi ABC de chaque groupe mobilisables, %. */
  partChomeursMobilisablesPct: number
  /** Part des emplois manquants pourvus par une nouvelle immigration de travail, %. */
  partEmploisManquantsImmigrationPct: number
  /** Personnes régularisées à partir de 2028. */
  effectifRegularisation: number
  /** Multiplicateur du programme : détermine la part directe des emplois. */
  multiplicateur: number
}

export const mainOeuvreDepuisParams = (p: SimulationParams): ParamsMainOeuvre => ({
  partChomeursMobilisablesPct: p.partChomeursMobilisablesPct,
  partEmploisManquantsImmigrationPct: p.partEmploisManquantsImmigrationPct,
  effectifRegularisation: p.effectifRegularisation,
  multiplicateur: p.multiplicateur,
})

/** Part directe des emplois d'une filière : fj / (fj + (1 − fj) × mult / 1,45). */
export function partDirecteEmplois(multiplicateur: number): number {
  const fj = hv('facteurEmploisFixe')
  return fj / (fj + ((1 - fj) * multiplicateur) / hv('multiplicateurRef'))
}

export interface BilanMainOeuvre {
  /** Emplois directs du programme à pourvoir, avant contrainte : somme des J. */
  emploisDirectsCrees: number
  /** Emplois directs pourvus par des chômeurs du métier. */
  emploisPourvusChomeurs: number
  /** Travailleurs immigrés : φ × G. */
  travailleursImmigres: number
  /** Emplois directs non créés : (1 − φ) × G. */
  emploisNonCrees: number
  /** Migrants nets supplémentaires (stock) : travailleurs immigrés ÷ 0,7. */
  migrantsSupplementaires: number
  /** Part non réalisée des emplois directs : emplois non créés ÷ emplois directs (0 s'il n'y en a pas). */
  partNonRealisee: number
}

export const BILAN_NUL: BilanMainOeuvre = {
  emploisDirectsCrees: 0, emploisPourvusChomeurs: 0, travailleursImmigres: 0, emploisNonCrees: 0, migrantsSupplementaires: 0, partNonRealisee: 0,
}

/**
 * Bilan d'une année. `emploisAnneePleine` : emplois d'année pleine réalisés de chaque filière (identifiant de filière) ;
 * `rythme` : min(1, (année − 2027) / D), 0 en 2026 et 2027.
 */
export function bilanMainOeuvre(emploisAnneePleine: Readonly<Record<string, number>>, rythme: number, p: ParamsMainOeuvre): BilanMainOeuvre {
  const direct = partDirecteEmplois(p.multiplicateur)
  const k = p.partChomeursMobilisablesPct / 100
  const phi = Math.min(1, Math.max(0, p.partEmploisManquantsImmigrationPct / 100))
  const aPourvoir = new Map<string, number>()
  let total = 0
  for (const [filiere, emplois] of Object.entries(emploisAnneePleine)) {
    for (const [groupe, part] of Object.entries(REPARTITION_FILIERES[filiere] ?? {})) {
      const j = direct * emplois * rythme * part
      aPourvoir.set(groupe, (aPourvoir.get(groupe) ?? 0) + j)
      total += j
    }
  }
  let manque = 0
  for (const g of GROUPES_METIERS) manque += Math.max(0, (aPourvoir.get(g.id) ?? 0) - k * g.demandeursABC)
  const travailleurs = phi * manque
  const nonCrees = (1 - phi) * manque
  return {
    emploisDirectsCrees: total,
    emploisPourvusChomeurs: total - manque,
    travailleursImmigres: travailleurs,
    emploisNonCrees: nonCrees,
    migrantsSupplementaires: travailleurs / hv('actifsParMigrant'),
    partNonRealisee: total > 0 ? nonCrees / total : 0,
  }
}

/** Dépenses des nouveaux habitants, Md€ courants : migrants × 21 300 € × PIB tendanciel de l'année ÷ PIB 2025. */
export const depensesNouveauxHabitants = (migrants: number, pibTendanciel: number): number =>
  ((migrants * hv('depenseVariableParHabitant')) / 1e9) * (pibTendanciel / hv('pib2025'))

/** Recettes de la régularisation pour 2025, € par personne régularisée : 61,9 % × 55 % × 14 570 €, environ 4 960 €. */
export const recetteParRegularise2025 = (): number =>
  (hv('partRegularisesEnEmploi') / 100) * (hv('ratioCotisationsRegularises') / 100) * hv('cotisationsParEmploi')

/** Recettes de la régularisation, Md€ courants (à partir de 2028), indexées sur le PIB tendanciel en valeur. */
export const recettesRegularisation = (effectif: number, pibTendanciel: number): number =>
  ((effectif * recetteParRegularise2025()) / 1e9) * (pibTendanciel / hv('pib2025'))
