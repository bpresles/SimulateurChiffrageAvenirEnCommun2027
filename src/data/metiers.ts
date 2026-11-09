/**
 * Groupes de métiers de la contrainte de main-d'œuvre (trajectoires seulement). Valeurs codées en dur, recalculées avec
 * un script (hors dépôt) à partir de deux sources officielles :
 *
 * - demandeurs d'emploi : DARES, demandeurs d'emploi par métier recherché (domaines ROME), données mensuelles brutes de
 *   09/2026, France métropolitaine (S38). Catégorie A : sans activité ; catégories ABC : avec ou sans activité réduite.
 *   Chaque groupe additionne plusieurs domaines ROME (ROME_PAR_GROUPE) ;
 * - projets de recrutement : France Travail, enquête Besoins en main-d'œuvre (BMO) 2026, national, additionnés par famille
 *   professionnelle (FAP, FAP_PAR_GROUPE) (S39). La part jugée difficile est informative : le modèle ne s'en sert pas.
 *
 * Les deux nomenclatures ne se recoupent pas exactement : les groupes sont une correspondance de travail entre domaines ROME
 * et familles FAP, pas une nomenclature officielle.
 *
 * REPARTITION_FILIERES est une HYPOTHÈSE DE TRAVAIL, NON SOURCÉE : aucune source ne décrit les métiers qu'occuperaient les
 * emplois de chaque filière. Elle est posée par cet outil d'après la nature de chaque filière, en part des emplois de la
 * filière (somme égale à 1 par filière), et pèse directement sur le résultat.
 */
export interface GroupeMetiers {
  id: string
  libelle: string
  /** Demandeurs d'emploi de catégorie A, 09/2026, France métropolitaine (DARES, S38). */
  demandeursA: number
  /** Demandeurs d'emploi de catégories A, B et C, 09/2026, France métropolitaine (DARES, S38) : base de la réserve de chômeurs. */
  demandeursABC: number
  /** Projets de recrutement de l'enquête BMO 2026 (France Travail, S39). Informatif. */
  projetsBmo: number
  /** Part des projets de recrutement jugés difficiles, % (BMO 2026, S39). Informatif. */
  partDifficilePct: number
}

export const GROUPES_METIERS: readonly GroupeMetiers[] = [
  { id: 'gros-oeuvre', libelle: 'Gros œuvre, travaux publics, engins et structures', demandeursA: 64700, demandeursABC: 126200, projetsBmo: 56324, partDifficilePct: 59.9 },
  { id: 'second-oeuvre', libelle: 'Second œuvre (plomberie, électricité du bâtiment, couverture, isolation, peinture, menuiserie)', demandeursA: 84300, demandeursABC: 150900, projetsBmo: 64041, partDifficilePct: 66.1 },
  { id: 'encadrement-btp', libelle: 'Encadrement de chantier, études et conception du BTP', demandeursA: 41500, demandeursABC: 72100, projetsBmo: 27831, partDifficilePct: 61.2 },
  { id: 'electricite-maintenance', libelle: 'Électricité, électronique, énergie et maintenance industrielle', demandeursA: 37400, demandeursABC: 66600, projetsBmo: 40476, partDifficilePct: 63.2 },
  { id: 'mecanique-metaux', libelle: 'Mécanique, travail des métaux, soudage et chaudronnerie', demandeursA: 43700, demandeursABC: 86000, projetsBmo: 38498, partDifficilePct: 58.6 },
  { id: 'industries-process', libelle: 'Industries de process (chimie, pharmacie, plasturgie, matériaux, métaux)', demandeursA: 6300, demandeursABC: 12800, projetsBmo: 27359, partDifficilePct: 34.3 },
  { id: 'methodes-rd-industrie', libelle: 'Méthodes, qualité, R&D et encadrement industriels', demandeursA: 59600, demandeursABC: 102100, projetsBmo: 27700, partDifficilePct: 45.4 },
  { id: 'conducteurs-routiers', libelle: 'Conducteurs routiers et de transport en commun', demandeursA: 118300, demandeursABC: 209800, projetsBmo: 39068, partDifficilePct: 56.2 },
  { id: 'ferroviaire', libelle: 'Personnel du transport ferroviaire', demandeursA: 3200, demandeursABC: 5600, projetsBmo: 1668, partDifficilePct: 27.7 },
  { id: 'production-agricole', libelle: 'Production agricole', demandeursA: 64600, demandeursABC: 131500, projetsBmo: 205237, partDifficilePct: 39.0 },
  { id: 'espaces-verts-foret', libelle: 'Espaces naturels, espaces verts et forêt', demandeursA: 47700, demandeursABC: 76200, projetsBmo: 33390, partDifficilePct: 43.5 },
  { id: 'agroalimentaire', libelle: 'Industries agroalimentaires', demandeursA: 14900, demandeursABC: 30900, projetsBmo: 35128, partDifficilePct: 45.4 },
  { id: 'bois', libelle: 'Bois (scierie, fabrication)', demandeursA: 10300, demandeursABC: 19500, projetsBmo: 3184, partDifficilePct: 62.1 },
  { id: 'logistique', libelle: 'Logistique, magasinage et manutention', demandeursA: 169500, demandeursABC: 304400, projetsBmo: 70163, partDifficilePct: 29.1 },
  { id: 'navigants-maritimes', libelle: 'Navigants maritimes (marins, pêche)', demandeursA: 2300, demandeursABC: 5500, projetsBmo: 6959, partDifficilePct: 53.4 },
  { id: 'informatique-telecoms', libelle: 'Informatique et télécoms', demandeursA: 73300, demandeursABC: 111100, projetsBmo: 43955, partDifficilePct: 49.9 },
  { id: 'recherche-publique', libelle: 'Recherche publique', demandeursA: 8900, demandeursABC: 13400, projetsBmo: 1050, partDifficilePct: 41.2 },
]

/** Domaines ROME additionnés dans chaque groupe (DARES, S38). */
export const ROME_PAR_GROUPE: Readonly<Record<string, readonly string[]>> = {
  'gros-oeuvre': ['f17', 'f13', 'f14', 'f15'],
  'second-oeuvre': ['f16'],
  'encadrement-btp': ['f11', 'f12'],
  'electricite-maintenance': ['h26', 'h27', 'i13'],
  'mecanique-metaux': ['h29', 'h34'],
  'industries-process': ['h23', 'h28', 'h31', 'h32'],
  'methodes-rd-industrie': ['h12', 'h13', 'h14', 'h15', 'h25'],
  'conducteurs-routiers': ['n41'],
  'ferroviaire': ['n43', 'n44'],
  'production-agricole': ['a11', 'a13', 'a14', 'a15'],
  'espaces-verts-foret': ['a12'],
  'agroalimentaire': ['h21'],
  'bois': ['h22'],
  'logistique': ['n11'],
  'navigants-maritimes': ['n31', 'n32'],
  'informatique-telecoms': ['m18'],
  'recherche-publique': ['k24'],
}

/** Familles professionnelles (FAP) additionnées dans chaque groupe (BMO 2026, S39). */
export const FAP_PAR_GROUPE: Readonly<Record<string, readonly string[]>> = {
  'gros-oeuvre': ['B0X30', 'B0X31', 'B0X32', 'B1X30', 'B1X31', 'B1X33', 'B1X38', 'B5X40'],
  'second-oeuvre': ['B1X34', 'B2X30', 'B2X31', 'B2X32', 'B2X33', 'B2X35', 'B2X36', 'B2X37', 'B2X38'],
  'encadrement-btp': ['B6X70', 'B6X71', 'B6X72', 'B6X73', 'B6X74', 'B7X90', 'B7X91', 'B7X92'],
  'electricite-maintenance': ['C0X30', 'C2X70', 'G0A40', 'G0A41', 'G1X72', 'G1X74', 'G1X77', 'G1X78'],
  'mecanique-metaux': ['D0X30', 'D0X31', 'D0X33', 'D1X30', 'D1X32', 'D1X33', 'D2X30', 'D2X31', 'D2X32', 'D6X70', 'D6X80'],
  'industries-process': ['E0X30', 'E1X21', 'E1X30', 'E1X41', 'E2X20', 'E2X40', 'E5X70', 'E5X80'],
  'methodes-rd-industrie': ['H0X90', 'H0X91', 'H0X92', 'H1X90', 'H1X91', 'H1X93', 'N0X70', 'N1X90'],
  'conducteurs-routiers': ['J3X41', 'J3X43'],
  'ferroviaire': ['J3X44'],
  'production-agricole': ['A0X40', 'A0X41', 'A0X43', 'A1X40', 'A1X42', 'A2X70'],
  'espaces-verts-foret': ['A0X42', 'A1X41'],
  'agroalimentaire': ['E3X20', 'E3X40'],
  'bois': ['F1X31'],
  'logistique': ['J0X30', 'J0X31', 'J0X32', 'J0X33', 'J0X34', 'J1X80'],
  'navigants-maritimes': ['A3X40', 'A3X41', 'A3X90'],
  'informatique-telecoms': ['M1X80', 'M1X81', 'M2X90', 'M2X91', 'M2X92', 'M2X93'],
  'recherche-publique': ['N1X91'],
}

/**
 * Hypothèse de travail, non sourcée : répartition des emplois de chaque filière (identifiants de src/data/filieres.ts)
 * entre groupes de métiers, en part de l'emploi de la filière.
 */
export const REPARTITION_FILIERES: Readonly<Record<string, Readonly<Record<string, number>>>> = {
  btp: { 'gros-oeuvre': 0.35, 'second-oeuvre': 0.45, 'encadrement-btp': 0.12, 'electricite-maintenance': 0.08 },
  auto: { 'mecanique-metaux': 0.3, 'industries-process': 0.2, 'electricite-maintenance': 0.2, 'methodes-rd-industrie': 0.2, 'logistique': 0.1 },
  energie: { 'electricite-maintenance': 0.35, 'second-oeuvre': 0.2, 'gros-oeuvre': 0.2, 'encadrement-btp': 0.1, 'methodes-rd-industrie': 0.05, 'mecanique-metaux': 0.1 },
  rail: { 'gros-oeuvre': 0.35, 'conducteurs-routiers': 0.15, 'ferroviaire': 0.1, 'electricite-maintenance': 0.15, 'mecanique-metaux': 0.1, 'encadrement-btp': 0.15 },
  eau: { 'gros-oeuvre': 0.45, 'second-oeuvre': 0.1, 'electricite-maintenance': 0.15, 'encadrement-btp': 0.15, 'espaces-verts-foret': 0.15 },
  industrie: { 'industries-process': 0.3, 'mecanique-metaux': 0.25, 'electricite-maintenance': 0.15, 'methodes-rd-industrie': 0.2, 'logistique': 0.1 },
  agri: { 'production-agricole': 0.55, 'espaces-verts-foret': 0.1, 'agroalimentaire': 0.15, 'bois': 0.1, 'logistique': 0.1 },
  mer: { 'mecanique-metaux': 0.35, 'electricite-maintenance': 0.25, 'navigants-maritimes': 0.2, 'gros-oeuvre': 0.1, 'methodes-rd-industrie': 0.1 },
  numerique: { 'informatique-telecoms': 0.6, 'second-oeuvre': 0.3, 'electricite-maintenance': 0.1 },
  spatial: { 'recherche-publique': 0.5, 'mecanique-metaux': 0.2, 'electricite-maintenance': 0.15, 'methodes-rd-industrie': 0.15 },
}
