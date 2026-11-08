# Simulateur de chiffrage de l’Avenir en Commun 2027

Simulateur de chiffrage du programme **L’Avenir en Commun 2027 de La France insoumise**. Outil pédagogique pour explorer un chiffrage budgétaire (dépenses, recettes, investissements productifs et leviers monétaires) : il calcule la variation du solde des administrations publiques par rapport à une trajectoire sans réforme, avec des hypothèses explicites, des intervalles Monte-Carlo et une trajectoire 2026-2032. Interface entièrement en français.

> **Avertissement.** Simulateur indépendant, non affilié à La France insoumise ni à aucun parti. Outil pédagogique, pas une prévision. Les chiffres du cadrage An 1, des livrets BTP et automobile, du pôle public bancaire et de la CADES sont repris de documents officiels (sources S1 à S9, vérifiées le 08/11/2026) ; les autres montants sont des hypothèses non sourcées, estimées avec un assistant IA. Aucun résultat n'est écrit en dur : tout est calculé par le moteur.

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

Chiffres officiels vérifiés le 08/11/2026 (S1 à S6 sur melenchon2027.fr, S7 sur banque-france.fr, S8 et S9 sur ecb.europa.eu) :

- **S1** : « Comment nous allons remettre de l’ordre dans les comptes publics », 14/10/2026 — https://melenchon2027.fr/wp-content/uploads/2026/10/Comment-nous-allons-remettre-de-l-ordre-dans-les-comptes-publics.pdf
- **S2** : Plan d’investissement productif BTP/logement, 28/09/2026 — https://melenchon2027.fr/wp-content/uploads/2026/09/M-27-PLAN-BTP-LOGEMENT.pdf
- **S3** : Plan d’investissement productif automobile, 14/10/2026 — https://melenchon2027.fr/wp-content/uploads/2026/10/PLAN-AUTO_Vf_ST.pdf
- **S4** : « Pour un pôle public bancaire au service des besoins », 27/10/2026 — https://melenchon2027.fr/wp-content/uploads/2026/10/DP-POLE-PUBLIC-BANCAIRE_ST.pdf
- **S5** : Plan santé, 02/11/2026 — https://melenchon2027.fr/wp-content/uploads/2026/11/plan_SANTE_lowres.pdf
- **S6** : programme L’Avenir en commun, chapitre « Une économie au service des besoins », partie 3 — https://melenchon2027.fr/programme/livre/une-economie-au-service-des-besoins/chapitre3
- **S7** (complémentaire) : Banque de France, « Précisions sur le programme de détention de la dette publique par la Banque de France », communiqué du 12/09/2026 — https://www.banque-france.fr/fr/communiques-de-presse/precisions-sur-le-programme-de-detention-de-la-dette-publique-par-la-banque-de-france
- **S8** : BCE, « Asset purchase programmes », tableau « Breakdown of debt securities under the PSPP » (colonne « Cumulative net purchases as of end October 2026 », ligne France : 359,487 Md€), données à fin octobre 2026, mises à jour le 03/11/2026 — https://www.ecb.europa.eu/mopo/implement/app/html/index.en.html ; historique : https://www.ecb.europa.eu/mopo/pdf/PSPP_breakdown_history.csv
- **S9** : BCE, « Pandemic emergency purchase programme (PEPP) », tableau « Monthly breakdown of public sector securities under the PEPP » (colonne « Cumulative net purchases as at end-October 26 », ligne France : 237,484 Md€), données à fin octobre 2026, mises à jour le 03/11/2026 — https://www.ecb.europa.eu/mopo/implement/pepp/html/index.en.html ; historique : https://www.ecb.europa.eu/mopo/pdf/PEPP_public_sector_securities_breakdown_history.csv

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
- **Trajectoire 2026-2032** : PIB à croissance nominale constante, déficit tendanciel constant, effet du programme interpolé entre l'An 1 et l'année pleine (pas d'effet boule de neige des intérêts).
- **Corrections par rapport au modèle d'origine** : double compte de la bonification du pôle public bancaire supprimé, CADES exclue du solde consolidé (option), coûts évités comptés pour une part seulement, effet récessif des prélèvements ajouté, trajectoires arbitraires remplacées. Leur impact chiffré sur le scénario actif est calculé dans l'onglet « Méthodologie et sources », qui détaille aussi les équations, toutes les hypothèses, les corrections issues de la vérification des sources et les limites.
