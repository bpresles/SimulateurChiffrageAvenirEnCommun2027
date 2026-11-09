# Pistes à modéliser

Éléments identifiés le 09/11/2026 lors de la refonte de la trajectoire 2026-2032 (horizon porté à 2035 le même jour) (croissance endogène, croissance tendancielle de la Banque de France, effet d’offre en option, dette du PLF 2027). Ils ne sont pas pris en compte, ou seulement en partie, dans le simulateur. Chaque piste précise ce qui manque, son sens probable sur le solde et les précautions à prendre. Les références S1 à S50 renvoient à `src/data/sources.ts`. Les chiffres cités correspondent au préréglage par défaut (« Programme complet – hypothèses centrales »), avec les valeurs par défaut de l’effet durable des investissements (r = 2 % par an) et du report de la demande vers des produits français (α = 0,45) et ceux du module main-d’œuvre (k = 25 %, φ = 100 %, régularisation de 410 000 personnes), sauf mention contraire.

Légende : **↑** améliore le solde, **↓** le dégrade, **?** sens incertain.

## 1. Charge d’intérêts (effet « boule de neige ») — ?

- **Manque** : la dette évolue par `dette_t = dette_{t−1} − solde_t`, mais le solde ne dépend pas du niveau de la dette. Une dette plus basse (programme) ou plus haute (tendanciel) ne change pas les intérêts payés.
- **Effet** : creuserait l’écart entre les deux trajectoires. La dette 2032 passe de 132,3 % du PIB (tendanciel) à 118,3 % (programme, rachat d’Engie compris) : les intérêts évités sur cet écart amélioreraient encore le solde du programme. À l’inverse, une hausse des taux (réaction des marchés, levier BCE contesté) le dégraderait.
- **À faire** : séparer le solde primaire et la charge d’intérêts ; taux apparent sur la dette (sourcé : PLF 2027, Agence France Trésor) ; option de prime de risque réglable.
- **Attention** : le levier « gel BCE » compte déjà des intérêts économisés sur le stock détenu par l’Eurosystème (voir § 11). Ne pas les compter deux fois.

## 2. Chômage et stabilisateurs automatiques — ↑

- **Manque** : le surcroît d’activité rapporte θ = 35 % de recettes, mais ne réduit pas les dépenses liées au chômage (allocations, minima sociaux).
- **Effet** : le côté dépenses des stabilisateurs améliorerait le solde quand le PIB augmente.
- **Attention** : les emplois créés par les filières sont déjà calculés par le moteur ; certaines filières comptent peut-être déjà des allocations évitées dans leurs coûts évités. Vérifier ligne par ligne avant d’ajouter un terme.
- **Lien avec le § 13** (09/11/2026) : la contrainte de main-d’œuvre suppose que des chômeurs sont embauchés dans leur métier (k = 25 % des demandeurs d’emploi ABC). Les indemnités de chômage économisées dans ce cas ne sont pas modélisées : cette piste reste ouverte, avec le même sens (↑) et la même précaution de double compte avec les coûts évités.

## 3. Nature des retours directs des filières — ?

- **Manque** : dans la trajectoire, θ × ΔPIB remplace les retours directs et indirects du moteur (pas de double compte). Or certains retours directs ne sont peut-être pas des recettes fiscales liées à l’activité (redevances, dividendes, loyers, remboursements de prêts).
- **À faire** : classer les retours directs de chaque filière (`src/data/filieres.ts`) : recettes liées à l’activité (déjà couvertes par θ) ou flux propres (à ajouter à part).

## 4. Usure du capital (dépréciation) — traitée par un rendement net, ↓ si r est lu comme un rendement brut

- **Constat** : l’effet d’offre `r × K_{t−1}` porte sur un capital cumulé sans usure. C’est cohérent parce que r (2 % par défaut) est un rendement **net de la dépréciation** : 6,5 % pour les filières de biens échangeables (excédent net d’exploitation ÷ actifs fixes nets, S31) et 4,7 % pour le rail (rendement brut de 11,0 % moins une dépréciation de 6,3 %, S31, S33, S36). Un r lu comme brut, avec un K sans usure, surestimerait l’effet.
- **Limite** : la dépréciation varie selon les actifs (bâtiment, réseaux, machines) et un rendement net constant sur le capital cumulé est une approximation. Avec un taux d’usure δ : `K_t = (1 − δ) × K_{t−1} + I_t` et un r brut.
- **À faire** : curseur δ (par exemple de 0 à 5 %/an, à sourcer : comptes de patrimoine de l’Insee, S31) et taux propre à chaque filière (bâtiment, réseaux, machines), avec un r brut.

## 5. Chevauchement entre coûts évités et effet d’offre — ↓ (risque de surestimation, r = 2 % par défaut)

- **Manque** : les coûts évités (part budgétaire, dont des importations d’énergie évitées pour certaines filières) et l’effet d’offre peuvent décrire le même gain. Exemple : une rénovation qui réduit la facture énergétique compte en coût évité et, via le capital accumulé, en PIB supplémentaire.
- **À faire** : pour chaque filière, indiquer si son gain passe par les coûts évités, par l’effet d’offre ou par les deux, et appliquer un rendement r propre à chaque filière (nul pour les filières dont le gain est déjà en coûts évités). Le r par défaut en tient déjà compte en moyenne : il est pondéré par l’investissement des filières, avec un rendement nul pour le BTP, l’énergie, l’eau, le spatial et la recherche (voir la piste 10). Le r par filière permettrait de retrouver ce résultat filière par filière. Voir aussi la piste 10.

## 6. Multiplicateur de 1,45 dès l’année 1 — ↓ (risque de surestimation)

- **Constat** : le multiplicateur de référence (1,45, hypothèse non sourcée) s’applique dès la première année. Le FMI (S15) estime l’effet d’un point de PIB d’investissement public à +0,4 % de PIB la même année et +1,5 % à quatre ans (économies avancées).
- **À faire** : profil temporel du multiplicateur (faible la première année, croissant ensuite), à sourcer (FMI 2014, chapitre 3 des Perspectives de l’économie mondiale ; Bom et Ligthart, S16). Ce profil interagit avec la piste 9 : un multiplicateur qui augmente avec le capital installé est une autre façon de décrire le même phénomène.

## 7. Élasticité des recettes égale à 1 — ?

- **Manque** : les recettes existantes restent à 52,2 % du PIB tendanciel ; les prélèvements nouveaux suivent le PIB ; θ est constant. En réalité, l’élasticité des recettes au PIB varie selon la conjoncture (souvent supérieure à 1 en reprise, inférieure en ralentissement) et selon l’impôt (IR progressif, IS très cyclique, TVA proche de 1).
- **À faire** : élasticité réglable par grande catégorie (sources : PLF, Haut Conseil des finances publiques).

## 8. Croissance tendancielle après 2027 — fait (09/11/2026)

- **Fait** : la croissance tendancielle suit l’Insee et la Banque de France (0,4 % en 2026, 0,9 % en 2027, 1,2 % en 2028, S12 et S13), puis 1,2 % par an par défaut, réglable de −1 à 3 % (clé d’URL `gl`). Les dépenses tendancielles suivent le PIB, corrigé d’un écart réglable (clé `ed`, 0 par défaut) : à écart nul, le déficit tendanciel reste à 5,4 % du PIB chaque année.
- **Choix** : la baisse du déficit prévue par le PLF 2027 (5,0 % en 2027, S14) n’est pas reprise : c’est une prévision du gouvernement, qui suppose les mesures d’économies de ce budget ; de plus, selon l’auteur du simulateur, les prévisions des lois de finances se sont souvent révélées optimistes (2025, 2026), point à documenter avec les rapports du Haut Conseil des finances publiques.
- **Reste à faire** : éventuellement, une norme de dépenses en volume (dépenses qui croissent à un rythme fixe) comme option, pour que la croissance réduise le déficit tendanciel.
- **Inflation** : le simulateur utilise le déflateur du PIB (1,5 %, S13 et S14), pas l’indice des prix à la consommation. Un choc ou une normalisation des prix de l’énergie importée pèse surtout sur l’indice des prix à la consommation (IPCH de la Banque de France : 2,3 % en 2026, 1,9 % en 2027, 1,6 % en 2028), beaucoup moins sur le déflateur. Pas de changement nécessaire tant que la trajectoire reste en déflateur.

## 9. Réindustrialisation et consommation de produits nationaux — façon B faite (09/11/2026), α = 0,45 par défaut (écarté par le non-cumul)

- **Idée** (utilisateur, 09/11/2026) : les investissements créent de la demande et de l’offre. Ils réindustrialisent ; les ménages, dont le pouvoir d’achat augmente (hausses de salaires, aides à la consommation), achètent davantage de produits des entreprises créées ou aidées. Une plus grande part de la demande reste donc en France.
- **Fait — façon B (fuite décroissante côté demande)** : `μ_t = max(μmin ; μ0 − α × K_éch,t−1 / PIB⁰_t)` et `report_t = [(1 − μ_t) / (1 − μ0) − 1] × (investissements × multiplicateur + dépenses courantes + effet récessif)`, ajouté à ΔPIB (`src/model/trajectoire.ts`).
  - μ0 = 22 % : part étrangère de la demande intérieure finale en 2019 (100 − 78 % de « made in France », Banque de France, S18).
  - μmin = 11 % : son niveau de 1965 (S18).
  - α : baisse de la part importée, en point, par point de PIB de capital ; hypothèse de modélisation dérivée de sources, 0,45 par défaut, réglable de 0 à 2 par pas de 0,05 (clé d’URL `si`). Dérivation ci-dessous.
  - K_éch : capital des seules filières de biens échangeables, cumulé comme K (euros 2027 × prix), productif à partir de l’année suivante.
- **Garde-fous automatiques** (testés dans `src/model/trajectoire.test.ts`) :
  - liste d’éligibilité `SUBSTITUTION_IMPORTS` (`src/data/filieres.ts`), avec un motif par filière : automobile, industrie, agriculture, mer et numérique retenus ; BTP et énergie exclus (importations évitées déjà comptées dans les coûts évités) ; rail, eau et spatial exclus (capital qui ne produit pas de biens échangeables). Base retenue : 27,7 Md€ d’investissement en année pleine sur 119,7 Md€ ;
  - plancher μmin : le report est plafonné à (1 − 11 %) / (1 − 22 %) − 1, soit environ +14 % de la demande créée ;
  - non-cumul avec l’effet d’offre : si `r × K` et le report sont tous deux positifs, seul le plus grand est retenu (l’autre est mis à 0 et signalé sous le tableau de décomposition) ; un report négatif (demande nette négative) est conservé par prudence ;
  - α = 0 ou capital nul : trajectoire inchangée (test de bouclage, avec r et α explicitement à 0) ;
  - la fuite commerciale du moteur (`fuiteImportMin`, `fuiteImportSeuil`) n’est pas modifiée.
- **Valeur par défaut α = 0,45** (décision du 09/11/2026). Aucune source ne chiffre α directement ; dérivation : α = (1 point de PIB en Md€) × (valeur ajoutée ÷ capital brut de l’industrie manufacturière) × (gain de « made in France » par Md€ de valeur ajoutée relocalisée).
  - 1 point de PIB 2024 = 29,2 Md€ (Insee, S31).
  - Industrie manufacturière (branches C10 à C33) en 2024 : capital fixe brut de 724,6 Md€, valeur ajoutée de 279,3 Md€, soit 0,385 (Insee, tableaux 6.401 à 6.460 et 6.201, S31). Le capital brut est retenu parce que du capital neuf se valorise au coût de remplacement.
  - Banque de France, document de travail 992 (S18), tableau 1 : 1 Md€ de valeur ajoutée industrielle implantée en France plutôt qu’à l’étranger augmente la valeur ajoutée française de 2,0 Md€ (dont 1,0 Md€ chez les fournisseurs) et le « made in France » de 0,039 point (de 0,016 pour la chimie à 0,082 pour l’agroalimentaire). Hypothèses de l’étude : demande totale inchangée, pas de contrainte d’offre, investissement initial non pris en compte.
  - α = 29,2 × 0,385 × 0,039 ≈ 0,44, arrondi à 0,45. Fourchette de lecture : 0,2 (chimie, 0,016) à 0,9 (capital net : rapport de 0,765, capital net de 365,2 Md€).
  - Limites : pleine utilisation des capacités, importations remplacées une pour une ; le gain mesuré sur toute la demande est appliqué à la seule demande du programme ; le report et l’effet d’offre décrivent en partie la même production (d’où le non-cumul).
  - Repère signalé : le contenu en importations de l’investissement (formation brute de capital fixe, stocks et objets de valeur) était de 32,3 % en 2015, contre 24,6 % pour l’ensemble de la demande finale (Insee, « made in France », tableau T13, S37). La part importée de départ de 22 % (S18) est peut-être basse pour une demande surtout faite d’investissement : piste, qui ne change rien au modèle pour l’instant.
- **Effet avec les valeurs par défaut** : avec r = 2 %, le garde-fou de non-cumul retient l’effet d’offre et écarte le report dans toutes les années où les deux sont positifs. Le report ne pèse donc sur aucun résultat affiché tant que r = 2 % ; il redevient actif si r est ramené en dessous de la valeur qui donne le même gain, ou à 0.
- **Ordres de grandeur du report seul** (préréglage par défaut, **r = 0** pour isoler le report, investissement des filières étalé sur 10 ans à partir de 2028 ; capital éligible de 0,26 % du PIB tendanciel en 2030 et 0,84 % en 2032, pour α = 1) :

  | α | Part importée 2032 | Report 2030 | Report 2032 | Effet sur le solde 2030 | Effet sur le solde 2032 |
  |---|---|---|---|---|---|
  | 0,45 (défaut) | 21,6 % | +0,07 Md€ | +0,41 Md€ | +0,03 Md€ | +0,17 Md€ |
  | 0,5 | 21,6 % | +0,1 Md€ | +0,5 Md€ | +0,03 Md€ | +0,19 Md€ (+0,005 point de PIB) |
  | 1 | 21,2 % | +0,2 Md€ | +0,9 Md€ | +0,06 Md€ | +0,37 Md€ (+0,010 point) |
  | 2 | 20,3 % | +0,3 Md€ | +1,8 Md€ | +0,13 Md€ | +0,75 Md€ (+0,020 point) |

  Avec r = 2 % (défaut), l’effet d’offre est de +0,8 Md€ en 2030, +2,6 Md€ en 2032 et +7,5 Md€ en 2035, supérieur au report (0,07, 0,41 et 1,93 Md€ pour α = 0,45) : celui-ci est écarté. Avec r = 5 %, l’effet d’offre (+1,9 Md€ en 2030, +6,4 Md€ en 2032) le dépasse aussi.
- **Reste à faire** :
  - confronter α dérivé à une mesure directe (élasticité de la part importée au capital installé, par exemple à partir d’épisodes de relocalisation) et réviser la part importée de départ pour une demande d’investissement (S37) ;
  - affiner l’éligibilité par axe plutôt que par filière (par exemple l’axe bois-terre-paille du BTP, les lanceurs du spatial), avec une part échangeable par filière, à décider et à sourcer ;
  - délais d’installation des capacités (le report démarre dès l’année suivant l’investissement) ;
  - vérifier le recoupement éventuel avec le multiplicateur de 1,45 (piste 6).
- **Façon A — second tour sur l’effet d’offre (non retenue)** : `ΔPIB_t += m_offre × r × K_{t−1}`. Nulle si r = 0 ; double compte si r est lu comme un effet total (le chiffre du FMI, S15, inclut déjà les effets induits).

## 10. Investissements de transition sans gain de capacité — pris en compte dans le r par défaut (2 %)

- **Constat** : Pisani-Ferry et Mahfouz (S17) indiquent qu’une partie des investissements de la transition remplace des équipements existants sans accroître les capacités de production, et prévoient un ralentissement de la productivité d’environ ¼ de point par an vers 2030. La DG Trésor (S35) le confirme : son modèle Mésange n’a pas de fonction de production et ses investissements de transition ne servent « a priori » pas à augmenter significativement la production.
- **Fait** (09/11/2026) : r = 2 % par an par défaut (il valait 0), moyenne des rendements nets par filière pondérée par l’investissement d’année pleine du P50 (119,7 Md€). Toutes les filières montent en charge au même rythme : leur capital reste dans une proportion fixe du capital total, et un r unique égal à cette moyenne équivaut exactement à un rendement propre à chaque filière.
  - Filières de biens échangeables (automobile, industrie, agriculture, mer, numérique : 27,7 Md€, 23,1 %) : 6,5 % par an, excédent net d’exploitation ÷ actifs fixes nets des sociétés non financières en 2024 (199,6 ÷ 3 083,8 Md€ ; 5,5 % en 2022, 7,0 % en 2023 ; Insee, tableaux 7.101 et 8.202, S31). Repère : Caselli et Feyrer (S32, tableau II) trouvent une productivité marginale du capital des pays riches de 7,5 à 12,6 % brute selon les corrections, avec une dépréciation de 6 %, soit environ 1,5 à 6,6 % nette.
  - Rail (14 Md€, 11,7 %) : 4,7 %, soit une élasticité de la production au capital public de 0,065 (bas de la fourchette 0,065-0,12 de Ramey, S33, p. 39 et 41) ÷ un capital public net de 59,3 % du PIB (1 732,2 Md€ d’actifs fixes nets des administrations publiques pour un PIB de 2 919,9 Md€ en 2024, Insee, tableaux 8.204 et 1.101, S31), soit 11,0 % brut, moins une dépréciation de 6,3 % (consommation de capital fixe des administrations publiques en 2023 : 108 Md€ sur 1 701,8 Md€ d’actifs nets, FIPECO d’après l’Insee, S36).
  - BTP (rénovation, logements), énergie, eau, spatial et recherche : 0, par prudence. La rénovation et les renouvelables remplacent des équipements existants et leurs gains (énergie importée évitée) figurent déjà dans les coûts évités ; Pisani-Ferry et Mahfouz (S17) et la DG Trésor (S35) jugent que ces investissements n’augmentent pas le potentiel de croissance. Les réseaux d’eau sont surtout des réfections.
  - r = 0,231 × 6,5 % + 0,117 × 4,7 % = 1,50 + 0,55 ≈ 2 %. Fourchette de lecture : 1 % (prudente) à 3 % (capital public à l’élasticité de 0,083 de Bom et Ligthart, S16, eau comprise).
  - Recoupement : dans le modèle QUEST de la Commission européenne (Pfeiffer, Varga et in ’t Veld, 2021, S34, p. 17-18, tableaux 4.1 et 11.1), l’investissement NGEU (environ 4 % du PIB de l’UE) relève le PIB de l’UE de 0,7 % en 2030 et de 0,4 % en 2040 (0,3 et 0,2 si le capital public est peu productif ; France : +0,4 % en 2030, dont 0,1 point de retombées des autres pays, et +0,2 % en 2040), avec une élasticité de 0,12 et une dépréciation de 5 %. Ces chiffres incluent l’effet de demande et ne se convertissent pas directement en r.
  - r est un rendement net de la dépréciation, d’où l’absence d’usure dans K (voir la piste 4). Avec ce r, le garde-fou de non-cumul retient l’effet d’offre et écarte le report de la demande (piste 9).
- **Limites** : les logements neufs produisent un service de logement, mais aucun rendement sourcé n’est retenu ici (rendement nul par prudence, à documenter) ; recherche et spatial à 0 sans mesure ; un seul r pour toutes les filières ; le rendement du capital privé de l’ensemble des sociétés non financières est appliqué à des filières nouvelles, dont le rendement marginal peut être plus faible ; le chevauchement avec les coûts évités n’est écarté que par le rendement nul des filières concernées (piste 5).
- **À faire** : rendement r propre à chaque filière (voir piste 5), avec un repère sourcé pour les logements neufs.

## 11. Baisse du stock détenu par la BCE — ↓

- **Constat** : le gain du levier « gel BCE » est calculé sur le stock au 31/10/2026 (597,0 Md€, S8 et S9). Ce stock baisse chaque année, car les titres échus ne sont plus réinvestis (baisse de 66,1 Md€ entre le 31/12/2025 et le 31/10/2026). Le modèle « année pleine » applique le gain de 2030 sur le stock de 2026.
- **À faire** : dans la trajectoire, faire décroître le gain du gel au rythme des échéances (profil d’amortissement du portefeuille, à sourcer : BCE, Banque de France).

## 12. Prêts non empruntés et retards d’investissement — réglages ajoutés (09/11/2026), montée en charge de 10 ans par défaut

- **Constat** (bilan du plan de relance espagnol, Funcas, S19) : l’Espagne a ramené l’enveloppe de prêts européens qu’elle demandait de 83,2 à 22,7 Md€ (environ 27 % conservés), 35 mesures ayant été jugées inatteignables faute de demande ; sur la ligne 1 du plan de décarbonation de l’industrie, 6,9 M€ de prêts ont été accordés contre 501,7 M€ de subventions. Fin 2025, 87 % des réformes étaient réalisées, contre 35 % des investissements. Or 84 % de l’investissement des filières passe ici par les prêts du pôle public bancaire (101,0 sur 119,7 Md€ par an).
- **Fait** : deux réglages, dans les trajectoires seulement. Part des prêts du pôle effectivement empruntée (clé `pu`, 100 % par défaut) : l’investissement financé par les prêts non empruntés n’a pas lieu, les subventions de l’État restent dépensées. Durée de montée en charge de l’investissement des filières (clé `di`, 10 ans par défaut, réglable de 10 à 30) : les flux liés à l’investissement (surcroît de PIB des filières, capital, coûts évités, part de l’État dans l’investissement, bonification, investissement de substitution) sont nuls en 2026 et 2027, puis valent l’année pleine × min(1, (année − 2027) / D) à partir de 2028 ; le reste du programme garde son année pleine en 2030. Cette durée est une hypothèse de modèle (voir `dureeMonteeInvestissement` dans `src/data/hypotheses.ts`). Elle remplace l’ancien réglage « année pleine de l’investissement » (clé `ai`, 2032 par défaut, de 2030 à 2034) : un ancien lien contenant `ai` est ignoré sans erreur.
- **Valeurs par défaut** (décision du 09/11/2026) : prêts empruntés à 100 %, car le repère espagnol de 27 % porte sur des prêts européens que l’État demandait pour lui-même, pas sur la demande des entreprises auprès d’une banque publique ; montée en charge sur 10 ans, car le retard d’exécution des investissements est mesuré en Espagne (35 % contre 87 % pour les réformes), sa durée restant une hypothèse. Pas de réglage d’additionnalité (décision du 09/11/2026) : selon l’enquête de la Banque d’Espagne citée par Funcas (Cerezo et al., 2024), 39 % des projets financés par les fonds européens sont entièrement nouveaux, 44 % en partie et 17 % auraient eu lieu sans ces fonds ; Funcas en tire un facteur de 61 %, qu’il applique aux transferts en capital, mais ce repère n’est pas transposé ici.
- **Ordres de grandeur** (préréglage par défaut avec r = 2 % et α = 0,45 ; rachat d’Engie coché, écart de prix de l’électricité nul ; main-d’œuvre : k = 25 %, φ = 100 %, régularisation de 410 000 personnes ; déficit tendanciel de 5,40 %, dette tendancielle de 132,3 % en 2032 et 137,8 % en 2035) :

  | Variante | Déficit 2030 | Déficit 2032 | Déficit 2035 | Dette 2032 | Dette 2035 |
  |---|---|---|---|---|---|
  | Par défaut (D = 10, prêts à 100 %) | 2,63 % | 2,21 % | 1,65 % | 118,3 % | 112,9 % |
  | D = 15 | 2,83 % | 2,49 % | 2,05 % | 120,2 % | 116,2 % |
  | D = 20 | 2,94 % | 2,65 % | 2,26 % | 121,2 % | 117,9 % |
  | D = 30 | 3,05 % | 2,82 % | 2,50 % | 122,2 % | 119,8 % |
  | Prêts empruntés à 27 % (D = 10) | 3,07 % | 2,84 % | 2,54 % | 122,1 % | 119,7 % |
  | Prêts à 27 % et D = 20 | 3,17 % | 3,01 % | 2,79 % | 123,2 % | 121,7 % |

  Le rachat d’Engie (environ 48 Md€ de dette en 2028, sans effet sur le déficit) ajoute 1,3 point de dette en 2032 et 1,2 point en 2035 ; sans lui, la dette par défaut est de 117,0 % en 2032 et de 111,7 % en 2035. Pour mémoire, avec r = 0 et α = 0 (anciennes valeurs par défaut de l’effet d’offre et du report), le cas par défaut donne un déficit de 2,64 %, 2,24 % et 1,73 % en 2030, 2032 et 2035 et une dette de 118,5 % en 2032 et de 113,3 % en 2035.
- **Limites** : les repères espagnols portent sur des prêts européens à l’État et des prêts aidés aux entreprises, pas sur un pôle public bancaire ; les emplois et le solde du moteur supposent toujours tous les prêts empruntés ; un prêt non emprunté peut aussi être remplacé par un financement privé (non modélisé).

## 13. Contrainte de main-d'œuvre, immigration de travail et régularisation — ajoutés (09/11/2026)

- **Fait** : trois réglages, dans les trajectoires seulement (`src/model/mainOeuvre.ts`, `src/data/metiers.ts`). Part des demandeurs d'emploi du métier mobilisables (clé `km`, 25 %, de 10 à 50 %), part des emplois manquants pourvue par une nouvelle immigration de travail (clé `im`, 100 %) et personnes régularisées (clé `rg`, 410 000, de 0 à 700 000). Principe : le surcroît de PIB suppose déjà tous les emplois pourvus ; les travailleurs immigrés ne l'augmentent pas, ils le rendent possible. Les emplois sans chômeur ni nouvel arrivant ne sont pas créés (PIB, coûts évités et capital en moins ; dépenses de l'État et bonification inchangées). Contrôle de la recherche (k = 25 %, φ = 100 %, D = 10, prêts à 100 %, multiplicateur 1,45) : solde migratoire supplémentaire de 0 en 2028, puis environ 5 300, 33 800, 56 500, 70 900, 77 300, 83 500 et 83 500 de 2029 à 2035 ; le moteur donne exactement 1 035 000 emplois.
- **Sens sur le solde** : ↓ avec l'immigration de travail (21 300 € de dépense variable par habitant, indexés sur le PIB tendanciel, pour des recettes qui passent seulement par θ × ΔPIB) ; ↑ avec la régularisation (environ 2,0 Md€ en euros 2025 pour 410 000 personnes). Avec φ = 0, le PIB est plus bas et aucun migrant n'est compté.
- **Limites à lever** : emplois non sourcés pour 8 filières ; répartition des emplois entre métiers non sourcée ; emplois induits supposés pourvus sans contrainte ; réserve de chômeurs fixe (09/2026), sans « halo » de 1,9 million de personnes ni mobilité entre métiers ; formation non comptée ; indemnités de chômage économisées non modélisées (voir § 2) ; décomposition espagnole du PIB (S47) comptable et non causale, PIB total et non PIB par habitant ; dépense par habitant qui ignore la croissance de la population (fourchette de 14 900 € à 23 900 €) ; régularisation : aucune dépense nouvelle chiffrée (droits au logement, prestations familiales et RSA après 5 ans de titre de séjour non chiffrés faute de source), aucun effet sur la population, effectif fondé sur la seule référence espagnole (rapportée à la population, elle donnerait environ 906 000 personnes, plus que toute la population irrégulière estimée), aucune estimation des sous-groupes visés par le programme.

## Vérifications à faire avant tout ajout

- Chaque nouveau terme doit être sourcé ou signalé comme hypothèse de modélisation, avec un curseur et une valeur par défaut prudente.
- Ajouter un test de bouclage (comme pour θ) qui prouve que le nouveau terme ne recompte pas un flux déjà présent.
- Mettre à jour l’onglet « Méthodologie et sources » (équations, hypothèses, limites) et le README.
