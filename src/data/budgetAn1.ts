import type { StatutFiabilite } from './sources'

export interface Fourchette {
  min: number | null
  max: number | null
}

export interface LigneBudget {
  id: string
  pole: string
  libelle: string
  montant: number
  fourchette?: Fourchette
  statut: StatutFiabilite
  /** Statut de la fourchette quand elle existe. */
  statutFourchette?: StatutFiabilite
  commentaire?: string
}

export interface PoleBudget {
  nom: string
  /** Total annoncé pour le pôle. */
  totalAnnonce: number
  lignes: LigneBudget[]
}

const dep = (id: string, pole: string, libelle: string, montant: number): LigneBudget => ({
  id, pole, libelle, montant, statut: 'officiel',
})
const rec = (
  id: string, pole: string, libelle: string, montant: number,
  min: number | null, max: number | null, commentaire?: string,
): LigneBudget => ({
  id, pole, libelle, montant, statut: 'officiel',
  fourchette: { min, max }, statutFourchette: 'estimation-externe', commentaire,
})

export const DEPENSES_AN1: PoleBudget[] = [
  {
    nom: 'Pouvoir d’achat et revenus populaires', totalAnnonce: 37.5,
    lignes: [
      dep('d-indice', 'Pouvoir d’achat et revenus populaires', 'Point d’indice +10 %', 17.0),
      dep('d-jeunes', 'Pouvoir d’achat et revenus populaires', 'Garantie d’autonomie pour les jeunes', 9.5),
      dep('d-indexation', 'Pouvoir d’achat et revenus populaires', 'Indexation de 10 % des pensions, allocations et APL', 8.0),
      dep('d-logement', 'Pouvoir d’achat et revenus populaires', 'Plan zéro sans-abri et réquisition de logements vacants', 3.0),
    ],
  },
  {
    nom: 'Services publics', totalAnnonce: 22.2,
    lignes: [
      dep('d-coupes', 'Services publics', 'Annulation des coupes 2026 et indexation des ministères', 7.0),
      dep('d-cantine', 'Services publics', 'Gratuité de la cantine', 3.6),
      dep('d-parcoursup', 'Services publics', 'Fin de Parcoursup/MonMaster et 250 000 places', 3.5),
      dep('d-hopital', 'Services publics', 'Plan d’urgence hôpital (+10 000 postes)', 3.0),
      dep('d-vss', 'Services publics', 'Violences sexistes et sexuelles', 2.6),
      dep('d-enfance', 'Services publics', 'Protection de l’enfance', 2.0),
      dep('d-education', 'Services publics', 'Éducation nationale (+10 000 postes)', 0.5),
    ],
  },
  {
    nom: 'Sécurité sociale', totalAnnonce: 12.0,
    lignes: [
      dep('d-retraite', 'Sécurité sociale', 'Abrogation de la réforme Borne (64 → 62 ans)', 9.0),
      dep('d-chomage', 'Sécurité sociale', 'Abrogation des réformes de l’assurance chômage', 3.0),
    ],
  },
  {
    nom: 'Planification écologique', totalAnnonce: 10.0,
    lignes: [dep('d-ecologie', 'Planification écologique', 'Fonds d’adaptation au dérèglement climatique', 10.0)],
  },
]

export const RECETTES_AN1: PoleBudget[] = [
  {
    nom: 'Retour sur les baisses d’impôts post-2017', totalAnnonce: 44.0,
    lignes: [
      rec('r-niches', 'Baisses d’impôts post-2017', 'Niches fiscales et sociales', 22.0, 5.6, 22.0),
      rec('r-quotient', 'Baisses d’impôts post-2017', 'Quotient conjugal/familial', 10.0, 10.0, 11.0, 'Absent de la matrice du modèle d’origine.'),
      rec('r-flat', 'Baisses d’impôts post-2017', 'Suppression de la flat tax', 9.0, 4.0, 9.0),
      rec('r-cvae', 'Baisses d’impôts post-2017', 'CVAE', 3.0, 3.0, 11.0),
    ],
  },
  {
    nom: 'Hauts patrimoines', totalAnnonce: 35.0,
    lignes: [
      rec('r-successions', 'Hauts patrimoines', 'Successions et héritage maximum', 20.0, 3.1, 12.5),
      rec('r-zucman', 'Hauts patrimoines', 'Taxe Zucman 2 % au-delà de 100 M€', 15.0, 5.0, 15.0),
    ],
  },
  {
    nom: 'Ligne isolée (rattachement ambigu)', totalAnnonce: 10.0,
    lignes: [
      rec('r-isf', 'Ligne isolée', 'ISF renforcé climatique', 10.0, 5.0, 10.0,
        'N’entre dans aucun sous-total annoncé ; exclue des 106,4 Md€ utilisés par le moteur.'),
    ],
  },
  {
    nom: 'Grandes entreprises', totalAnnonce: 16.9,
    lignes: [
      rec('r-multi', 'Grandes entreprises', 'Multinationales', 5.0, null, 26.0, 'Fourchette citée : jusqu’à 26,0 Md€ en année pleine.'),
      rec('r-gafam', 'Grandes entreprises', 'Taxe GAFAM', 3.9, 2.0, 3.9),
      rec('r-is', 'Grandes entreprises', 'Barème de l’impôt sur les sociétés', 3.0, 3.0, 6.3),
      rec('r-superprofits', 'Grandes entreprises', 'Superprofits', 5.0, 3.0, 5.0),
    ],
  },
  {
    nom: 'Spéculation et fraude', totalAnnonce: 10.5,
    lignes: [
      rec('r-ttf', 'Spéculation et fraude', 'Taxe sur les transactions financières (TTF)', 5.0, 2.0, 5.0),
      rec('r-rachats', 'Spéculation et fraude', 'Rachats d’actions', 2.5, 1.5, 2.5),
      rec('r-crypto', 'Spéculation et fraude', 'Crypto-actifs', 1.0, 0.5, 1.0),
      rec('r-fraude', 'Spéculation et fraude', 'Fraude fiscale', 2.0, 1.0, 2.0),
    ],
  },
]

/** Fourchette réaliste totale citée pour l'année 1. */
export const FOURCHETTE_REALISTE_RECETTES_AN1: Fourchette = { min: 55, max: 85 }

export const sommeLignes = (poles: PoleBudget[]): number =>
  poles.reduce((s, p) => s + p.lignes.reduce((t, l) => t + l.montant, 0), 0)
