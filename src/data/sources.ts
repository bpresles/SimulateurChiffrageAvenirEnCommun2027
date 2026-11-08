/** Statuts de fiabilité et registre des sources officielles. Aucune logique ici. */
export type StatutFiabilite =
  | 'officiel'
  | 'estimation-externe'
  | 'hypothese-non-sourcee'
  | 'hypothese-modele'

export interface InfoStatut {
  label: string
  description: string
}

export const STATUTS: Record<StatutFiabilite, InfoStatut> = {
  officiel: {
    label: 'Source officielle',
    description:
      'Chiffre repris d’un document officiel : programme (S1 à S6), Banque de France (S7) ou BCE (S8, S9) ; vérifié le 08/11/2026.',
  },
  'estimation-externe': {
    label: 'Estimation externe citée',
    description:
      'Fourchette attribuée à des instituts, citée par un assistant IA ; elle ne figure pas sur le site du programme et n’a pas été vérifiée.',
  },
  'hypothese-non-sourcee': {
    label: 'Hypothèse non sourcée',
    description:
      'Valeur estimée avec un assistant IA, sans source vérifiable : 8 filières, retours sectoriels, emplois hors livrets, montants des leviers (hors CADES), dépenses et recettes d’année pleine.',
  },
  'hypothese-modele': {
    label: 'Hypothèse de modélisation',
    description: 'Paramètre ajouté ou fixé par cet outil pour corriger ou compléter le modèle d’origine.',
  },
}

export type SourceId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9'

export interface Source {
  id: SourceId
  titre: string
  date: string
  url: string
  /** Tableau cité, définition et réserves, si pertinent. */
  precision?: string
  /** Fichier CSV d'historique, si pertinent. */
  urlHistorique?: string
}

/** Date de vérification des chiffres sur le site du programme. */
export const DATE_VERIFICATION = '08/11/2026'

export const SOURCES: Record<SourceId, Source> = {
  S1: {
    id: 'S1',
    titre: 'Comment nous allons remettre de l’ordre dans les comptes publics',
    date: '14/10/2026',
    url: 'https://melenchon2027.fr/wp-content/uploads/2026/10/Comment-nous-allons-remettre-de-l-ordre-dans-les-comptes-publics.pdf',
  },
  S2: {
    id: 'S2',
    titre: 'Plan d’investissement productif BTP/logement',
    date: '28/09/2026',
    url: 'https://melenchon2027.fr/wp-content/uploads/2026/09/M-27-PLAN-BTP-LOGEMENT.pdf',
  },
  S3: {
    id: 'S3',
    titre: 'Plan d’investissement productif automobile',
    date: '14/10/2026',
    url: 'https://melenchon2027.fr/wp-content/uploads/2026/10/PLAN-AUTO_Vf_ST.pdf',
  },
  S4: {
    id: 'S4',
    titre: 'Pour un pôle public bancaire au service des besoins',
    date: '27/10/2026',
    url: 'https://melenchon2027.fr/wp-content/uploads/2026/10/DP-POLE-PUBLIC-BANCAIRE_ST.pdf',
  },
  S5: {
    id: 'S5',
    titre: 'Plan santé',
    date: '02/11/2026',
    url: 'https://melenchon2027.fr/wp-content/uploads/2026/11/plan_SANTE_lowres.pdf',
  },
  S6: {
    id: 'S6',
    titre: 'L’Avenir en commun, chapitre « Une économie au service des besoins », partie 3',
    date: '08/11/2026 (consultation)',
    url: 'https://melenchon2027.fr/programme/livre/une-economie-au-service-des-besoins/chapitre3',
  },
  S7: {
    id: 'S7',
    titre: 'Banque de France, « Précisions sur le programme de détention de la dette publique par la Banque de France » (communiqué)',
    date: '12/09/2026',
    url: 'https://www.banque-france.fr/fr/communiques-de-presse/precisions-sur-le-programme-de-detention-de-la-dette-publique-par-la-banque-de-france',
  },
  S8: {
    id: 'S8',
    titre: 'BCE, « Asset purchase programmes » : tableau « Breakdown of debt securities under the PSPP »',
    date: 'données à fin octobre 2026, mises à jour le 03/11/2026',
    url: 'https://www.ecb.europa.eu/mopo/implement/app/html/index.en.html',
    precision: 'Colonne « Cumulative net purchases as of end October 2026 », ligne France : 359,487 Md€ (M€ dans le tableau). Définition BCE : différence entre le coût d’acquisition de tous les achats et les montants nominaux remboursés. Chiffres provisoires, susceptibles de révision.',
    urlHistorique: 'https://www.ecb.europa.eu/mopo/pdf/PSPP_breakdown_history.csv',
  },
  S9: {
    id: 'S9',
    titre: 'BCE, « Pandemic emergency purchase programme (PEPP) » : tableau « Monthly breakdown of public sector securities under the PEPP »',
    date: 'données à fin octobre 2026, mises à jour le 03/11/2026',
    url: 'https://www.ecb.europa.eu/mopo/implement/pepp/html/index.en.html',
    precision: 'Colonne « Cumulative net purchases as at end-October 26 », ligne France : 237,484 Md€ (M€ dans le tableau). Même définition que S8. Chiffres provisoires, susceptibles de révision.',
    urlHistorique: 'https://www.ecb.europa.eu/mopo/pdf/PEPP_public_sector_securities_breakdown_history.csv',
  },
}

export const PLANS_THEMATIQUES_URL = 'https://melenchon2027.fr/programme/plans-thematiques/'

export interface Hypothese {
  libelle: string
  valeur: number
  unite: string
  statut: StatutFiabilite
  source: string
  /** Vrai si la valeur est dérivée d'autres hypothèses. */
  calcule?: boolean
  /** Références du registre des sources, si la valeur est sourcée. */
  refs?: SourceId[]
  note: string
}
