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
            aide="Valeur d’origine : 14 Md€. Proportionnel au multiplicateur, réduit en An 1."
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
            aide="Option : capacités de production créées par les investissements des filières. Chaque euro investi ajoute ce montant au PIB chaque année, dès l’année suivante et sans usure. 0 par défaut (effet de demande seul) : une partie des investissements de transition remplace des équipements existants sans accroître les capacités, et la productivité pourrait ralentir vers 2030 (Pisani-Ferry et Mahfouz). Repère pour tester une valeur positive : FMI, +0,4 % de PIB la première année et +1,5 % à quatre ans par point de PIB investi."
          />
          <Slider
            label="Report de la demande vers des produits français"
            valeur={params.substitutionImports} min={0} max={2} pas={0.1}
            onChange={(v) => setParam('substitutionImports', v)}
            affichage={`${fmtNombre(params.substitutionImports, 1)} point d’importations en moins par point de PIB investi`}
            texteVocal={`${fmtNombre(params.substitutionImports, 1)} point de part importée en moins par point de PIB de capital`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Option : les investissements des filières qui produisent des biens échangeables (automobile, industrie, agriculture, mer, numérique) permettent d’acheter en France ce qui était importé. Chaque point de PIB de capital installé par ces filières fait baisser de ce nombre de points la part importée de la demande créée par le programme (22 % en 2019, Banque de France), dès l’année suivante. Garde-fous automatiques : le bâtiment, l’énergie, le rail, l’eau et le spatial sont exclus (biens non échangeables, ou importations évitées déjà comptées dans les coûts évités) ; la part importée ne descend pas sous 11 % (son niveau de 1965) ; si l’effet durable est aussi activé, seul le plus grand des deux gains compte. 0 par défaut, faute de source pour chiffrer cet effet."
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
            label="Écart entre prix de marché (tendanciel) et coût moyen de production"
            valeur={params.ecartPrixElectricite} min={-20} max={100} pas={1}
            onChange={(v) => setParam('ecartPrixElectricite', v)}
            affichage={`${fmtNombre(params.ecartPrixElectricite, 0, true)} €/MWh (euros 2027)`}
            texteVocal={`${params.ecartPrixElectricite} euros par mégawattheure, en euros 2027`}
            badge={<Badge statut="hypothese-modele" court />}
            aide="Électricité vendue par un monopole public à un prix régulé égal au coût moyen de production. Écart entre le prix de marché du scénario tendanciel et ce coût moyen, en euros 2027 indexés sur les prix ; 0 par défaut : aucun effet ; négatif : les consommateurs paieraient plus, effet symétrique. Chaque année concernée, la baisse de la facture vaut T = écart × 0,451 Md€ (451 TWh, volume supposé constant). Effet sur le PIB : +0,14 × T, d’après une simulation du modèle FR-BDF de la Banque de France sur le bouclier tarifaire (S27) : c’est le résultat d’un modèle, pas une mesure. Il rapporte ensuite des recettes comme tout surcroît de PIB. Effet direct sur le solde : −40 % × T (impôt sur les sociétés d’EDF 25 %, dividende versé à l’État 9 %, TVA 6 %). Le scénario tendanciel ne finance aucun bouclier tarifaire : si le tendanciel avait financé un bouclier comme en 2022, le programme l’économiserait, mais ce gain n’est pas compté. Repères, sans fixer la valeur : coût complet du nucléaire existant selon la CRE, 61,5 €/MWh courants en 2026-2028 et 68,4 € en 2029-2031 (S20), nucléaire seul, le coût moyen de l’ensemble du parc n’étant pas publié ; prix à terme base France au 19/10/2026 : 109,81 €/MWh (2027), 67,98 (2028), 61,12 (2029) (S21)."
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
