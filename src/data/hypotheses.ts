import type { Hypothese } from './sources'

const GEMINI = 'Modèle d’origine (assistant IA)'
const CADRAGE = 'Cadrage An 1 (transcription non vérifiée)'
const REFONTE = 'Refonte du simulateur'
const NOTE_ORDRE = 'Ordre de grandeur repris du modèle d’origine, à mettre à jour.'

/** Toutes les constantes numériques du modèle. */
export const HYPOTHESES = {
  depensesAn1: { libelle: 'Dépenses nouvelles An 1', valeur: 81.7, unite: 'Md€', statut: 'officiel', source: CADRAGE, note: 'Inclut déjà les 10 Md€ de planification écologique.' },
  recettesAn1: { libelle: 'Recettes nouvelles An 1 annoncées', valeur: 106.4, unite: 'Md€', statut: 'officiel', source: CADRAGE, note: 'La somme des lignes détaillées est de 116,4 Md€ (écart de 10 Md€, voir matrice).' },
  ecologieAn1: { libelle: 'Planification écologique incluse dans les dépenses An 1', valeur: 10, unite: 'Md€', statut: 'officiel', source: CADRAGE, note: 'Déduite de la dotation État des filières pour éviter un double compte.' },
  depensesSocialesAP: { libelle: 'Dépenses sociales d’année pleine', valeur: 85, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Retraite à 60 ans (42), 100 % Sécu (26), minima sociaux (17).' },
  recettesAP: { libelle: 'Recettes sociales et fiscales d’année pleine (100 %)', valeur: 84, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Dividendes (19), cotisations patronales (20), mutuelles (23), IR/CSG (22).' },
  recettesAPMutuelles: { libelle: 'Dont bascule des mutuelles', valeur: 23, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Remplace des primes existantes : exclue de la base de prélèvements nouveaux.' },
  recettesAPElasticiteBase: { libelle: 'Part du rendement AP insensible au recouvrement', valeur: 0.85, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Rendement AP = 84 × % × (0,85 + 0,15 × recouvrement).' },
  roiScaleAn1: { libelle: 'Montée en charge des retours en An 1', valeur: 0.42, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Seule une fraction des retours des filières est comptée la première année.' },
  multiplicateurRef: { libelle: 'Multiplicateur de référence', valeur: 1.45, unite: 'x', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Les retours indirects, coûts évités et emplois sont proportionnels à mult/1,45.' },
  facteurEvitesFixe: { libelle: 'Coûts évités : part indépendante du multiplicateur', valeur: 0.7, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Facteur = 0,7 + 0,3 × (mult/1,45).' },
  facteurEmploisFixe: { libelle: 'Emplois : part indépendante du multiplicateur', valeur: 0.65, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Facteur = 0,65 + 0,35 × (mult/1,45).' },
  retoursCourantsAn1Ratio: { libelle: 'Retours sur dépenses courantes : ratio An 1 / année pleine', valeur: 10.5 / 14, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: '10,5 / 14 dans le modèle d’origine.' },
  gelBce: { libelle: 'Gel / conversion du stock détenu par la BCE (brut)', valeur: 22, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Dont 18,5 d’intérêts sur le stock BCE et 3,5 sur les OATi. Nécessite une évolution des traités ou un accord BCE.' },
  gelBceInterets: { libelle: 'Dont intérêts sur le stock BCE', valeur: 18.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'À vérifier.' },
  gelBceOati: { libelle: 'Dont titres indexés (OATi)', valeur: 3.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'À vérifier.' },
  cades: { libelle: 'Flux CRDS/CSG de la CADES réaffecté (brut)', valeur: 19, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Gain pour la Sécurité sociale, pas pour le solde consolidé (voir corrections).' },
  primaireBceGemini: { libelle: 'Financement primaire BCE à 0 % (brut, modèle d’origine)', valeur: 14.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: '8,0 de bonification + 6,5 de financement à 0 %.' },
  primaireBceCorrige: { libelle: 'Financement primaire BCE à 0 % (corrigé)', valeur: 6.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Seul le financement à 0 % reste en gain : la bonification est une friction évitée, non un gain supplémentaire.' },
  tresor: { libelle: 'Rétablissement du circuit du Trésor (brut)', valeur: 8.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Dont planchers de bons du Trésor 5,5 et assurance-vie 3,0.' },
  leviersAn1Ratio: { libelle: 'Part des leviers primaire et Trésor active en An 1', valeur: 0.5, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Hypothèse d’entrée en vigueur progressive.' },
  tauxBonification: { libelle: 'Coût de bonification des prêts du Pôle bancaire', valeur: 0.08, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Part des prêts du Pôle à la charge de l’État sans financement primaire.' },
  risqueSpread: { libelle: 'Risque de spread sans circuit du Trésor', valeur: 11, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Friction proportionnelle à (1 − part du circuit du Trésor).' },
  fuiteImportMin: { libelle: 'Fuite commerciale minimale', valeur: 2.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Plancher de la fuite vers les importations.' },
  fuiteImportSeuil: { libelle: 'Fuite commerciale : seuil du multiplicateur', valeur: 1.85, unite: 'x', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Fuite = max(2,5 ; (1,85 − mult) × 8).' },
  fuiteImportPente: { libelle: 'Fuite commerciale : pente', valeur: 8, unite: 'Md€/point', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Voir ci-dessus.' },
  fuiteImportAn1Ratio: { libelle: 'Fuite commerciale An 1 / année pleine', valeur: 0.6, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Fraction de la fuite comptée en An 1.' },
  tauxRetourFiscalPib: { libelle: 'Taux de retour fiscal par Md€ de PIB (effet récessif)', valeur: 0.35, unite: 'ratio', statut: 'hypothese-modele', source: REFONTE, note: 'Choisi symétrique du taux de retour implicite des filières (~0,34 Md€ de recettes par Md€ de PIB induit).' },
  basePrelevementsAP: { libelle: 'Part des recettes AP soumise à l’effet récessif', valeur: 61 / 84, unite: 'ratio', statut: 'hypothese-modele', source: REFONTE, note: '(84 − 23) / 84 : exclut la bascule des mutuelles.' },
  rho: { libelle: 'Corrélation entre filières (Monte-Carlo)', valeur: 0.5, unite: 'ρ', statut: 'hypothese-modele', source: REFONTE, note: 'Facteur commun. Réglable en hypothèses avancées.' },
  nTirages: { libelle: 'Nombre de tirages Monte-Carlo', valeur: 5000, unite: 'tirages', statut: 'hypothese-modele', source: REFONTE, note: 'PRNG mulberry32 à graine fixe : résultats reproductibles.' },
  graine: { libelle: 'Graine du générateur pseudo-aléatoire', valeur: 20270, unite: '', statut: 'hypothese-modele', source: REFONTE, note: 'Fixe pour la reproductibilité.' },
  pib2026: { libelle: 'PIB 2026', valeur: 3000, unite: 'Md€', statut: 'hypothese-modele', source: REFONTE, note: NOTE_ORDRE },
  croissanceNominale: { libelle: 'Croissance nominale tendancielle', valeur: 2.5, unite: '%/an', statut: 'hypothese-modele', source: REFONTE, note: NOTE_ORDRE },
  deficitTendanciel: { libelle: 'Déficit tendanciel (constant)', valeur: -5.1, unite: '% du PIB', statut: 'hypothese-modele', source: REFONTE, note: NOTE_ORDRE },
  dettePib2026: { libelle: 'Dette 2026', valeur: 118, unite: '% du PIB', statut: 'hypothese-modele', source: REFONTE, note: NOTE_ORDRE },
  stockBce: { libelle: 'Stock de dette détenu par la BCE', valeur: 750, unite: 'Md€', statut: 'hypothese-modele', source: REFONTE, note: NOTE_ORDRE },
} as const satisfies Record<string, Hypothese>

export type CleHypothese = keyof typeof HYPOTHESES

/** Raccourci vers la valeur numérique d'une hypothèse. */
export const hv = (k: CleHypothese): number => HYPOTHESES[k].valeur
