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
      'Chiffre repris d’un document officiel : programme (S1 à S6), Banque de France (S7, S13, S18), BCE (S8, S9), Insee (S10 à S12) ou projet de loi de finances 2027 (S14) ; vérifié le 08/11/2026 (S1 à S9) et le 09/11/2026 (S10 à S14, S18). Les études S15 à S17 servent de repères pour l’effet durable des investissements, et le bilan espagnol S19 pour la part des prêts empruntée et le rythme des investissements, sans fixer leur valeur. Les sources S20 à S29 (CRE, TotalEnergies, RTE, EDF, AFP, Enedis, Banque de France, ABC Bourse, Investing.com) documentent l’électricité à prix régulé et le rachat d’Engie ; les chiffres de marché d’Engie (S28, S29) sont des sources secondaires.',
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

export type SourceId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11' | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18' | 'S19' | 'S20' | 'S21' | 'S22' | 'S23' | 'S24' | 'S25' | 'S26' | 'S27' | 'S28' | 'S29'

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
  S10: {
    id: 'S10',
    titre: 'Insee Première n° 2105, comptes nationaux annuels 2025',
    date: '29/05/2026',
    url: 'https://www.insee.fr/fr/statistiques/8996855',
    precision: '« Le PIB augmente de 0,8 % en 2025 en volume et atteint 2 991,1 milliards d’euros. » Déflateur du PIB 2025 : 1,1 %.',
  },
  S11: {
    id: 'S11',
    titre: 'Insee Première n° 2106, comptes de la Nation 2025 : finances publiques',
    date: '29/05/2026',
    url: 'https://www.insee.fr/fr/statistiques/8997691',
    precision: 'Recettes publiques 1 561,7 Md€ (52,2 % du PIB), dépenses publiques 1 714,2 Md€ (57,3 %), déficit 152,5 Md€ (5,1 %), prélèvements obligatoires 43,6 %, dette 3 460,5 Md€ (115,7 %).',
  },
  S12: {
    id: 'S12',
    titre: 'Insee, note de conjoncture « Vigilance orange sur la croissance »',
    date: '10/09/2026',
    url: 'https://www.insee.fr/fr/statistiques/9050743?sommaire=9050757',
    precision: 'Croissance du PIB prévue à +0,4 % en 2026 ; inflation à 2,9 % sur un an en fin d’année. L’Insee a publié depuis (30/10/2026) une baisse de 0,1 % du PIB au troisième trimestre 2026 (acquis de croissance 2026 : 0,2 %).',
  },
  S13: {
    id: 'S13',
    titre: 'Banque de France, projections macroéconomiques intermédiaires',
    date: '15/09/2026',
    url: 'https://www.banque-france.fr/fr/publications-et-statistiques/publications/projections-macroeconomiques-intermediaires-septembre-2026',
    precision: 'PIB en volume : +0,4 % (2026), +0,9 % (2027), +1,2 % (2028). Déflateur du PIB : 1,4 %, 1,5 %, 1,5 %. Inflation (IPCH) : 2,3 %, 1,9 %, 1,6 %, avec une baisse du prix du gaz supposée à partir de mi-2027.',
  },
  S14: {
    id: 'S14',
    titre: 'Rapport économique, social et financier 2027 (projet de loi de finances 2027), direction générale du Trésor',
    date: '06/10/2026',
    url: 'https://www.tresor.economie.gouv.fr/Articles/2026/10/06/le-rapport-economique-social-et-financier-resf-2027-est-publie',
    precision: 'Hypothèses du gouvernement : PIB en volume +0,5 % (2026) et +1,0 % (2027) ; déflateur 1,5 % et 1,7 % ; PIB nominal 3 051 et 3 135 Md€ ; solde public −5,4 % et −5,0 % du PIB ; dette 119,3 % et 121,7 % du PIB. Le Haut Conseil des finances publiques juge la prévision 2026 « plausible » et celle de 2027 « optimiste » (avis n° 2026-5 du 25/09/2026).',
  },
  S15: {
    id: 'S15',
    titre: 'FMI, blog « Now Is a Good Time to Invest in Infrastructure » (A. Abiad, D. Furceri, P. Topalova), tiré du chapitre 3 des Perspectives de l’économie mondiale d’octobre 2014',
    date: '30/09/2014',
    url: 'https://www.imf.org/en/blogs/articles/2014/09/30/now-is-a-good-time-to-invest-in-infrastructure',
    precision: 'Économies avancées : une hausse de l’investissement public de 1 point de PIB augmente le PIB d’environ 0,4 % la même année et de 1,5 % quatre ans plus tard.',
  },
  S16: {
    id: 'S16',
    titre: 'P. Bom et J. Ligthart, « What have we learned from three decades of research on the productivity of public capital? », Journal of Economic Surveys, 28(5), p. 889-916',
    date: '2014',
    url: 'https://doi.org/10.1111/joes.12037',
    precision: 'Méta-analyse de 578 estimations (68 études) : élasticité de la production au capital public de l’État central de 0,083 à court terme et 0,122 à long terme ; moyenne de 0,106.',
  },
  S17: {
    id: 'S17',
    titre: 'J. Pisani-Ferry et S. Mahfouz, « Les incidences économiques de l’action pour le climat », présentation au Conseil d’orientation des retraites',
    date: '21/12/2023',
    url: 'https://www.cor-retraites.fr/sites/default/files/2023-12/2.%20Pisani%20Ferry%20Mahfouz%20COR_0.pdf',
    precision: 'Les investissements de transition remplacent en partie des équipements existants sans accroître les capacités de production (p. 7) ; la productivité pourrait ralentir d’environ un quart de point par an vers 2030 (p. 10).',
  },
  S18: {
    id: 'S18',
    titre: 'J. Montornès et A. Bourgeois, « Made in France and Reshoring in Multi-Regional Input-Output Tables », Banque de France, document de travail n° 992',
    date: '11/06/2025',
    url: 'https://www.banque-france.fr/en/publications-and-statistics/publications/made-france-and-reshoring-multi-regional-input-output-tables',
    precision: 'Le « made in France », part de la valeur ajoutée française dans la demande intérieure finale, est passé de 89 % en 1965 à 78 % en 2019. La part étrangère (100 − part française) est donc de 22 % en 2019 et de 11 % en 1965.',
  },
  S19: {
    id: 'S19',
    titre: 'M. Á. González Simón (coord.), B. Rodríguez Martínez et G. López Molina, « El impacto de los fondos Next Generation en la economía española », Funcas',
    date: 'avril 2026',
    url: 'https://www.funcas.es/wp-content/uploads/2026/04/Libro_Next-Generation.pdf',
    precision: 'Bilan du plan de relance espagnol fin 2025 : 71 366 M€ reçus, dont 80 % engagés et 55 % dépensés (p. 9) ; 87 % des réformes réalisées contre 35 % des investissements, en jalons et objectifs (p. 23) ; enveloppe de prêts européens ramenée de 83 200 M€ à 22 700 M€, plus de 70 % abandonnés, et 35 mesures jugées inatteignables faute de demande (p. 69) ; ligne 1 du plan de décarbonation de l’industrie : 501,7 M€ de subventions accordées contre 6,9 M€ de prêts (p. 149).',
  },
  S20: {
    id: 'S20',
    titre: 'Commission de régulation de l’énergie (CRE), communiqué de presse sur les coûts complets du nucléaire existant',
    date: '30/09/2025',
    url: 'https://www.cre.fr/fileadmin/Documents/Communiques_de_presse/2025/250930_CP_CRE_Couts_complets_nucleaire.pdf',
    precision: 'Coût complet du nucléaire existant : 61,5 €/MWh courants en 2026-2028 et 68,4 €/MWh en 2029-2031. Il porte sur le seul nucléaire ; le coût moyen de l’ensemble du parc n’est pas publié.',
  },
  S21: {
    id: 'S21',
    titre: 'TotalEnergies, « Point Marché Hebdo »',
    date: '20/10/2026',
    url: 'https://www.totalenergies.fr/fileadmin/Digital/Entreprises/Flash_info_hebdo/261020-flash-info-hebdo.pdf',
    precision: 'Prix à terme de l’électricité, base France, au 19/10/2026 : 109,81 €/MWh pour 2027, 67,98 €/MWh pour 2028 et 61,12 €/MWh pour 2029.',
  },
  S22: {
    id: 'S22',
    titre: 'RTE, Bilan électrique 2025, principaux résultats',
    date: 'février 2026',
    url: 'https://assets.rte-france.com/prod/public/2026-02/Bilan-electrique-2025-principaux-resultats.pdf',
    precision: 'Consommation d’électricité en France en 2025 : 451 TWh.',
  },
  S23: {
    id: 'S23',
    titre: 'RTE, Bilan électrique 2025, premières tendances',
    date: 'janvier 2026',
    url: 'https://assets.rte-france.com/analyse-et-donnees/2026-01/2026-01-02-bilan-electrique-2025-premieres-tendances.pdf',
    precision: 'Solde exportateur de la France en 2025 : environ 92 TWh.',
  },
  S24: {
    id: 'S24',
    titre: 'EDF, communiqué sur l’approbation du dividende par l’assemblée générale',
    date: 'juin 2026',
    url: 'https://www.edf.fr/sites/groupe/files/epresspack/13769/CP-EDF-Approbation-du-dividende-par-lAG-06.2026-1.pdf',
    precision: 'Dividende de 1 Md€ versé à l’État, actionnaire d’EDF.',
  },
  S25: {
    id: 'S25',
    titre: 'AFP (Connaissance des énergies), « EDF annonce ses résultats de 2025 et un ajustement concernant Hinkley Point C »',
    date: 'février 2026',
    url: 'https://www.connaissancedesenergies.org/afp/edf-annonces-ses-resultats-de-2025-et-un-ajustement-concernant-hinkley-point-c-260220',
    precision: 'Résultat net d’EDF en 2025 : 8,4 Md€. Avec le dividende de 1 Md€ (S24), le taux de distribution est d’environ 12 %.',
  },
  S26: {
    id: 'S26',
    titre: 'Enedis, bilan électrique 2025',
    date: '2025',
    url: 'https://www.enedis.fr/media/5085/download',
    precision: 'Consommation du segment résidentiel : 144,2 TWh, soit environ 32 % de 451 TWh (S22). Libellé exact du segment à confirmer dans le document.',
  },
  S27: {
    id: 'S27',
    titre: 'Banque de France, Bulletin n° 253/4, « Le bouclier tarifaire »',
    date: 'juillet 2024',
    url: 'https://banque-france.fr/system/files/2024-07/BDF253_4_Bouclier_tarifaire_web.pdf',
    precision: 'Simulation avec le modèle FR-BDF de la Banque de France de l’effet du bouclier tarifaire sur l’économie : elle sert de repère à un effet sur le PIB égal à 0,14 fois la baisse de la facture d’électricité ; ce n’est pas une mesure.',
  },
  S28: {
    id: 'S28',
    titre: 'ABC Bourse, « Engie lance une augmentation de capital de 3 milliards d’euros sans le soutien de l’État »',
    date: 'février 2026',
    url: 'https://www.abcbourse.com/marches/engie-lance-une-augmentation-de-capital-de-3-milliards-d-euros-sans-le-soutien-d_690518',
    precision: 'Source de marché secondaire : augmentation de capital de 3 Md€ sans l’État ; part de l’État de 22,7 % après l’opération.',
  },
  S29: {
    id: 'S29',
    titre: 'Investing.com, fiche Engie (GDF Suez)',
    date: '06/08/2026',
    url: 'https://fr.investing.com/equities/gdf-suez',
    precision: 'Source de marché secondaire : capitalisation d’environ 64,35 Md€ au 06/08/2026 ; la fourchette retenue est de 61 à 64 Md€.',
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
