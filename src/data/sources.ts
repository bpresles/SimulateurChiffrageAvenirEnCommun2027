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
      'Chiffre repris d’un document officiel : programme (S1 à S6), Banque de France (S7, S13, S18), BCE (S8, S9), Insee (S10 à S12) ou projet de loi de finances 2027 (S14) ; vérifié le 08/11/2026 (S1 à S9) et le 09/11/2026 (S10 à S14, S18). Les études S15 à S17 servent de repères pour l’effet durable des investissements, et le bilan espagnol S19 pour la part des prêts empruntée et le rythme des investissements, sans fixer leur valeur. Les comptes nationaux de l’Insee (S31), son tableau « made in France » (S37), les études et rapports S32 à S35 et la note de FIPECO (S36) documentent le rendement du capital (2 % par an par défaut) et le report de la demande vers des produits français (0,45 par défaut) : ces deux valeurs sont dérivées par cet outil à partir de ces sources, ce sont des hypothèses de modélisation. Les sources S20 à S30 (CRE, TotalEnergies, RTE, EDF, AFP, Enedis, Banque de France, ABC Bourse, Investing.com) documentent l’électricité à prix régulé et le rachat d’Engie ; les chiffres de marché d’Engie (S28, S29) sont des sources secondaires. Les demandeurs d’emploi (S38) et les projets de recrutement (S39) sont des données brutes officielles ; les sources S40 à S50 (France Travail, Insee, OCDE, Banco de España, Monras et al., Funcas, Sénat) documentent la contrainte de main-d’œuvre, l’immigration de travail et la régularisation, dont les paramètres sont des hypothèses de modélisation.',
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

export type SourceId = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11' | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18' | 'S19' | 'S20' | 'S21' | 'S22' | 'S23' | 'S24' | 'S25' | 'S26' | 'S27' | 'S28' | 'S29' | 'S30' | 'S31' | 'S32' | 'S33' | 'S34' | 'S35' | 'S36' | 'S37' | 'S38' | 'S39' | 'S40' | 'S41' | 'S42' | 'S43' | 'S44' | 'S45' | 'S46' | 'S47' | 'S48' | 'S49' | 'S50'

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
    precision: 'Coût complet du nucléaire historique : 60,3 €2026/MWh (61,5 €courants/MWh) en 2026-2028 et 63,4 €2026/MWh (68,4 €courants/MWh) en 2029-2031. Il comprend des « charges de capital tenant compte des amortissements de la valeur nette comptable du parc, de la rémunération des actifs au CMPC » : en 2026-2028, rémunération du capital de 13,8 €2026/MWh et amortissements de 11,7 €2026/MWh. Trajectoire de production retenue : 362 TWh par an en moyenne sur 2026-2028. Il porte sur le seul nucléaire ; le coût moyen de l’ensemble du parc n’est pas publié.',
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
  S30: {
    id: 'S30',
    titre: 'CRE, délibération n° 2025-265 portant avis sur le projet d’arrêté relatif à la taxe sur l’utilisation de combustible nucléaire (versement nucléaire universel, VNU)',
    date: '02/12/2025',
    url: 'https://www.cre.fr/fileadmin/Documents/Deliberations/2025/251202_2025-265_Avis_arrete_tarifs_facteur_conversion_nucleaire.pdf',
    precision: 'Depuis le 01/01/2026, 50 % des revenus du parc nucléaire historique d’EDF au-delà du seuil de taxation et 90 % au-delà du seuil d’écrêtement sont taxés puis reversés à tous les consommateurs (minoration des factures). Le projet d’arrêté soumis à la CRE (et non l’arrêté définitif) fixe le tarif de taxation à 78 €/MWh et le tarif d’écrêtement à 110 €/MWh ; la loi impose le coût complet plus 5 à 25 €/MWh pour la taxation et plus 35 à 55 €/MWh pour l’écrêtement. Objectif de la loi : « permettre à EDF de dégager les moyens de financer ses investissements futurs, notamment dans le nouveau nucléaire ».',
  },
  S31: {
    id: 'S31',
    titre: 'Insee, comptes nationaux annuels, base 2020, édition 2025',
    date: '2025',
    url: 'https://www.insee.fr/fr/statistiques/fichier/8574689/T_7101.xlsx',
    precision:
      'Tableaux 7.101 (compte des sociétés non financières), 8.202 et 8.204 (patrimoine), 1.101 (PIB), 6.401 à 6.460 (capital fixe par branche) et 6.201 (valeur ajoutée par branche). Rendement net du capital des sociétés non financières en 2024 : excédent net d’exploitation ÷ actifs fixes nets = 199,6 ÷ 3 083,8 Md€ = 6,5 % (5,5 % en 2022, 7,0 % en 2023). Capital public net : actifs fixes nets des administrations publiques de 1 732,2 Md€ en 2024, pour un PIB de 2 919,9 Md€ (59,3 %). Industrie manufacturière (branches C10 à C33) en 2024 : capital fixe brut de 724,6 Md€, valeur ajoutée de 279,3 Md€ (rapport de 0,385), capital net de 365,2 Md€. 1 point de PIB 2024 = 29,2 Md€. Autres tableaux : https://www.insee.fr/fr/statistiques/fichier/8574720/T_8202.xlsx ; https://www.insee.fr/fr/statistiques/fichier/8574720/T_8204.xlsx ; https://www.insee.fr/fr/statistiques/fichier/8574657/T_1101_1103.xlsx ; https://www.insee.fr/fr/statistiques/fichier/8574685/T_6401_6460.zip ; https://www.insee.fr/fr/statistiques/fichier/8574681/T_6201_6203.xlsx.',
  },
  S32: {
    id: 'S32',
    titre: 'F. Caselli et J. Feyrer, « The Marginal Product of Capital », Quarterly Journal of Economics 122(2) (NBER, document de travail n° 11551)',
    date: '2007',
    url: 'https://www.nber.org/papers/w11551',
    precision:
      'Tableau II. Productivité marginale du capital des pays riches de 7,5 à 12,6 % (brute) selon les corrections, avec une dépréciation de 6 %, soit environ 1,5 à 6,6 % nette. Sert de repère au rendement net du capital privé de 6,5 % (S31).',
  },
  S33: {
    id: 'S33',
    titre: 'V. Ramey, « The Macroeconomic Consequences of Infrastructure Investment », NBER, document de travail n° 27625',
    date: '2020',
    url: 'https://www.nber.org/system/files/working_papers/w27625/w27625.pdf',
    precision:
      'Pages 39 et 41. Élasticité de la production au capital public de 0,065 à 0,12 selon les études ; le bas de la fourchette (0,065) est retenu pour le rail.',
  },
  S34: {
    id: 'S34',
    titre: 'P. Pfeiffer, J. Varga et J. in ’t Veld, « Quantifying Spillovers of Next Generation EU Investment », European Economy Discussion Paper 144, Commission européenne',
    date: 'juillet 2021',
    url: 'https://economy-finance.ec.europa.eu/system/files/2021-07/dp144_en.pdf',
    precision:
      'Pages 17 et 18, tableaux 4.1 et 11.1. Modèle QUEST : l’investissement NGEU (environ 4 % du PIB de l’UE) relève le PIB de l’UE de 0,7 % en 2030 et de 0,4 % en 2040 (0,3 et 0,2 si le capital public est peu productif) ; France : +0,4 % en 2030, dont 0,1 point de retombées des autres pays, et +0,2 % en 2040 ; élasticité de 0,12 et dépréciation de 5 %. Ces chiffres incluent l’effet de demande et ne se convertissent pas directement en rendement du capital.',
  },
  S35: {
    id: 'S35',
    titre: 'DG Trésor, « Les enjeux économiques de la transition vers la neutralité carbone », rapport final',
    date: 'janvier 2025',
    url: 'https://www.tresor.economie.gouv.fr/Articles/fe03c69a-9590-4368-b95e-ed761a023f53/files/5e8fa818-5c7d-48f5-aa60-c9ce4057b6b7',
    precision:
      'Pages 4 et 52 à 54. Le modèle Mésange n’a pas de fonction de production ; les investissements de transition sont analysés « sans qu’ils ne servent a priori à augmenter significativement la production ».',
  },
  S36: {
    id: 'S36',
    titre: 'FIPECO (F. Ecalle), « Le patrimoine des administrations publiques à la fin de 2023 »',
    date: '17/09/2024',
    url: 'https://www.fipeco.fr/pdf/PatrimoineAPU2023.pdf',
    precision:
      'Page 3. Consommation de capital fixe des administrations publiques en 2023 : 108 Md€ (d’après l’Insee), soit 6,3 % de 1 701,8 Md€ d’actifs fixes nets.',
  },
  S37: {
    id: 'S37',
    titre: 'Insee, « made in France », tableau T13 (contenu en importations de la demande finale)',
    date: '2015',
    url: 'https://www.insee.fr/fr/statistiques/fichier/4167487/mif_T13.xls',
    precision:
      'Contenu en importations de l’investissement (formation brute de capital fixe, stocks et objets de valeur) : 32,3 % en 2015, contre 24,6 % pour l’ensemble de la demande finale. Repère : la part importée de départ de 22 % (S18) est peut-être basse pour une demande surtout faite d’investissement ; sans effet sur le modèle.',
  },
  S38: {
    id: 'S38',
    titre: 'DARES, demandeurs d’emploi par métier recherché (domaines ROME), données mensuelles brutes',
    date: '09/2026',
    url: 'https://data.dares.travail-emploi.gouv.fr/api/explore/v2.1/catalog/datasets/dares_defm_stock_france_brut_mens/exports/csv',
    precision:
      'Catégories A et ABC, France métropolitaine, stock de 09/2026, additionné par groupe de domaines ROME (src/data/metiers.ts). Repère : 53,4 % des inscrits en catégories ABC le sont depuis moins d’un an (DARES, 09/2026).',
  },
  S39: {
    id: 'S39',
    titre: 'France Travail, enquête Besoins en main-d’œuvre (BMO) 2026',
    date: '2026',
    url: 'https://www.francetravail.org/files/live/sites/peorg/files/documents/Statistiques-et-analyses/Open-data/BMO/Base-open-data-BMO-2026.xlsx',
    precision:
      'Projets de recrutement et part de projets jugés difficiles, national, additionnés par famille professionnelle (FAP). Informatif : le modèle ne s’en sert pas.',
  },
  S40: {
    id: 'S40',
    titre: 'France Travail, principaux indicateurs statistiques, novembre 2025',
    date: '11/2025',
    url: 'https://www.francetravail.org/files/live/sites/peorg/files/documents/Statistiques-et-analyses/_Documentation/PRINCIPAUX_INDICATEURS_STATISTIQUES_Novembre_2025.pdf',
    precision:
      'Taux d’accès à l’emploi des demandeurs d’emploi : 36,5 % dans les 6 mois, dont 12,9 % pour un emploi durable. Repère du curseur sur la part de demandeurs d’emploi mobilisables.',
  },
  S41: {
    id: 'S41',
    titre: 'Insee, Informations rapides n° 192, chômage au deuxième trimestre 2026',
    date: '2026',
    url: 'https://www.insee.fr/fr/statistiques/fichier/version-html/9032359/IR192_Chomage_2T2026.pdf',
    precision:
      'Chômage au sens du Bureau international du travail (BIT). Repère : les chômeurs au sens du BIT représentent 45 % des inscrits en catégories ABC, et 75 % d’entre eux ne sont pas chômeurs de longue durée, soit environ 34 %.',
  },
  S42: {
    id: 'S42',
    titre: 'Insee Références, projections de population active',
    date: '30/06/2022',
    url: 'https://www.insee.fr/fr/statistiques/6453758',
    precision:
      'Variante à +50 000 migrants par an : environ 650 000 actifs supplémentaires en 2040, soit 0,68 à 0,72 actif par migrant net (0,7 retenu).',
  },
  S43: {
    id: 'S43',
    titre: 'Insee Première n° 2108, projections de population 2026',
    date: '2026',
    url: 'https://www.insee.fr/fr/statistiques/9004289',
    precision:
      'Scénario central : solde migratoire de +150 000 personnes par an.',
  },
  S44: {
    id: 'S44',
    titre: 'Insee, enquête Emploi 2025 : activité des immigrés',
    date: '2025',
    url: 'https://www.insee.fr/fr/statistiques/4195420',
    precision:
      'Taux d’emploi des immigrés de 15 à 64 ans : 61,9 % ; 71,9 % pour les personnes sans ascendance migratoire.',
  },
  S45: {
    id: 'S45',
    titre: 'Insee, comptes nationaux : tableau 3.301 (dépenses des administrations publiques par fonction, 2024) et tableau 3.217 (cotisations sociales, 2025)',
    date: '2025',
    url: 'https://www.insee.fr/fr/statistiques/fichier/8574707/T_3301.xlsx',
    precision:
      'Tableau 3.301 : fonctions 01 et 02 de la classification COFOG, 10,94 % de la dépense hors intérêts en 2024. Tableau 3.217 (cotisations sociales effectives, 446,3 Md€ en 2025) : https://www.insee.fr/fr/statistiques/8988821',
  },
  S46: {
    id: 'S46',
    titre: 'OCDE, Perspectives des migrations internationales 2021, chapitre 4 (p. 128 ; tableau 4.1)',
    date: '2021',
    url: 'https://doi.org/10.1787/da2bbd99-fr',
    precision:
      'Méthode centrale : les biens publics purs (défense, intérêts de la dette, fonctionnement des organes exécutifs et législatifs) ne varient pas avec la population.',
  },
  S47: {
    id: 'S47',
    titre: 'Banco de España, rapport annuel 2025, § 4.5 ; P. Cuadrado et A. Regil, Boletín Económico 2025/T2',
    date: '2025',
    url: 'https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/PublicacionesAnuales/InformesAnuales/25/InfAnual_2025.pdf',
    precision:
      'Les immigrés expliquent environ la moitié de la croissance du PIB espagnol de 2022 à 2025 (1,7 point) et 0,5 point de la croissance du PIB par habitant ; l’évaluation « requeriría una visión de equilibrio general ». Décomposition comptable, non causale. Boletín Económico : https://www.bde.es/f/webbe/SES/Secciones/Publicaciones/InformesBoletinesRevistas/BoletinEconomico/25/T2/Fich/be2502-art10.pdf',
  },
  S48: {
    id: 'S48',
    titre: 'J. Monras, J. Vázquez-Grenno et F. Elias, « Understanding the Effects of Legalizing Undocumented Immigrants », version de travail',
    date: '08/10/2019',
    url: 'https://crei.cat/wp-content/uploads/2020/06/4-Underst.pdf',
    precision:
      'Régularisation espagnole de 2005 : 578 375 personnes régularisées (691 655 demandes, 83,6 % acceptées ; note 25, p. 11), population irrégulière estimée à « close to 1 million » (p. 3). Les cotisations ont augmenté de 4 189 € par personne régularisée, « only 55 percent of what we would have anticipated » d’un cotisant moyen.',
  },
  S49: {
    id: 'S49',
    titre: 'Funcas, note de presse sur la régularisation',
    date: '01/2026',
    url: 'https://www.funcas.es/wp-content/uploads/2026/01/NOTAPRENSA-7.pdf',
    precision:
      '840 000 personnes en situation irrégulière en Espagne au 01/01/2025. Le gouvernement espagnol prévoyait 500 000 bénéficiaires de la régularisation de 2026 (presse).',
  },
  S50: {
    id: 'S50',
    titre: 'Sénat, avis budgétaire « Immigration, asile et intégration », projet de loi de finances 2026',
    date: '2025',
    url: 'https://www.senat.fr/rap/a25-145-2/a25-145-2-syn.pdf',
    precision:
      'Population en situation irrégulière en France « estimée à 700 000 par le ministère de l’intérieur ».',
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
