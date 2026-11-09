# Simulateur de chiffrage de l’Avenir en Commun 2027

Simulateur de chiffrage du programme **L’Avenir en Commun 2027 de La France insoumise**. Outil pédagogique pour explorer un chiffrage budgétaire (dépenses, recettes, investissements productifs et leviers monétaires) : il calcule la variation du solde des administrations publiques par rapport à une trajectoire sans réforme, avec des hypothèses explicites, des intervalles Monte-Carlo et une trajectoire 2026-2032. Interface entièrement en français.

> **Avertissement.** Simulateur indépendant, non affilié à La France insoumise ni à aucun parti. Outil pédagogique, pas une prévision. Les chiffres du cadrage An 1, des livrets BTP et automobile, du pôle public bancaire et de la CADES sont repris de documents officiels (sources S1 à S9, vérifiées le 08/11/2026), les données macroéconomiques de l’Insee, de la Banque de France et du PLF 2027 (S10 à S14, vérifiées le 09/11/2026) ; les autres montants sont des hypothèses non sourcées, estimées avec un assistant IA. Aucun résultat n'est écrit en dur : tout est calculé par le moteur.

## Stack

Bun 1.4.4 (gestionnaire de paquets, runtime et lanceur de tests, voir `.bun-version`), Vite 8, React 19, TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`, tokens dans `@theme`), tests `bun:test`, ESLint (flat config, typescript-eslint, react-hooks). Graphiques en composants SVG React (aucune bibliothèque de graphiques), icônes `lucide-react`, polices auto-hébergées (`@fontsource-variable`). Aucun CDN ni appel externe (RGPD).

## Commandes

Bun 1.4.4 ou supérieur est requis (version de référence dans `.bun-version`).

```bash
bun install --frozen-lockfile   # installation
bun run dev                     # serveur de développement
bun run build                   # tsc -b puis vite build (sortie dans dist/)
bun run preview                 # sert le build local
bun test                        # tests du moteur
bun run lint
bun run typecheck
```

## Arborescence

```
src/
  data/        données typées et sourcées, sans logique (sources, budgetAn1, anneePleine,
               filieres, leviers, hypotheses, scenarios)
  model/       fonctions pures sans DOM ni React (simulate, filieres, percentile,
               trajectoire, monteCarlo) et leurs tests
  state/       useSimulationParams (curseurs + URL partageable), useModele (calculs dérivés)
  lib/         format.ts (Intl fr-FR), csv.ts, useLargeurConteneur.ts
  components/  layout, simulateur, charts, filieres, leviers, matrice, methodologie, ui
```

## Sources

Chiffres officiels vérifiés le 08/11/2026 (S1 à S6 sur melenchon2027.fr, S7 sur banque-france.fr, S8 et S9 sur ecb.europa.eu) et le 09/11/2026 (S10 à S12 sur insee.fr, S13 sur banque-france.fr, S14 sur tresor.economie.gouv.fr ; S15 à S17 pour l’effet durable des investissements : S17 justifie sa valeur nulle par défaut, S15 et S16 servent de repères pour tester une valeur positive ; S18 sur banque-france.fr pour la part étrangère de la demande ; S19 sur funcas.es, bilan du plan de relance espagnol, pour la part des prêts empruntée et le rythme des investissements) :

- **S1** : « Comment nous allons remettre de l’ordre dans les comptes publics », 14/10/2026 — https://melenchon2027.fr/wp-content/uploads/2026/10/Comment-nous-allons-remettre-de-l-ordre-dans-les-comptes-publics.pdf
- **S2** : Plan d’investissement productif BTP/logement, 28/09/2026 — https://melenchon2027.fr/wp-content/uploads/2026/09/M-27-PLAN-BTP-LOGEMENT.pdf
- **S3** : Plan d’investissement productif automobile, 14/10/2026 — https://melenchon2027.fr/wp-content/uploads/2026/10/PLAN-AUTO_Vf_ST.pdf
- **S4** : « Pour un pôle public bancaire au service des besoins », 27/10/2026 — https://melenchon2027.fr/wp-content/uploads/2026/10/DP-POLE-PUBLIC-BANCAIRE_ST.pdf
- **S5** : Plan santé, 02/11/2026 — https://melenchon2027.fr/wp-content/uploads/2026/11/plan_SANTE_lowres.pdf
- **S6** : programme L’Avenir en commun, chapitre « Une économie au service des besoins », partie 3 — https://melenchon2027.fr/programme/livre/une-economie-au-service-des-besoins/chapitre3
- **S7** (complémentaire) : Banque de France, « Précisions sur le programme de détention de la dette publique par la Banque de France », communiqué du 12/09/2026 — https://www.banque-france.fr/fr/communiques-de-presse/precisions-sur-le-programme-de-detention-de-la-dette-publique-par-la-banque-de-france
- **S8** : BCE, « Asset purchase programmes », tableau « Breakdown of debt securities under the PSPP » (colonne « Cumulative net purchases as of end October 2026 », ligne France : 359,487 Md€), données à fin octobre 2026, mises à jour le 03/11/2026 — https://www.ecb.europa.eu/mopo/implement/app/html/index.en.html ; historique : https://www.ecb.europa.eu/mopo/pdf/PSPP_breakdown_history.csv
- **S9** : BCE, « Pandemic emergency purchase programme (PEPP) », tableau « Monthly breakdown of public sector securities under the PEPP » (colonne « Cumulative net purchases as at end-October 26 », ligne France : 237,484 Md€), données à fin octobre 2026, mises à jour le 03/11/2026 — https://www.ecb.europa.eu/mopo/implement/pepp/html/index.en.html ; historique : https://www.ecb.europa.eu/mopo/pdf/PEPP_public_sector_securities_breakdown_history.csv
- **S10** : Insee Première n° 2105, comptes nationaux annuels 2025, 29/05/2026 (PIB 2025 : 2 991,1 Md€, +0,8 % en volume) — https://www.insee.fr/fr/statistiques/8996855
- **S11** : Insee Première n° 2106, comptes de la Nation 2025 : finances publiques, 29/05/2026 (recettes publiques 52,2 % du PIB, dépenses 57,3 %, déficit 5,1 %, dette 115,7 %) — https://www.insee.fr/fr/statistiques/8997691
- **S12** : Insee, note de conjoncture « Vigilance orange sur la croissance », 10/09/2026 (croissance 2026 : +0,4 %) — https://www.insee.fr/fr/statistiques/9050743?sommaire=9050757
- **S13** : Banque de France, projections macroéconomiques intermédiaires, 15/09/2026 (PIB en volume +0,4 / +0,9 / +1,2 % en 2026-2028 ; déflateur 1,4 / 1,5 / 1,5 %) — https://www.banque-france.fr/fr/publications-et-statistiques/publications/projections-macroeconomiques-intermediaires-septembre-2026
- **S14** : Rapport économique, social et financier 2027 (PLF 2027), 06/10/2026 (croissance +0,5 % en 2026 et +1,0 % en 2027, déflateur 1,5 % et 1,7 %, PIB nominal 2026 de 3 051 Md€, solde −5,4 % et −5,0 % du PIB, dette 119,3 % et 121,7 %) — https://www.tresor.economie.gouv.fr/Articles/2026/10/06/le-rapport-economique-social-et-financier-resf-2027-est-publie
- **S15** : FMI, blog « Now Is a Good Time to Invest in Infrastructure », 30/09/2014, tiré du chapitre 3 des Perspectives de l’économie mondiale d’octobre 2014 (1 point de PIB d’investissement public : +0,4 % de PIB la même année, +1,5 % à quatre ans, économies avancées) — https://www.imf.org/en/blogs/articles/2014/09/30/now-is-a-good-time-to-invest-in-infrastructure
- **S16** : P. Bom et J. Ligthart, « What have we learned from three decades of research on the productivity of public capital? », Journal of Economic Surveys 28(5), 2014 (élasticité de la production au capital public : 0,083 à court terme, 0,122 à long terme) — https://doi.org/10.1111/joes.12037
- **S17** : J. Pisani-Ferry et S. Mahfouz, « Les incidences économiques de l’action pour le climat », présentation au COR, 21/12/2023 (investissements de transition en partie sans gain de capacité ; productivité ralentie d’environ ¼ de point par an vers 2030) — https://www.cor-retraites.fr/sites/default/files/2023-12/2.%20Pisani%20Ferry%20Mahfouz%20COR_0.pdf
- **S18** : J. Montornès et A. Bourgeois, « Made in France and Reshoring in Multi-Regional Input-Output Tables », Banque de France, document de travail n° 992, 11/06/2025 (part française de la valeur ajoutée dans la demande intérieure finale : 89 % en 1965, 78 % en 2019 ; part étrangère de 11 % et 22 %) — https://www.banque-france.fr/en/publications-and-statistics/publications/made-france-and-reshoring-multi-regional-input-output-tables
- **S19** : M. Á. González Simón (coord.), B. Rodríguez Martínez et G. López Molina, « El impacto de los fondos Next Generation en la economía española », Funcas, avril 2026 (fin 2025 : 87 % des réformes réalisées contre 35 % des investissements ; enveloppe de prêts européens ramenée de 83,2 à 22,7 Md€, 35 mesures abandonnées faute de demande) — https://www.funcas.es/wp-content/uploads/2026/04/Libro_Next-Generation.pdf

Stock de référence du gel BCE : 597,0 Md€ de titres publics français détenus par l’Eurosystème au 31/10/2026 (PSPP + PEPP, en achats nets cumulés : coût d’acquisition moins montants nominaux remboursés ; chiffres provisoires), soit 359,487 + 237,484.

Le registre se trouve dans `src/data/sources.ts` ; chaque ligne ou hypothèse sourcée y renvoie par sa référence.

## Modifier les hypothèses

- Constantes du modèle (montants, taux, trajectoire, Monte-Carlo) : `src/data/hypotheses.ts`. Chacune porte `valeur`, `unite`, `statut`, `source` et `note`.
- Filières (P10/P50/P90, retours, emplois) : `src/data/filieres.ts`. Leviers : `src/data/leviers.ts`. Lignes de budget : `budgetAn1.ts` et `anneePleine.ts`. Préréglages : `scenarios.ts`.
- Le tableau des hypothèses de l'onglet « Méthodologie et sources » et la matrice détaillée se régénèrent depuis ces fichiers. Lancez `bun test` après toute modification : un test de non-régression compare le moteur au modèle d'origine.

Un scénario est partageable par lien : les curseurs et l'onglet actif sont encodés dans la query string.

## Déploiement sur Vercel

1. Pousser le dépôt sur GitHub.
2. Dans Vercel, « Add New Project » puis importer le dépôt.
3. Le preset Vite est détecté automatiquement (commande `bun run build`, sortie `dist`). Aucune configuration manuelle n'est nécessaire.

`vercel.json` ne contient que des en-têtes de sécurité (pas de rewrites : application monopage sans routeur). La CI GitHub (`.github/workflows/ci.yml`) exécute `bun install --frozen-lockfile`, lint, typecheck, tests et build.

## Méthodologie en bref

- **Solde** = recettes − dépenses + retours directs et indirects des filières + coûts évités (part budgétaire) + effet récessif des prélèvements + leviers − frictions. Unités : Md€/an, sans arrondi intermédiaire.
- **Filières** : interpolation linéaire entre P10, P50 et P90 pour un percentile commun.
- **Monte-Carlo** : 5 000 tirages à graine fixe, loi split-normale calée sur P10/P50/P90, corrélation par facteur commun (ρ = 0,5). Il ne porte que sur le volume d'investissement des filières.
- **Trajectoire 2026-2035** (euros courants ; mandat 2027-2032, prolongé de trois ans pour voir la croissance revenir vers la tendance après la montée en charge) : PIB 2025 de l'Insee porté par la croissance réelle (0,4 % en 2026, 0,9 % en 2027 et 1,2 % en 2028 selon la Banque de France, puis 1,2 % par an, réglable) et l'inflation (1,5 %), recettes existantes proportionnelles au PIB (52,2 %), dépenses calées sur un déficit 2026 de 5,4 % puis au rythme du PIB (déficit tendanciel constant par défaut, écart réglable ; la baisse prévue par le PLF 2027 n'est pas reprise), dette fin 2026 de 3 640 Md€ (119,3 % du PIB, hypothèse pessimiste du PLF 2027). Le programme monte en charge entre l'An 1 et l'année pleine, ajoute un surcroît de PIB (effet de demande : investissements × multiplicateur, dépenses courantes, effet récessif ; effet d'offre en option : capital accumulé par les filières × r par an, nul par défaut car une partie des investissements de transition remplace des équipements existants sans accroître les capacités, S17 ; report de la demande vers des produits français en option : la part importée de la demande créée par le programme, 22 % en 2019 selon la Banque de France, S18, baisse avec le capital des filières de biens échangeables, sans descendre sous 11 %, nul par défaut et non cumulé avec l'effet d'offre) qui rapporte 35 centimes de recettes par euro (réglable), et ses prélèvements nouveaux suivent le PIB. Deux réglages portent sur la réalisation de l'investissement, avec des repères espagnols (S19) : part des prêts du pôle public bancaire effectivement empruntée (100 % par défaut ; l'investissement financé par les prêts non empruntés n'a pas lieu) et année pleine de l'investissement des filières (2032 par défaut, deux ans après le reste du programme, réglable de 2030 à 2034). Graphique de la croissance en volume et décomposition annuelle de l'effet. Pas d'effet boule de neige des intérêts ; autres pistes dans `docs/pistes-a-modeliser.md`.
- **Corrections par rapport au modèle d'origine** : double compte de la bonification du pôle public bancaire supprimé, CADES exclue du solde consolidé (option), coûts évités comptés pour une part seulement, effet récessif des prélèvements ajouté, trajectoires arbitraires remplacées. Leur impact chiffré sur le scénario actif est calculé dans l'onglet « Méthodologie et sources », qui détaille aussi les équations, toutes les hypothèses, les corrections issues de la vérification des sources et les limites.
