import { NOTE_BONIFICATION } from './poleBancaire'
import type { Hypothese } from './sources'

const GEMINI = 'Modèle d’origine (assistant IA)'
const CADRAGE = 'Cadrage budgétaire An 1 (S1)'
const REFONTE = 'Refonte du simulateur'
const NOTE_ORDRE = 'Ordre de grandeur repris du modèle d’origine, à mettre à jour.'

const PSPP_FRANCE = 359.487
const PEPP_FRANCE = 237.484
const STOCK_BCE = PSPP_FRANCE + PEPP_FRANCE
const TAUX_INTERET_STOCK_BCE = 18.5 / 750
const GEL_OATI = 3.5
const GEL_INTERETS = STOCK_BCE * TAUX_INTERET_STOCK_BCE

/** Toutes les constantes numériques du modèle. */
export const HYPOTHESES = {
  depensesAn1: { libelle: 'Dépenses nouvelles An 1', valeur: 81.7, unite: 'Md€', statut: 'officiel', source: CADRAGE, refs: ['S1'], note: 'Inclut déjà les 10 Md€ de planification écologique. Somme des 14 lignes détaillées : 81,7.' },
  recettesAn1: { libelle: 'Recettes nouvelles An 1', valeur: 106.4, unite: 'Md€', statut: 'officiel', source: CADRAGE, refs: ['S1'], note: 'Somme des lignes détaillées : 106,4.' },
  ecologieAn1: { libelle: 'Planification écologique incluse dans les dépenses An 1', valeur: 10, unite: 'Md€', statut: 'officiel', source: CADRAGE, refs: ['S1'], note: 'Déduite de la dotation État des filières pour éviter un double compte.' },
  depensesSocialesAP: { libelle: 'Dépenses sociales d’année pleine', valeur: 85, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Retraite à 60 ans (42), 100 % Sécu (26), minima sociaux (17).' },
  recettesAP: { libelle: 'Recettes sociales et fiscales d’année pleine (100 %)', valeur: 84, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Dividendes (19), cotisations patronales (20), mutuelles (23), IR/CSG (22).' },
  recettesAPMutuelles: { libelle: 'Dont bascule des mutuelles', valeur: 23, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Remplace des primes existantes : exclue de la base de prélèvements nouveaux.' },
  recettesAPElasticiteBase: { libelle: 'Part du rendement AP insensible au recouvrement', valeur: 0.85, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Rendement AP = 84 × % × (0,85 + 0,15 × recouvrement).' },
  roiScaleAn1: { libelle: 'Montée en charge des retours en An 1', valeur: 0.42, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Seule une fraction des retours des filières est comptée la première année.' },
  multiplicateurRef: { libelle: 'Multiplicateur de référence', valeur: 1.45, unite: 'x', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Les retours indirects, coûts évités et emplois sont proportionnels à mult/1,45.' },
  facteurEvitesFixe: { libelle: 'Coûts évités : part indépendante du multiplicateur', valeur: 0.7, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Facteur = 0,7 + 0,3 × (mult/1,45).' },
  facteurEmploisFixe: { libelle: 'Emplois : part indépendante du multiplicateur', valeur: 0.65, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Facteur = 0,65 + 0,35 × (mult/1,45).' },
  retoursCourantsAn1Ratio: { libelle: 'Retours sur dépenses courantes : ratio An 1 / année pleine', valeur: 10.5 / 14, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: '10,5 / 14 dans le modèle d’origine.' },
  cades: { libelle: 'Flux CRDS/CSG de la CADES réaffecté (brut)', valeur: 19, unite: 'Md€/an', statut: 'officiel', source: 'Programme (S6)', refs: ['S6'], note: 'Selon le programme, la CADES « prive la Sécurité sociale de 19 milliards d’euros par an ». Gain pour la Sécurité sociale, pas pour le solde consolidé (voir corrections).' },
  primaireBceGemini: { libelle: 'Financement primaire BCE à 0 % (brut, modèle d’origine)', valeur: 14.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: '8,0 de bonification + 6,5 de financement à 0 %.' },
  primaireBceCorrige: { libelle: 'Financement primaire BCE à 0 % (corrigé)', valeur: 6.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Seul le financement à 0 % reste en gain : la bonification est une friction évitée, non un gain supplémentaire.' },
  tresor: { libelle: 'Rétablissement du circuit du Trésor (brut)', valeur: 8.5, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Dont planchers de bons du Trésor 5,5 et assurance-vie 3,0.' },
  leviersAn1Ratio: { libelle: 'Part des leviers primaire et Trésor active en An 1', valeur: 0.5, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Hypothèse d’entrée en vigueur progressive.' },
  tauxBonification: { libelle: 'Coût de bonification des prêts du Pôle bancaire', valeur: 0.08, unite: 'ratio', statut: 'hypothese-modele', source: REFONTE, note: NOTE_BONIFICATION },
  stockBce: { libelle: 'Titres publics français détenus par l’Eurosystème (PSPP + PEPP)', valeur: STOCK_BCE, unite: 'Md€', statut: 'officiel', calcule: true, source: 'BCE (S8, S9)', refs: ['S8', 'S9'], note: 'Somme des achats nets cumulés France au 31/10/2026 : PSPP 359,5 Md€ (S8) + PEPP 237,5 Md€ (S9). Définition BCE : coût d’acquisition moins montants nominaux remboursés ; chiffres provisoires. Baisse de 66,1 Md€ depuis le 31/12/2025 (663,1 Md€), dont 62,5 Md€ au premier semestre. Périmètre Eurosystème : différent du chiffre de la Banque de France (488 Md€ au 30/06/2026, ses seuls avoirs, en coût amorti, S7). Le chiffre de 600 Md€ cité par le programme (S1) correspond à cette série au 30/06/2026 (600,6 Md€).' },
  tauxInteretStockBce: { libelle: 'Taux d’intérêt implicite du stock détenu par la Banque de France', valeur: TAUX_INTERET_STOCK_BCE, unite: 'ratio', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Taux implicite du modèle d’origine (18,5 Md€ sur ~750 Md€). Le rendement réel des titres achetés pendant les programmes, souvent à faible coupon, n’est pas publié ici : à vérifier.' },
  gelBceInterets: { libelle: 'Gel BCE : intérêts économisés sur le stock', valeur: GEL_INTERETS, unite: 'Md€/an', statut: 'hypothese-non-sourcee', calcule: true, source: GEMINI, note: 'Calculé : stock (597,0 Md€) × taux implicite. À vérifier.' },
  gelBceOati: { libelle: 'Gel BCE : fin des OATi (nouvelles émissions)', valeur: GEL_OATI, unite: 'Md€/an', statut: 'hypothese-non-sourcee', source: GEMINI, note: 'Gain progressif : la fin des OATi porte sur les nouvelles émissions. À vérifier.' },
  gelBce: { libelle: 'Gel / conversion du stock détenu par la BCE (brut)', valeur: GEL_INTERETS + GEL_OATI, unite: 'Md€/an', statut: 'hypothese-non-sourcee', calcule: true, source: GEMINI, note: 'Calculé : intérêts sur le stock + OATi. Le modèle d’origine retenait 22 Md€ (sur un stock de ~750 Md€). Environ 18,2 Md€ avec le stock au 31/10/2026. Nécessite une décision de la BCE.' },
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
  deficitTendanciel: { libelle: 'Déficit tendanciel (constant)', valeur: -5.4, unite: '% du PIB', statut: 'officiel', source: CADRAGE, refs: ['S1'], note: 'Le déficit « passe de 5,1 % à 5,4 % » avec le budget 2026 (S1). Maintenu constant dans le scénario tendanciel.' },
  dette2026: { libelle: 'Dette publique 2026', valeur: 3595, unite: 'Md€', statut: 'officiel', source: CADRAGE, refs: ['S1', 'S6'], note: 'Le ratio de départ est calculé avec le PIB 2026 ci-dessus (hypothèse, à mettre à jour).' },
} as const satisfies Record<string, Hypothese>

export type CleHypothese = keyof typeof HYPOTHESES

/** Raccourci vers la valeur numérique d'une hypothèse. */
export const hv = (k: CleHypothese): number => HYPOTHESES[k].valeur
