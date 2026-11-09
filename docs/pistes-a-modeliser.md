# Pistes à modéliser

Éléments identifiés le 09/11/2026 lors de la refonte de la trajectoire 2026-2032 (horizon porté à 2035 le même jour) (croissance endogène, croissance tendancielle de la Banque de France, effet d’offre en option, dette du PLF 2027). Ils ne sont pas pris en compte, ou seulement en partie, dans le simulateur. Chaque piste précise ce qui manque, son sens probable sur le solde et les précautions à prendre. Les références S1 à S19 renvoient à `src/data/sources.ts`. Les chiffres cités correspondent au préréglage par défaut (« Programme complet – hypothèses centrales »), avec un effet durable des investissements nul (r = 0).

Légende : **↑** améliore le solde, **↓** le dégrade, **?** sens incertain.

## 1. Charge d’intérêts (effet « boule de neige ») — ?

- **Manque** : la dette évolue par `dette_t = dette_{t−1} − solde_t`, mais le solde ne dépend pas du niveau de la dette. Une dette plus basse (programme) ou plus haute (tendanciel) ne change pas les intérêts payés.
- **Effet** : creuserait l’écart entre les deux trajectoires. La dette 2032 passe de 132,3 % du PIB (tendanciel) à 109,0 % (programme) : les intérêts évités sur cet écart amélioreraient encore le solde du programme. À l’inverse, une hausse des taux (réaction des marchés, levier BCE contesté) le dégraderait.
- **À faire** : séparer le solde primaire et la charge d’intérêts ; taux apparent sur la dette (sourcé : PLF 2027, Agence France Trésor) ; option de prime de risque réglable.
- **Attention** : le levier « gel BCE » compte déjà des intérêts économisés sur le stock détenu par l’Eurosystème (voir § 11). Ne pas les compter deux fois.

## 2. Chômage et stabilisateurs automatiques — ↑

- **Manque** : le surcroît d’activité rapporte θ = 35 % de recettes, mais ne réduit pas les dépenses liées au chômage (allocations, minima sociaux).
- **Effet** : le côté dépenses des stabilisateurs améliorerait le solde quand le PIB augmente.
- **Attention** : les emplois créés par les filières sont déjà calculés par le moteur ; certaines filières comptent peut-être déjà des allocations évitées dans leurs coûts évités. Vérifier ligne par ligne avant d’ajouter un terme.

## 3. Nature des retours directs des filières — ?

- **Manque** : dans la trajectoire, θ × ΔPIB remplace les retours directs et indirects du moteur (pas de double compte). Or certains retours directs ne sont peut-être pas des recettes fiscales liées à l’activité (redevances, dividendes, loyers, remboursements de prêts).
- **À faire** : classer les retours directs de chaque filière (`src/data/filieres.ts`) : recettes liées à l’activité (déjà couvertes par θ) ou flux propres (à ajouter à part).

## 4. Usure du capital (dépréciation) — ↓, seulement si r > 0

- **Manque** : l’effet d’offre `r × K_{t−1}` porte sur un capital cumulé sans usure. Sans objet avec le réglage par défaut (r = 0).
- **Effet** : sur 2028-2032, l’écart est faible (capital récent), mais il grandit au-delà. Avec un taux d’usure δ : `K_t = (1 − δ) × K_{t−1} + I_t`.
- **À faire** : curseur δ (par exemple de 0 à 5 %/an, à sourcer : comptes de patrimoine de l’Insee) et taux propre à chaque filière (bâtiment, réseaux, machines).

## 5. Chevauchement entre coûts évités et effet d’offre — ↓ (risque de surestimation si r > 0)

- **Manque** : les coûts évités (part budgétaire, dont des importations d’énergie évitées pour certaines filières) et l’effet d’offre peuvent décrire le même gain. Exemple : une rénovation qui réduit la facture énergétique compte en coût évité et, via le capital accumulé, en PIB supplémentaire.
- **À faire** : pour chaque filière, indiquer si son gain passe par les coûts évités, par l’effet d’offre ou par les deux, et appliquer un rendement r propre à chaque filière (nul pour les filières dont le gain est déjà en coûts évités). Voir aussi la piste 10.

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

## 9. Réindustrialisation et consommation de produits nationaux — façon B faite (09/11/2026), nulle par défaut

- **Idée** (utilisateur, 09/11/2026) : les investissements créent de la demande et de l’offre. Ils réindustrialisent ; les ménages, dont le pouvoir d’achat augmente (hausses de salaires, aides à la consommation), achètent davantage de produits des entreprises créées ou aidées. Une plus grande part de la demande reste donc en France.
- **Fait — façon B (fuite décroissante côté demande)** : `μ_t = max(μmin ; μ0 − α × K_éch,t−1 / PIB⁰_t)` et `report_t = [(1 − μ_t) / (1 − μ0) − 1] × (investissements × multiplicateur + dépenses courantes + effet récessif)`, ajouté à ΔPIB (`src/model/trajectoire.ts`).
  - μ0 = 22 % : part étrangère de la demande intérieure finale en 2019 (100 − 78 % de « made in France », Banque de France, S18).
  - μmin = 11 % : son niveau de 1965 (S18).
  - α : baisse de la part importée, en point, par point de PIB de capital ; hypothèse non sourcée, 0 par défaut, réglable de 0 à 2 (clé d’URL `si`).
  - K_éch : capital des seules filières de biens échangeables, cumulé comme K (euros 2027 × prix), productif à partir de l’année suivante.
- **Garde-fous automatiques** (testés dans `src/model/trajectoire.test.ts`) :
  - liste d’éligibilité `SUBSTITUTION_IMPORTS` (`src/data/filieres.ts`), avec un motif par filière : automobile, industrie, agriculture, mer et numérique retenus ; BTP et énergie exclus (importations évitées déjà comptées dans les coûts évités) ; rail, eau et spatial exclus (capital qui ne produit pas de biens échangeables). Base retenue : 27,7 Md€ d’investissement en année pleine sur 119,7 Md€ ;
  - plancher μmin : le report est plafonné à (1 − 11 %) / (1 − 22 %) − 1, soit environ +14 % de la demande créée ;
  - non-cumul avec l’effet d’offre : si `r × K` et le report sont tous deux positifs, seul le plus grand est retenu (l’autre est mis à 0 et signalé sous le tableau de décomposition) ; un report négatif (demande nette négative) est conservé par prudence ;
  - α = 0 ou capital nul : trajectoire inchangée (test de bouclage) ;
  - la fuite commerciale du moteur (`fuiteImportMin`, `fuiteImportSeuil`) n’est pas modifiée.
- **Ordres de grandeur** (préréglage par défaut, r = 0, année pleine de l’investissement en 2032 ; capital éligible de 1,4 % du PIB tendanciel en 2030 et 2,7 % en 2032) :

  | α | Part importée 2032 | Report 2030 | Report 2032 | Effet sur le solde 2030 | Effet sur le solde 2032 |
  |---|---|---|---|---|---|
  | 0,5 | 20,6 % | +1,2 Md€ | +3,1 Md€ | +0,5 Md€ | +1,3 Md€ (+0,03 point de PIB) |
  | 1 | 19,3 % | +2,3 Md€ | +6,2 Md€ | +0,9 Md€ | +2,5 Md€ (+0,07 point) |
  | 2 | 16,6 % | +4,6 Md€ | +12,5 Md€ | +1,9 Md€ | +5,1 Md€ (+0,14 point) |

  Avec r = 5 %, l’effet d’offre (+10,1 Md€ en 2030, +21,0 Md€ en 2032) dépasse le report, qui est alors écarté. Avec l’investissement à plein dès 2030, ces montants sont environ 15 à 50 % plus élevés (report de +7,4 Md€ en 2032 pour α = 1). Ces chiffres sont environ deux fois plus faibles que les ordres de grandeur estimés avant l’implémentation, qui portaient sur le capital de toutes les filières.
- **Reste à faire** :
  - sourcer α (élasticité de la part importée au capital installé, par exemple à partir d’épisodes de relocalisation ou des tableaux entrées-sorties de la Banque de France, S18) ;
  - affiner l’éligibilité par axe plutôt que par filière (par exemple l’axe bois-terre-paille du BTP, les lanceurs du spatial), avec une part échangeable par filière, à décider et à sourcer ;
  - délais d’installation des capacités (le report démarre dès l’année suivant l’investissement) ;
  - vérifier le recoupement éventuel avec le multiplicateur de 1,45 (piste 6).
- **Façon A — second tour sur l’effet d’offre (non retenue)** : `ΔPIB_t += m_offre × r × K_{t−1}`. Nulle tant que r = 0 ; double compte si r est lu comme un effet total (le chiffre du FMI, S15, inclut déjà les effets induits).

## 10. Investissements de transition sans gain de capacité — pris en compte par défaut (r = 0)

- **Constat** : Pisani-Ferry et Mahfouz (S17) indiquent qu’une partie des investissements de la transition remplace des équipements existants sans accroître les capacités de production, et prévoient un ralentissement de la productivité d’environ ¼ de point par an vers 2030. C’est pourquoi l’effet durable des investissements est nul par défaut (09/11/2026).
- **Limite** : certaines filières créent des capacités (logements neufs, nouvelles lignes de production automobile, réseaux). Un r nul pour toutes est prudent, peut-être trop.
- **À faire** : rendement r propre à chaque filière (voir piste 5) : nul pour les investissements de remplacement, positif pour les capacités nouvelles, avec des repères sourcés (FMI, S15 ; Bom et Ligthart, S16).

## 11. Baisse du stock détenu par la BCE — ↓

- **Constat** : le gain du levier « gel BCE » est calculé sur le stock au 31/10/2026 (597,0 Md€, S8 et S9). Ce stock baisse chaque année, car les titres échus ne sont plus réinvestis (baisse de 66,1 Md€ entre le 31/12/2025 et le 31/10/2026). Le modèle « année pleine » applique le gain de 2030 sur le stock de 2026.
- **À faire** : dans la trajectoire, faire décroître le gain du gel au rythme des échéances (profil d’amortissement du portefeuille, à sourcer : BCE, Banque de France).

## 12. Prêts non empruntés et retards d’investissement — réglages ajoutés (09/11/2026), année pleine de l’investissement en 2032 par défaut

- **Constat** (bilan du plan de relance espagnol, Funcas, S19) : l’Espagne a ramené l’enveloppe de prêts européens qu’elle demandait de 83,2 à 22,7 Md€ (environ 27 % conservés), 35 mesures ayant été jugées inatteignables faute de demande ; sur la ligne 1 du plan de décarbonation de l’industrie, 6,9 M€ de prêts ont été accordés contre 501,7 M€ de subventions. Fin 2025, 87 % des réformes étaient réalisées, contre 35 % des investissements. Or 84 % de l’investissement des filières passe ici par les prêts du pôle public bancaire (101,0 sur 119,7 Md€ par an).
- **Fait** : deux réglages, dans les trajectoires seulement. Part des prêts du pôle effectivement empruntée (clé `pu`, 100 % par défaut) : l’investissement financé par les prêts non empruntés n’a pas lieu, les subventions de l’État restent dépensées. Année pleine de l’investissement des filières (clé `ai`, 2032 par défaut, réglable de 2030 à 2034) : seuls les flux liés à l’investissement (surcroît de PIB des filières, capital, coûts évités, part de l’État dans l’investissement, bonification) sont décalés ; le reste du programme garde son année pleine en 2030.
- **Valeurs par défaut** (décision du 09/11/2026) : prêts empruntés à 100 %, car le repère espagnol de 27 % porte sur des prêts européens que l’État demandait pour lui-même, pas sur la demande des entreprises auprès d’une banque publique ; année pleine de l’investissement en 2032, car le retard d’exécution des investissements est mesuré en Espagne (35 % contre 87 % pour les réformes), sa durée de deux ans restant une hypothèse. Pas de réglage d’additionnalité (décision du 09/11/2026) : selon l’enquête de la Banque d’Espagne citée par Funcas (Cerezo et al., 2024), 39 % des projets financés par les fonds européens sont entièrement nouveaux, 44 % en partie et 17 % auraient eu lieu sans ces fonds ; Funcas en tire un facteur de 61 %, qu’il applique aux transferts en capital, mais ce repère n’est pas transposé ici.
- **Ordres de grandeur** (préréglage par défaut ; déficit tendanciel de 5,40 %, dette tendancielle de 132,3 % en 2032 et 137,8 % en 2035) :

  | Variante | Déficit 2030 | Déficit 2032 | Dette 2032 | Dette 2035 |
  |---|---|---|---|---|
  | Par défaut (prêts à 100 %, année pleine de l’investissement en 2032) | 1,65 % | 1,18 % | 109,0 % | 104,1 % |
  | Investissement à plein dès 2030 | 1,21 % | 1,18 % | 108,1 % | 103,2 % |
  | Année pleine en 2034 | 1,83 % | 1,48 % | 110,8 % | 105,0 % |
  | Prêts empruntés à 27 % (année pleine en 2032) | 2,77 % | 2,59 % | 118,1 % | 116,4 % |
  | Prêts à 27 % et année pleine en 2034 | 2,82 % | 2,67 % | 118,7 % | 116,6 % |
- **Limites** : les repères espagnols portent sur des prêts européens à l’État et des prêts aidés aux entreprises, pas sur un pôle public bancaire ; les emplois et le solde du moteur supposent toujours tous les prêts empruntés ; un prêt non emprunté peut aussi être remplacé par un financement privé (non modélisé).

## Vérifications à faire avant tout ajout

- Chaque nouveau terme doit être sourcé ou signalé comme hypothèse de modélisation, avec un curseur et une valeur par défaut prudente.
- Ajouter un test de bouclage (comme pour θ) qui prouve que le nouveau terme ne recompte pas un flux déjà présent.
- Mettre à jour l’onglet « Méthodologie et sources » (équations, hypothèses, limites) et le README.
