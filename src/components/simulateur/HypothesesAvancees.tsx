import { HYPOTHESES } from '../../data/hypotheses'
import { NOTE_BONIFICATION } from '../../data/poleBancaire'
import { fmtMd, fmtNombre, fmtPct, fmtValeurUnite } from '../../lib/format'
import type { SimulationParams } from '../../model/types'
import { Badge } from '../ui/Badge'
import { Slider } from '../ui/Slider'

interface Props {
  params: SimulationParams
  rho: number
  setRho: (v: number) => void
  setParam: <K extends keyof SimulationParams>(c: K, v: SimulationParams[K]) => void
  /** Bonification comptée dans le solde (Md€), pour affichage. */
  bonificationMd: number
}

export function HypothesesAvancees({ params, rho, setRho, setParam, bonificationMd }: Props) {
  const lecture = ['risqueSpread', 'pib2025', 'tauxRecettesPubliques', 'deficitTendanciel', 'dette2026', 'stockBce', 'partImporteeDemande'] as const
  return (
    <details className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <summary className="cursor-pointer text-base font-bold">Hypothèses avancées</summary>
      <div className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
        <div>
          <Slider
            label="Retours sur dépenses courantes (année pleine)"
            valeur={params.retoursCourantsBase} min={0} max={40} pas={1}
            onChange={(v) => setParam('retoursCourantsBase', v)}
            affichage={`${fmtNombre(params.retoursCourantsBase, 0)} Md€`}
            texteVocal={`${params.retoursCourantsBase} milliards d'euros`}
            badge={<Badge statut="hypothese-non-sourcee" court />}
            aide="Valeur d’origine : 14 Md€. Proportionnel au multiplicateur."
          />
          <Slider
            label="Croissance réelle du PIB sans le programme, à partir de 2029"
            valeur={params.croissanceLongTermePct} min={-1} max={3} pas={0.1}
            onChange={(v) => setParam('croissanceLongTermePct', v)}
            affichage={`${fmtPct(params.croissanceLongTermePct, 1, true)} par an`}
            texteVocal={`${fmtNombre(params.croissanceLongTermePct)} pour cent par an`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Croissance en volume du scénario tendanciel de 2029 à 2035. Les années 2026 à 2028 suivent les prévisions de l’Insee et de la Banque de France (0,4 %, 0,9 %, 1,2 %), non réglables. 1,2 % : dernière projection de la Banque de France (2028), prolongée. Le surcroît d’activité dû au programme s’y ajoute."
          />
          <Slider
            label="Inflation (prix du PIB)"
            valeur={params.inflationPct} min={0} max={4} pas={0.1}
            onChange={(v) => setParam('inflationPct', v)}
            affichage={`${fmtPct(params.inflationPct)} par an`}
            texteVocal={`${fmtNombre(params.inflationPct)} pour cent par an`}
            badge={<Badge statut="officiel" court />}
            aide="Hausse des prix de ce que la France produit (déflateur du PIB), pas des prix à la consommation : un choc sur l’énergie importée la touche peu. Fait progresser au même rythme le PIB, les recettes, les dépenses et les montants du programme ; allège surtout le ratio de dette. 1,5 % : Banque de France et projet de loi de finances 2027."
          />
          <Slider
            label="Croissance des dépenses publiques par rapport au PIB (hors programme)"
            valeur={params.ecartDepensesPct} min={-2} max={2} pas={0.1}
            onChange={(v) => setParam('ecartDepensesPct', v)}
            affichage={`${fmtNombre(params.ecartDepensesPct, 1, true)} point par an`}
            texteVocal={`${fmtNombre(params.ecartDepensesPct)} point par an`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Écart entre la croissance des dépenses tendancielles et celle du PIB. À 0, les dépenses suivent le PIB et le déficit tendanciel reste à 5,4 % du PIB ; négatif, il se réduit ; positif, il se creuse."
          />
          <Slider
            label="Recettes publiques par euro de PIB supplémentaire"
            valeur={params.tauxRecettesActivitePct} min={20} max={55} pas={1}
            onChange={(v) => setParam('tauxRecettesActivitePct', v)}
            affichage={`${fmtNombre(params.tauxRecettesActivitePct, 0)} centimes par euro`}
            texteVocal={`${fmtNombre(params.tauxRecettesActivitePct, 0)} centimes par euro de PIB`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Impôts et cotisations rapportés par le surcroît d’activité créé par le programme (et perdus sur l’activité freinée par les prélèvements nouveaux). Valeur par défaut : 35 centimes, comme dans le moteur ; le taux moyen des recettes publiques est de 52,2 %."
          />
          <Slider
            label="Effet durable des investissements sur le PIB"
            valeur={params.rendementCapitalPct} min={0} max={20} pas={1}
            onChange={(v) => setParam('rendementCapitalPct', v)}
            affichage={`${fmtNombre(params.rendementCapitalPct, 0)} centimes par an par euro investi`}
            texteVocal={`${fmtNombre(params.rendementCapitalPct, 0)} centimes de PIB par an par euro investi`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Capacités de production créées par les investissements des filières : chaque euro investi ajoute ce montant au PIB chaque année, dès l’année suivante et sans usure. 2 % par défaut : rendement net de la dépréciation, moyenne des rendements par filière pondérée par leur investissement d’année pleine (119,7 Md€ au P50). Filières de biens échangeables (automobile, industrie, agriculture, mer, numérique ; 23,1 % de l’investissement) : 6,5 % par an, excédent net d’exploitation ÷ actifs fixes nets des sociétés non financières en 2024 (Insee). Rail (11,7 %) : 4,7 %, soit une élasticité de la production au capital public de 0,065 (Ramey) ÷ un capital public net de 59,3 % du PIB (Insee), moins une dépréciation de 6,3 % (Insee, FIPECO). Bâtiment, énergie, eau, spatial et recherche : 0, car ces investissements remplacent surtout des équipements existants et leurs gains figurent déjà dans les coûts évités (Pisani-Ferry et Mahfouz ; DG Trésor). Soit 0,231 × 6,5 % + 0,117 × 4,7 % ≈ 2 %. Fourchette de lecture : 1 % (prudente) à 3 % (capital public à l’élasticité de 0,083, Bom et Ligthart, eau comprise). 0 donne un effet de demande seul. Avec ce réglage, le garde-fou de non-cumul retient cet effet et écarte le report de la demande."
          />
          <Slider
            label="Report de la demande vers des produits français"
            valeur={params.substitutionImports} min={0} max={2} pas={0.05}
            onChange={(v) => setParam('substitutionImports', v)}
            affichage={`${fmtNombre(params.substitutionImports, 2)} point d’importations en moins par point de PIB investi`}
            texteVocal={`${fmtNombre(params.substitutionImports, 2)} point de part importée en moins par point de PIB de capital`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Les investissements des filières qui produisent des biens échangeables (automobile, industrie, agriculture, mer, numérique) permettent d’acheter en France ce qui était importé. Chaque point de PIB de capital installé par ces filières fait baisser de ce nombre de points la part importée de la demande créée par le programme (22 % en 2019, Banque de France), dès l’année suivante. Aucune source ne chiffre ce réglage directement : 0,45 par défaut = 29,2 Md€ (1 point de PIB 2024) × 0,385 (valeur ajoutée ÷ capital brut de l’industrie manufacturière, Insee) × 0,039 (point de « made in France » gagné par milliard d’euros de valeur ajoutée relocalisée, Banque de France), soit 0,44 arrondi à 0,45 ; fourchette de lecture de 0,2 (chimie) à 0,9 (capital net). Limites : pleine utilisation des capacités, importations remplacées une pour une, gain mesuré sur toute la demande appliqué à celle du programme ; la part importée de départ (22 %) est peut-être basse pour une demande faite d’investissement. Garde-fous automatiques : le bâtiment, l’énergie, le rail, l’eau et le spatial sont exclus (biens non échangeables, ou importations évitées déjà comptées dans les coûts évités) ; la part importée ne descend pas sous 11 % (son niveau de 1965) ; si l’effet durable est aussi positif, seul le plus grand des deux gains compte : avec les valeurs par défaut, l’effet durable est retenu et ce report est écarté. 0 pour le désactiver."
          />
          <Slider
            label="Part des prêts du pôle public bancaire effectivement empruntée"
            valeur={params.partPretsUtilisesPct} min={0} max={100} pas={1}
            onChange={(v) => setParam('partPretsUtilisesPct', v)}
            affichage={`${fmtNombre(params.partPretsUtilisesPct, 0)} %`}
            texteVocal={`${fmtNombre(params.partPretsUtilisesPct, 0)} pour cent des prêts empruntés`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Les prêts du pôle financent 84 % de l’investissement des filières (préréglage complet). S’ils ne trouvent pas preneur, l’investissement correspondant n’a pas lieu : surcroît de PIB, capital et coûts évités baissent d’autant, la bonification aussi ; les subventions de l’État restent dépensées. 100 % par défaut. Repères mesurés en Espagne (Funcas, S19) : environ 27 % de l’enveloppe de prêts européens conservée, faute de demande notamment ; 6,9 M€ de prêts contre 501,7 M€ de subventions sur la ligne 1 du plan de décarbonation de l’industrie. Agit sur les trajectoires seulement."
          />
          <Slider
            label="Durée de montée en charge de l’investissement des filières"
            valeur={params.dureeMonteeInvestissement} min={10} max={30} pas={1}
            onChange={(v) => setParam('dureeMonteeInvestissement', v)}
            affichage={`${fmtNombre(params.dureeMonteeInvestissement, 0)} ans (rythme complet en ${2027 + params.dureeMonteeInvestissement})`}
            texteVocal={`${params.dureeMonteeInvestissement} ans de montée en charge, à partir de 2028`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="L’investissement des filières (surcroît de PIB des filières, capital, coûts évités, part de l’État dans l’investissement, bonification, investissement de substitution) est nul en 2026 et 2027, puis monte linéairement à partir de 2028 : le rythme d’une année vaut le rythme de pleine année multiplié par (année − 2027) / durée, plafonné à 1. Avec 10 ans, environ la moitié du rythme est atteinte en 2032 ; le rythme complet l’est en 2037, au-delà de l’horizon des trajectoires. Même durée pour les 10 filières ; les autres mesures du programme gardent leur calendrier 2027-2030. Repère de long terme : l’objectif de 100 % d’énergies renouvelables en 2060, soit 33 ans après 2027. Repère mesuré en Espagne (Funcas, S19) : fin 2025, 87 % des réformes du plan de relance étaient réalisées, contre 35 % des investissements ; la durée du décalage reste une hypothèse du modèle. Agit sur les trajectoires seulement (aucun effet sur les indicateurs An 1 et année pleine du moteur ni sur la dette en 2032)."
          />
          <Slider
            label="Coût de bonification du pôle public bancaire"
            valeur={params.tauxBonificationPct} min={0} max={8} pas={0.5}
            onChange={(v) => setParam('tauxBonificationPct', v)}
            affichage={`${fmtPct(params.tauxBonificationPct)} (${fmtMd(-bonificationMd, { signe: true })})`}
            texteVocal={`${fmtNombre(params.tauxBonificationPct)} pour cent des prêts du pôle, soit ${fmtNombre(bonificationMd)} milliards d'euros de friction`}
            badge={<Badge statut="hypothese-modele" court />}
            aide={NOTE_BONIFICATION}
          />
          <Slider
            label="Corrélation entre filières (Monte-Carlo, ρ)"
            valeur={rho} min={0} max={0.95} pas={0.05}
            onChange={setRho}
            affichage={fmtNombre(rho, 2)}
            texteVocal={`ρ égal à ${fmtNombre(rho, 2)}`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="0 : filières indépendantes ; proche de 1 : elles évoluent ensemble."
          />
          <h3 className="mb-1 mt-4 text-sm font-bold">Énergie (trajectoires seulement)</h3>
          <Slider
            label="Écart entre prix de marché (tendanciel) et coût complet du nucléaire"
            valeur={params.ecartPrixElectricite} min={0} max={100} pas={1}
            onChange={(v) => setParam('ecartPrixElectricite', v)}
            affichage={`${fmtNombre(params.ecartPrixElectricite, 0)} €/MWh (euros 2027)`}
            texteVocal={`${params.ecartPrixElectricite} euros par mégawattheure, en euros 2027`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Électricité vendue par un monopole public à un prix régulé égal au coût complet du nucléaire historique plus une marge. Écart entre le prix de marché du scénario tendanciel et ce coût complet (61,5 €/MWh courants en 2026-2028, S20), en euros 2027 indexés sur les prix ; 0 par défaut : aucun effet. Le prix régulé n’est jamais supérieur au prix payé sans programme : si le prix de marché est inférieur au coût complet plus la marge, le gain est nul (jamais de hausse de facture) ; il n’y a donc pas d’écart négatif. Le versement nucléaire universel (VNU), qui reverse déjà aux consommateurs une partie de la rente quand les prix sont hauts (S30), est déduit dans le scénario sans programme. Gain par MWh : g = max(0 ; écart − marge − minoration du VNU). Chaque année concernée, la baisse de la facture vaut T = g × 0,451 Md€ (451 TWh, volume supposé constant). Effet sur le PIB : +0,14 × T, d’après une simulation du modèle FR-BDF de la Banque de France sur le bouclier tarifaire (S27) : c’est le résultat d’un modèle, pas une mesure. Il rapporte ensuite des recettes comme tout surcroît de PIB. Effet direct sur le solde : −40 % × T (impôt sur les sociétés d’EDF 25 %, dividende versé à l’État 9 %, TVA 6 %). Le scénario tendanciel ne finance aucun bouclier tarifaire : si le tendanciel avait financé un bouclier comme en 2022, le programme l’économiserait, mais ce gain n’est pas compté. Repères, sans fixer la valeur : coût complet du nucléaire historique selon la CRE, 61,5 €/MWh courants en 2026-2028 et 68,4 € en 2029-2031 (S20), nucléaire seul, le coût moyen de l’ensemble du parc n’étant pas publié ; prix à terme base France au 19/10/2026 : 109,81 €/MWh (2027), 67,98 (2028), 61,12 (2029) (S21). Aucune baisse du prix du gaz n’est modélisée."
          />
          <Slider
            label="Marge du monopole public au-dessus du coût complet"
            valeur={params.margeElectricite} min={0} max={25} pas={0.5}
            onChange={(v) => setParam('margeElectricite', v)}
            affichage={`${fmtNombre(params.margeElectricite, 1)} €/MWh (euros 2027)`}
            texteVocal={`${params.margeElectricite} euros par mégawattheure, en euros 2027`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Le monopole public vend au coût complet du nucléaire historique (61,5 €/MWh courants en 2026-2028, S20) plus cette marge. 16,5 €/MWh par défaut : le prix régulé égale alors le seuil de taxation du VNU du projet d’arrêté, 78 €/MWh (S30), moins 61,5 €/MWh ; la loi impose pour ce seuil le coût complet plus 5 à 25 €/MWh (S30), d’où la plage de 0 à 25. La marge reste à EDF : elle n’est ni une baisse de facture ni une perte de recettes publiques. Sans effet tant que l’écart est nul."
          />
          <Slider
            label="Nombre d’années concernées à partir de 2028"
            valeur={params.anneesEcartElectricite} min={1} max={8} pas={1}
            onChange={(v) => setParam('anneesEcartElectricite', v)}
            affichage={`${fmtNombre(params.anneesEcartElectricite, 0)} an${params.anneesEcartElectricite > 1 ? 's' : ''} (2028-${2027 + params.anneesEcartElectricite})`}
            texteVocal={`${params.anneesEcartElectricite} années à partir de 2028`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="L’écart de prix s’applique de 2028 à 2028 + n − 1 ; 2 par défaut. Sans effet tant que l’écart est nul."
          />
          <div className="pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={params.rachatEngie}
                onChange={(e) => setParam('rachatEngie', e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              Rachat d’Engie en 2028 ({fmtMd(HYPOTHESES.coutRachatEngie.valeur)}, hors prime de contrôle)
            </label>
            <p className="ml-6 mt-1 text-xs text-ink-soft">
              Achat des actions non détenues par l’État : (1 − 22,7 %) × 62 Md€ de capitalisation, soit environ 48 Md€ (sources de marché secondaires, S28 et S29).
              Augmente la dette en 2028 sans toucher au déficit ; les dividendes d’Engie ne sont pas comptés, et le modèle ne calcule aucune charge d’intérêts.
              Hypothèse du modèle : un rachat effectif se ferait probablement avec une prime de contrôle. Agit sur les trajectoires seulement.
            </p>
          </div>
          <h3 className="mb-1 mt-4 text-sm font-bold">Main-d’œuvre, immigration de travail et régularisation (trajectoires seulement)</h3>
          <p className="text-xs text-ink-soft">
            Le surcroît de PIB du programme suppose déjà que tous les emplois créés sont pourvus : les travailleurs immigrés n’ajoutent pas de PIB en plus, ils rendent possible
            celui déjà compté, là où il n’y a pas assez de chômeurs du métier. Les emplois qui ne trouvent ni chômeur ni nouvel arrivant ne sont pas créés, et le PIB correspondant non plus.
            La répartition des emplois de chaque filière entre métiers est une hypothèse de travail, non sourcée (voir la méthodologie).
          </p>
          <Slider
            label="Part des demandeurs d’emploi du métier mobilisables"
            valeur={params.partChomeursMobilisablesPct} min={10} max={50} pas={1}
            onChange={(v) => setParam('partChomeursMobilisablesPct', v)}
            affichage={`${fmtNombre(params.partChomeursMobilisablesPct, 0)} %`}
            texteVocal={`${fmtNombre(params.partChomeursMobilisablesPct, 0)} pour cent des demandeurs d'emploi mobilisables`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Part des demandeurs d’emploi en catégories ABC de chaque groupe de métiers (DARES, 09/2026) qui peuvent occuper les emplois créés (compétences, mobilité géographique, chômage de longue durée). Au-delà de cette réserve, les emplois directs manquants sont pourvus par une immigration de travail ou ne sont pas créés. Repères, sans fixer la valeur : 12,9 % des demandeurs d’emploi accèdent à un emploi durable dans les 6 mois (France Travail) ; environ 34 % : les chômeurs au sens du BIT représentent 45 % des inscrits en catégories ABC, et 75 % d’entre eux ne sont pas chômeurs de longue durée ; 53,4 % des inscrits en catégories ABC le sont depuis moins d’un an (DARES, 09/2026). 25 % par défaut, réglable de 10 à 50 %. Seule la part directe des emplois (65 % au multiplicateur de référence) est soumise à cette contrainte."
          />
          <Slider
            label="Emplois manquants pourvus par une nouvelle immigration de travail"
            valeur={params.partEmploisManquantsImmigrationPct} min={0} max={100} pas={1}
            onChange={(v) => setParam('partEmploisManquantsImmigrationPct', v)}
            affichage={`${fmtNombre(params.partEmploisManquantsImmigrationPct, 0)} %`}
            texteVocal={`${fmtNombre(params.partEmploisManquantsImmigrationPct, 0)} pour cent des emplois manquants pourvus par une nouvelle immigration de travail`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Part des emplois que les chômeurs mobilisables ne peuvent pas pourvoir et qui le sont par des travailleurs immigrés, arrivés en plus des 150 000 par an du scénario central de l’Insee. Le reste n’est pas créé : le surcroît de PIB, les coûts évités et le capital correspondants disparaissent, sans effet sur les dépenses de l’État ni sur la bonification. Le stock de migrants nets supplémentaires vaut les travailleurs immigrés ÷ 0,7 (Insee, projections de population active 2022) ; chacun coûte 21 300 € par an en euros 2025, indexés sur le PIB tendanciel (dépense publique variable par habitant, méthode centrale de l’OCDE ; fourchette de 14 900 € à 23 900 €), alors que ses recettes passent déjà par les recettes sur le surcroît de PIB. 100 % par défaut."
          />
          <Slider
            label="Personnes régularisées"
            valeur={params.effectifRegularisation} min={0} max={700000} pas={10000}
            onChange={(v) => setParam('effectifRegularisation', v)}
            affichage={`${fmtNombre(params.effectifRegularisation, 0)} personnes`}
            texteVocal={`${fmtNombre(params.effectifRegularisation, 0)} personnes régularisées à partir de 2028`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Régularisation à partir de 2028. 410 000 par défaut : environ 58 % des 700 000 personnes en situation irrégulière estimées par le ministère de l’intérieur (Sénat). Cette part est celle de l’Espagne : 578 375 personnes régularisées en 2005 pour environ 1 million en situation irrégulière (Monras et al.) ; en 2026, 500 000 bénéficiaires prévus pour 840 000 personnes en situation irrégulière, soit environ 60 % (Funcas, presse). Limites : rapportée à la population, la référence espagnole donnerait environ 906 000 personnes, plus que toute la population irrégulière estimée ; le programme vise les travailleurs, étudiants et parents d’enfants scolarisés sans papiers, sans effectif chiffré, et aucune estimation de ces sous-groupes n’existe. Recettes : 61,9 % en emploi (Insee) × 55 % des cotisations d’un cotisant moyen (Espagne, 2005) × 14 570 € par emploi, soit environ 4 960 € par personne en 2025 et environ 2,0 Md€ pour 410 000 personnes. Aucun effet sur le PIB ; aucune dépense nouvelle modélisée (transfert de l’aide médicale de l’État vers la protection universelle maladie déjà dépensé ; droits nouvellement ouverts non chiffrés faute de source). La régularisation ne s’ajoute pas à la population."
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold">Paramètres en lecture seule</h3>
          <ul className="space-y-1.5 text-sm">
            {lecture.map((k) => (
              <li key={k} className="flex flex-wrap items-center justify-between gap-2">
                <span>{HYPOTHESES[k].libelle}</span>
                <span className="flex items-center gap-2">
                  <span className="nombre font-medium">
                    {fmtValeurUnite(HYPOTHESES[k].valeur, HYPOTHESES[k].unite)}
                  </span>
                  <Badge statut={HYPOTHESES[k].statut} court />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
