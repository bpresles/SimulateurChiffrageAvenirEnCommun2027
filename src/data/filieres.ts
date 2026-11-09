/** Les 10 filières d'investissement productif, reprises du modèle d'origine (sans logique). */
import type { SourceId, StatutFiabilite } from './sources'

/** Libellé de la colonne « autres financeurs » des livrets. */
export const LIBELLE_POLE = 'Pôle public bancaire et autres acteurs'

export type StatutFiliere = 'publie' | 'estime'

export interface AxeLivret {
  libelle: string
  /** Md€/an */
  etat: number
  /** Md€/an, pôle public bancaire et autres acteurs */
  banque: number
}

export interface Filiere {
  id: string
  num: number
  statut: StatutFiliere
  nom: string
  desc: string
  /** Investissement État au P50, Md€/an. */
  etatP50: number
  /** Investissement du Pôle public bancaire au P50, Md€/an. */
  banqueP50: number
  p10: number
  p50: number
  p90: number
  roiDirectP50: number
  roiIndirectP50: number
  coutsEvitesP50: number
  emploisP50: number
  cibles: string
  statutInvestissement: StatutFiabilite
  statutRoi: StatutFiabilite
  /** Références du registre des sources pour les valeurs officielles. */
  refs?: SourceId[]
  /** Détail par axe du livret (Md€/an), si publié. */
  axes?: AxeLivret[]
  /** Précisions sur la décomposition des coûts évités ou sur la donnée. */
  note?: string
}

const NS: StatutFiabilite = 'hypothese-non-sourcee'

export const FILIERES: Filiere[] = [
  {
    id: 'btp', num: 1, statut: 'publie',
    nom: 'BTP, logement social et rénovation thermique',
    desc: 'Selon le livret, construction de 200 000 logements publics par an et de 30 000 logements jeunes pendant cinq ans, isolation d’au moins 700 000 logements par an, rénovation des bâtiments publics, sortie des chaudières fioul.',
    etatP50: 12.06, banqueP50: 36.4, p10: 36.5, p50: 48.46, p90: 55.0,
    roiDirectP50: 10.5, roiIndirectP50: 13.8, coutsEvitesP50: 7.1, emploisP50: 300000,
    cibles: '200 000 logements publics/an • 30 000 logements jeunes sur 5 ans • au moins 700 000 isolations/an',
    statutInvestissement: 'officiel', statutRoi: NS, refs: ['S2'],
    axes: [
      { libelle: 'Nouveaux logements publics', etat: 3, banque: 14 },
      { libelle: 'Rénovation des logements sociaux', etat: 0.4, banque: 1.7 },
      { libelle: 'Isolation des logements', etat: 5.3, banque: 5.3 },
      { libelle: 'Plan confort d’été', etat: 0.5, banque: 0.6 },
      { libelle: 'Rénovation des bâtiments publics, associatifs et des bâtiments tertiaires privés', etat: 1.2, banque: 9 },
      { libelle: 'Développement de la construction bois-terre-paille', etat: 0, banque: 0.2 },
      { libelle: 'Sortie des chaudières fioul et diminution du nombre de chaudières à gaz', etat: 1, banque: 2.8 },
      { libelle: 'Formation de professionnels de la rénovation et de la construction bas-carbone', etat: 0.06, banque: 0 },
      { libelle: 'Réduction des déchets et réemploi', etat: 0.2, banque: 0.5 },
      { libelle: 'Rénovation et entretien du patrimoine', etat: 0.4, banque: 0 },
      { libelle: 'Maîtrise publique du foncier', etat: 0, banque: 0.3 },
      { libelle: 'Accession à la propriété non spéculative', etat: 0, banque: 2 },
    ],
    note: 'Investissement et emplois (« plus de 300 000 ») : source officielle (S2). L’État totalise 12,06 Md€ (le livret annonce « 12 milliards »). P10, P90 et retours sectoriels (dont coûts évités : santé 1,8 ; importations 3,3 ; confort d’été 2,0) : hypothèses non sourcées.',
  },
  {
    id: 'auto', num: 2, statut: 'publie',
    nom: 'Automobile, batteries et mobilités électriques',
    desc: 'Selon le livret, production de 2 millions de véhicules électriques par an, service public de la location abordable (1,4 million de véhicules loués d’ici 2032), filière des batteries, fonds pour la sous-traitance et les équipementiers.',
    etatP50: 1.37, banqueP50: 3.1, p10: 3.2, p50: 4.47, p90: 5.5,
    roiDirectP50: 0.9, roiIndirectP50: 1.35, coutsEvitesP50: 0.85, emploisP50: 40000,
    cibles: '2 M de véhicules électriques produits/an • 1,4 M de véhicules loués d’ici 2032 • Fonds Avenir Automobile doté de 4 Md€',
    statutInvestissement: 'officiel', statutRoi: NS, refs: ['S3'],
    axes: [
      { libelle: 'Nouvelles lignes de production', etat: 0.1, banque: 0.2 },
      { libelle: 'Service public de la location abordable', etat: 0.3, banque: 0.7 },
      { libelle: 'Aides à l’achat de véhicules électriques et locaux', etat: 0.2, banque: 0.2 },
      { libelle: 'Fonds pour la sous-traitance et les équipementiers', etat: 0.2, banque: 0.8 },
      { libelle: 'Filière des batteries', etat: 0.5, banque: 0.9 },
      { libelle: 'Réparation, réemploi, recyclage', etat: 0.05, banque: 0.24 },
      { libelle: 'Bornes de recharge', etat: 0, banque: 0.02 },
      { libelle: 'Formation', etat: 0, banque: 0.01 },
      { libelle: 'R&D et déploiement de minibus autonomes', etat: 0.02, banque: 0.03 },
    ],
    note: 'Investissement et emplois (« plus de 40 000 ») : source officielle (S3). L’État totalise 1,37 Md€ (le livret annonce « 1,4 milliard ») et le total 4,47 Md€ (« 4,5 milliards d’euros par an, tous acteurs confondus »). P10, P90 et retours sectoriels : hypothèses non sourcées.',
  },
  {
    id: 'energie', num: 3, statut: 'estime',
    nom: 'Énergie renouvelable, réseaux et stockage',
    desc: 'Pôle public de l’énergie, planification vers 100 % d’énergies renouvelables (solaire, géothermie, biogaz, hydraulique), modernisation du réseau électrique et stockage d’hydrogène vert.',
    etatP50: 1.5, banqueP50: 16.5, p10: 13.0, p50: 18.0, p90: 23.0,
    roiDirectP50: 3.6, roiIndirectP50: 4.9, coutsEvitesP50: 3.8, emploisP50: 145000,
    cibles: 'Pôle public de l’énergie • prix bloqués • sortie des fossiles',
    statutInvestissement: NS, statutRoi: NS,
    note: 'Coûts évités : baisse de la facture d’importation d’hydrocarbures.',
  },
  {
    id: 'rail', num: 4, statut: 'estime',
    nom: 'Transports collectifs, ferroviaire, fret et RER métropolitains',
    desc: 'Pôle public ferroviaire unifié, réouverture des petites lignes et des trains de nuit, plan de ferroutage et de fret fluvial, gratuité ciblée des transports du quotidien, désenclavement rural.',
    etatP50: 1.4, banqueP50: 12.6, p10: 10.0, p50: 14.0, p90: 18.0,
    roiDirectP50: 2.9, roiIndirectP50: 3.8, coutsEvitesP50: 2.1, emploisP50: 115000,
    cibles: 'Réouverture de petites lignes • doublement de la part modale du fret',
    statutInvestissement: NS, statutRoi: NS,
    note: 'Coûts évités : décongestion routière, accidents, usure des routes, pollution de l’air.',
  },
  {
    id: 'eau', num: 5, statut: 'estime',
    nom: 'Eau potable, assainissement et adaptation climatique',
    desc: 'Réfection des canalisations d’eau (1 litre sur 5 perdu par fuite), gestion publique et gratuité des premiers m³, plan d’urgence Outre-mer, prévention des inondations et des feux.',
    etatP50: 1.0, banqueP50: 9.0, p10: 7.2, p50: 10.0, p90: 13.0,
    roiDirectP50: 2.2, roiIndirectP50: 2.7, coutsEvitesP50: 2.4, emploisP50: 85000,
    cibles: 'Zéro fuite sur le réseau • plan Eau Outre-mer',
    statutInvestissement: NS, statutRoi: NS,
    note: 'Coûts évités : réduction de dégâts climatiques (coût de 16 Md€ en 2026 selon S1).',
  },
  {
    id: 'industrie', num: 6, statut: 'estime',
    nom: 'Industrie stratégique, relocalisations et pôle du médicament',
    desc: 'Pôle public du médicament (principes actifs et génériques), fonderie publique de semi-conducteurs, décarbonation de l’acier, du ciment et de la chimie, filières de recyclage industriel.',
    etatP50: 0.6, banqueP50: 8.4, p10: 6.0, p50: 9.0, p90: 12.0,
    roiDirectP50: 1.95, roiIndirectP50: 2.65, coutsEvitesP50: 0.9, emploisP50: 95000,
    cibles: 'Pôle public du médicament • fonderie de puces électroniques',
    statutInvestissement: NS, statutRoi: NS,
    note: 'Coûts évités : prix d’achat hospitaliers des médicaments et pénuries.',
  },
  {
    id: 'agri', num: 7, statut: 'estime',
    nom: 'Agriculture écologique, souveraineté alimentaire et forêt-bois',
    desc: 'Installation de 300 000 nouveaux agriculteurs, caisse de désendettement des exploitations en conversion bio, filières locales pour la restauration collective, scieries publiques et ONF.',
    etatP50: 0.4, banqueP50: 6.1, p10: 4.5, p50: 6.5, p90: 8.5,
    roiDirectP50: 1.35, roiIndirectP50: 1.85, coutsEvitesP50: 0.65, emploisP50: 160000,
    cibles: '300 000 installations • sortie des pesticides • ONF renforcé',
    statutInvestissement: NS, statutRoi: NS,
    note: 'Coûts évités : dépollution de l’eau et pathologies chroniques.',
  },
  {
    id: 'mer', num: 8, statut: 'estime',
    nom: 'Économie maritime, grands ports, éolien offshore et pêche',
    desc: 'Filière d’éolien marin, modernisation des grands ports maritimes, électrification des quais, propulsion vélique ou décarbonée de la flotte, rénovation de la pêche artisanale.',
    etatP50: 0.15, banqueP50: 4.35, p10: 3.0, p50: 4.5, p90: 6.0,
    roiDirectP50: 0.9, roiIndirectP50: 1.25, coutsEvitesP50: 0.15, emploisP50: 45000,
    cibles: 'Souveraineté éolien offshore • chantiers navals décarbonés',
    statutInvestissement: NS, statutRoi: NS,
  },
  {
    id: 'numerique', num: 9, statut: 'estime',
    nom: 'Numérique souverain, cloud public, fibre et IA d’intérêt général',
    desc: 'Cloud public souverain, centres de données éco-conçus à récupération de chaleur, service public de la fibre et logiciels libres.',
    etatP50: 0.1, banqueP50: 3.1, p10: 2.2, p50: 3.2, p90: 4.5,
    roiDirectP50: 0.65, roiIndirectP50: 0.85, coutsEvitesP50: 0.1, emploisP50: 30000,
    cibles: 'Cloud public souverain • IA ouverte • fin du cuivre',
    statutInvestissement: NS, statutRoi: NS,
    note: 'Coûts évités : licences logicielles propriétaires dans l’administration.',
  },
  {
    id: 'spatial', num: 10, statut: 'estime',
    nom: 'Spatial public, recherche et infrastructures de l’enseignement supérieur',
    desc: 'Pôle public spatial, lanceurs réutilisables et dépollution orbitale, réhabilitation des universités et laboratoires publics, 15 000 logements étudiants par an.',
    etatP50: 0.1, banqueP50: 1.45, p10: 1.1, p50: 1.55, p90: 2.5,
    roiDirectP50: 0.3, roiIndirectP50: 0.45, coutsEvitesP50: 0.05, emploisP50: 20000,
    cibles: 'Pôle spatial public • 15 000 logements étudiants/an',
    statutInvestissement: NS, statutRoi: NS,
  },
]

/** Rôle d'une filière dans le report de la demande vers des produits français (piste 9, façon B). */
export interface SubstitutionImports {
  /** Vrai si le capital installé par la filière peut remplacer des importations de la demande créée par le programme. */
  retenue: boolean
  motif: string
}

/**
 * Garde-fou automatique de la façon B (hypothèse de modélisation) : seul le capital des filières qui produisent des
 * biens ou des services échangeables, et dont les importations évitées ne sont pas déjà comptées dans les coûts
 * évités, fait baisser la part importée de la demande. La demande des 10 filières profite du report.
 */
export const SUBSTITUTION_IMPORTS: Readonly<Record<string, SubstitutionImports>> = {
  btp: { retenue: false, motif: 'Logements et bâtiments, non échangeables ; les importations évitées (3,3 Md€ au P50) figurent déjà dans les coûts évités.' },
  auto: { retenue: true, motif: 'Véhicules, batteries et équipements : biens échangeables produits par de nouvelles lignes de production.' },
  energie: { retenue: false, motif: 'Les importations d’hydrocarbures évitées figurent déjà dans les coûts évités.' },
  rail: { retenue: false, motif: 'Infrastructures et services de transport, non échangeables.' },
  eau: { retenue: false, motif: 'Réseaux d’eau et ouvrages de protection, non échangeables.' },
  industrie: { retenue: true, motif: 'Médicaments, semi-conducteurs, acier, ciment, chimie : biens échangeables ; les coûts évités portent sur les prix d’achat hospitaliers, pas sur les importations.' },
  agri: { retenue: true, motif: 'Produits agricoles, alimentaires et bois : biens échangeables ; les coûts évités portent sur la dépollution et la santé.' },
  mer: { retenue: true, motif: 'Éolien en mer, chantiers navals et pêche : biens échangeables (les ports, non échangeables, en sont une partie).' },
  numerique: { retenue: true, motif: 'Cloud, logiciels et centres de données : services échangeables ; les coûts évités (licences de l’administration, 0,1 Md€) portent sur les achats de l’État, pas sur la demande créée par le programme.' },
  spatial: { retenue: false, motif: 'Surtout des universités, des laboratoires et des logements étudiants, non échangeables.' },
}
