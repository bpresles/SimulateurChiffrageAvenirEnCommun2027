/** Statuts de fiabilité des données et hypothèses. Aucune logique ici. */
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
    label: 'Cadrage officiel',
    description:
      'Chiffres du cadrage budgétaire et des livrets publiés, tels que transcrits par un assistant IA. La transcription n’a pas été vérifiée sur la source.',
  },
  'estimation-externe': {
    label: 'Estimation externe citée',
    description:
      'Fourchettes attribuées à des instituts, citées par un assistant IA et non vérifiées.',
  },
  'hypothese-non-sourcee': {
    label: 'Hypothèse non sourcée',
    description:
      'Valeur estimée avec un assistant IA, sans source vérifiable : filières estimées, retours sectoriels, emplois, montants des leviers, dépenses et recettes d’année pleine.',
  },
  'hypothese-modele': {
    label: 'Hypothèse de modélisation',
    description: 'Paramètre ajouté ou fixé par cet outil pour corriger ou compléter le modèle d’origine.',
  },
}

export interface Hypothese {
  libelle: string
  valeur: number
  unite: string
  statut: StatutFiabilite
  source: string
  note: string
}
