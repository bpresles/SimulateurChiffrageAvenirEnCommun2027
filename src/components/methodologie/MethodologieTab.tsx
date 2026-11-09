import type { ReactNode } from 'react'
import { HYPOTHESES } from '../../data/hypotheses'
import { DATE_VERIFICATION, PLANS_THEMATIQUES_URL, SOURCES, STATUTS, type SourceId, type StatutFiabilite } from '../../data/sources'
import { NOTE_BONIFICATION, NOTE_SECTEURS } from '../../data/poleBancaire'
import { fmtMd, fmtValeurUnite } from '../../lib/format'
import type { CleCorrection } from '../../model/types'
import type { Modele } from '../../state/useModele'
import { MENTION_INDEPENDANCE } from '../layout/PiedDePage'
import { Badge } from '../ui/Badge'
import { Avertissement, Carte } from '../ui/Carte'
import { RefSources } from '../ui/RefSources'

const CORRECTIONS: Record<CleCorrection, { titre: string; texte: string }> = {
  bonification: {
    titre: 'Bonification du Pôle bancaire : double compte supprimé',
    texte: 'Le levier primaire à 0 % comptait 8 Md€ en gain alors que la bonification est déjà une friction évitée. Seuls 6,5 Md€ restent en gain ; la bonification est comptée en friction aussi en An 1 (au prorata de la montée en charge).',
  },
  cades: {
    titre: 'CADES : exclusion du solde consolidé (désactivée par défaut)',
    texte: 'Désactivée par défaut : la réaffectation est comptée dans le solde, comme le chiffre le programme (S6). En lecture APU consolidée, la CRDS est déjà une recette de la trajectoire de base : la réaffecter ne crée pas de recette publique, c’est un gain pour la Sécurité sociale. Décocher « Compter la réaffectation CADES » applique cette correction. L’impact affiché est celui qu’aurait son activation.',
  },
  coutsEvites: {
    titre: 'Coûts évités : seule une part est budgétaire',
    texte: 'Les coûts évités n’étaient pas tous des recettes publiques (santé sur l’Assurance maladie, factures d’énergie des ménages, importations). Seule une part (25 % par défaut) est comptée.',
  },
  effetRecessif: {
    titre: 'Effet récessif des prélèvements nouveaux',
    texte: 'Le modèle d’origine ignorait l’effet sur l’activité des prélèvements nouveaux (hors bascule des mutuelles), alors qu’il comptait les retours de l’investissement. Effet symétrique, avec un taux de retour fiscal de 0,35.',
  },
}

function Tableau({ colonnes, children, legende }: { colonnes: string[]; children: ReactNode; legende: string }) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={`${legende}, défilement horizontal possible`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{legende}</caption>
        <thead>
          <tr className="border-b-2 border-line bg-surface-alt">
            {colonnes.map((c) => <th key={c} scope="col" className="px-2 py-2 font-bold">{c}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

const Eq = ({ children }: { children: ReactNode }) => <pre className="nombre overflow-x-auto rounded-lg bg-surface-alt p-3 text-xs leading-relaxed">{children}</pre>

export function MethodologieTab({ modele }: { modele: Modele }) {
  const { impacts, resultat } = modele
  const totalCorr = impacts.filter((i) => i.active).reduce((s, i) => s + i.marginal, 0)
  return (
    <div className="space-y-5">
      <Carte>
        <h2 className="text-xl font-extrabold">Méthodologie et sources</h2>
        <p className="mt-2 max-w-4xl text-sm text-ink-soft">
          Cette page décrit le moteur de calcul, toutes ses hypothèses, les corrections apportées au modèle d’origine et ses limites. Les affirmations rapportées sont
          attribuées au programme ; l’outil n’en garantit pas l’exactitude. <strong>{MENTION_INDEPENDANCE}</strong>
        </p>
      </Carte>

      <Avertissement titre="Origine des chiffres">
        <p>
          Vérification effectuée le {DATE_VERIFICATION} sur melenchon2027.fr. Le cadrage budgétaire 2027 (S1), les tableaux des livrets BTP/logement (S2) et automobile (S3),
          les ressources du pôle public bancaire (S4), le montant de la CADES (S6) et les titres publics français détenus par l’Eurosystème (S8, S9, données BCE à fin octobre 2026) sont repris des documents officiels ; la Banque de France (S7) sert de source complémentaire. Les données macroéconomiques des trajectoires (PIB, recettes publiques, croissance,
          inflation, déficit et dette 2026) proviennent de l’Insee (S10 à S12), de la Banque de France (S13) et du projet de loi de finances 2027 (S14), consultés le 09/11/2026.
          L’effet durable des investissements (2 % par an par défaut) et le report de la demande vers des produits français (0,45 par défaut) sont des valeurs dérivées par cet outil à partir de sources (S15 à S18, S31 à S37) : ce sont des hypothèses de modélisation, détaillées plus bas. Les demandeurs d’emploi par métier (S38) et les projets de recrutement (S39) sont des données brutes officielles ; la contrainte de main-d’œuvre, l’immigration de travail et la régularisation (S40 à S50) reposent sur des paramètres de modélisation. Pisani-Ferry et Mahfouz (S17) et la DG Trésor (S35) justifient que les investissements de substitution n’y contribuent pas ; le FMI (S15) et Bom et Ligthart (S16) donnent des repères.
          La part étrangère de la demande intérieure finale (22 % en 2019, 11 % en 1965) provient de la Banque de France (S18). Les montants des 8 autres filières, les retours
          sectoriels (directs, indirects, coûts évités), les emplois hors livrets, les montants des leviers monétaires hors CADES et les montants d’année pleine restent des
          estimations non sourcées, produites avec un assistant IA. Les fourchettes attribuées à des instituts ne figurent pas sur le site et n’ont pas été vérifiées.
        </p>
      </Avertissement>

      <Carte titre="Registre des sources officielles">
        <ul className="space-y-2 text-sm">
          {(Object.keys(SOURCES) as SourceId[]).map((id) => {
            const so = SOURCES[id]
            return (
              <li key={id} className="flex flex-wrap items-baseline gap-x-2">
                <RefSources refs={[id]} />
                <span>{so.titre}, {so.date}</span>
                <a href={so.url} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-brand underline">{so.url}</a>
                {so.precision && <span className="basis-full text-xs text-ink-soft">{so.precision}</span>}
                {so.urlHistorique && (
                  <span className="basis-full text-xs text-ink-soft">
                    Historique (CSV) : <a href={so.urlHistorique} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{so.urlHistorique}</a>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
        <p className="mt-2 text-xs text-ink-soft">
          Plans thématiques (ESR, ruralités) : <a href={PLANS_THEMATIQUES_URL} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{PLANS_THEMATIQUES_URL}</a> (aucun montant utilisé par le modèle).
          Vérification des chiffres : {DATE_VERIFICATION}.
        </p>
      </Carte>

      <Carte titre="Statuts de fiabilité">
        <ul className="space-y-2 text-sm">
          {(Object.keys(STATUTS) as StatutFiabilite[]).map((s) => (
            <li key={s} className="flex flex-wrap items-start gap-2"><Badge statut={s} /><span className="text-ink-soft">{STATUTS[s].description}</span></li>
          ))}
        </ul>
      </Carte>

      <Carte titre="Équations du moteur">
        <p className="mb-2 text-sm text-ink-soft">
          Unités : Md€/an. Le solde est la variation du solde des administrations publiques (consolidé) par rapport à la trajectoire sans réforme. Aucun arrondi intermédiaire.
          Le simulateur affiche l’année pleine (AP) ; les composantes de première année (AP faux : montée en charge partielle) ne sont pas un horizon à choisir, elles donnent l’année 2027 de la trajectoire. mult = multiplicateur ; ratio = mult / 1,45.
        </p>
        <Eq>{`Dépenses       = 81,7 + (AP ? max(0 ; État_filières − 10) + 85 : 0)
Recettes cadrage = 106,4 × recouvrement
Recettes AP    = AP ? 84 × recettesAP% × (0,85 + 0,15 × recouvrement) : 0
Retours courants = base × (AP ? 1 : 10,5/14) × ratio
ROI direct     = Σ direct_filières × échelle + retours courants   (échelle = AP ? 1 : 0,42)
ROI indirect   = Σ indirect_filières × échelle
Coûts évités   = Σ évités_filières × échelle × part budgétaire
Effet récessif = − multiplicateurPrélèvements × (Recettes cadrage + Recettes AP × 61/84) × 0,35
Gel BCE        = AP ? 22 × gel : 0
CADES (comptée)= AP ? 19 × cades : 0 (par défaut) ; 0 si l’option « compter la CADES » est décochée
Primaire BCE   = 6,5 × primaire × (AP ? 1 : 0,5)
Circuit Trésor = 8,5 × trésor × (AP ? 1 : 0,5)
Fuite import   = max(2,5 ; (1,85 − mult) × 8)
Bonification   = Banque × taux × (1 − primaire) × échelle   (taux : 0 % par défaut, réglable de 0 à 8 %)
Frictions      = AP ? bonification + (1 − trésor) × 11 + fuite : fuite × 0,6 + bonification
Solde = Recettes − Dépenses + ROI direct + ROI indirect + Coûts évités
        + Effet récessif + Leviers − Frictions`}</Eq>
        <p className="mt-3 text-sm text-ink-soft">
          <strong>Filières.</strong> Investissement par filière interpolé linéairement entre P10, P50 et P90 pour un percentile donné (même percentile pour toutes). Les retours indirects sont
          proportionnels au ratio ; les coûts évités à (0,7 + 0,3 × ratio) ; les emplois à (0,65 + 0,35 × ratio).
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          <strong>Monte-Carlo.</strong> 5 000 tirages avec un générateur à graine fixe (résultats reproductibles). Chaque filière suit une loi split-normale calée exactement sur ses P10, P50 et P90
          (σ bas = (P50 − P10)/1,2816 ; σ haut = (P90 − P50)/1,2816 ; valeur bornée à 0). Les filières sont corrélées par un facteur commun (z = √ρ·zc + √(1−ρ)·e, ρ = 0,5 par défaut).
          Le Monte-Carlo ne porte que sur le volume d’investissement des filières ; les autres paramètres sont ceux des curseurs. Le P10 du total n’est pas la somme des P10 sectoriels.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          <strong>Trajectoire 2026-2035 (euros courants ; mandat 2027-2032, puis trois ans pour voir la fin de la montée en charge).</strong> Scénario tendanciel : PIB⁰<sub>t</sub> = PIB⁰<sub>t−1</sub> × (1 + g<sub>t</sub>)(1 + π), avec
          PIB⁰<sub>2025</sub> = 2 991,1 Md€ (S10), g<sub>t</sub> = croissance réelle (0,4 % en 2026, S12, S13 ; 0,9 % en 2027 et 1,2 % en 2028, S13 ; puis 1,2 % par an par défaut,
          réglable) et π = inflation (1,5 %, S13, S14, réglable) ; recettes⁰<sub>t</sub> = 52,2 % × PIB⁰<sub>t</sub> (S11) ;
          dépenses⁰<sub>t</sub> = (52,2 % + 5,4 %) × PIB⁰<sub>t</sub> × (1 + e)<sup>t−2026</sup> (S1, S14), e = écart entre la croissance des dépenses et celle du PIB
          (0 par défaut, réglable de −2 à +2 points par an). À écart nul, le déficit tendanciel reste à 5,4 % du PIB chaque année : le simulateur ne reprend pas la baisse
          prévue par le PLF 2027 (5,0 % en 2027, S14), qui est une prévision du gouvernement et suppose les mesures d’économies de ce budget.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Programme : chaque montant du moteur (euros 2027) est nul en 2026, égal à l’An 1 en 2027, interpolé linéairement en 2028-2029, égal à l’année pleine dès 2030 (sauf les flux liés à l’investissement des filières, nuls en 2026-2027 puis étalés sur D ans à partir de 2028, voir ci-dessous),
          puis multiplié par (1 + π)<sup>t−2027</sup>. Surcroît de PIB : ΔPIB<sub>t</sub> = investissements des filières × multiplicateur + retours sur dépenses courantes ÷ 0,35
          + effet récessif ÷ 0,35 + r × K<sub>t−1</sub> × (1 + π)<sup>t−2027</sup> + report de la demande ; PIB<sub>t</sub> = PIB⁰<sub>t</sub> + ΔPIB<sub>t</sub>. Effet d’offre (option) : K<sub>t</sub> = K<sub>t−1</sub> + I<sub>t</sub>
          est le capital accumulé par les filières (euros 2027, sans usure, K<sub>2026</sub> = 0), I<sub>t</sub> leur investissement de l’année (même montée en charge que les
          flux liés à l’investissement, voir ci-dessous) et r le PIB supplémentaire par an par euro de capital (hypothèse de modélisation, réglable de 0 à 20 %), à partir de l’année suivant l’investissement.
          r vaut 2 % par an par défaut, valeur dérivée par cet outil ; c’est un rendement net de la dépréciation, ce qui justifie l’absence d’usure dans K. Toutes les filières montent en charge
          au même rythme : leur capital reste dans une proportion fixe du capital total, et un r unique égal à la moyenne des rendements par filière, pondérée par leur investissement d’année pleine,
          équivaut exactement à un rendement propre à chaque filière. Calcul sur l’investissement d’année pleine du P50 (119,7 Md€). (1) Filières qui ajoutent des capacités de production de biens échangeables
          (automobile, industrie, agriculture, mer, numérique : 27,7 Md€, soit 23,1 %) : rendement net du capital privé de 6,5 % par an, excédent net d’exploitation ÷ actifs fixes nets des sociétés non financières
          en 2024 (199,6 ÷ 3 083,8 Md€ ; 5,5 % en 2022 et 7,0 % en 2023 ; Insee, tableaux 7.101 et 8.202, S31). Repère : Caselli et Feyrer (S32, tableau II) trouvent une productivité marginale du capital des pays riches
          de 7,5 à 12,6 % brute selon les corrections, avec une dépréciation de 6 %, soit environ 1,5 à 6,6 % nette. (2) Rail (14 Md€, soit 11,7 %) : rendement net du capital public de 4,7 %, soit une élasticité de la production
          au capital public de 0,065 (bas de la fourchette 0,065-0,12 de Ramey, S33) ÷ un capital public net de 59,3 % du PIB (actifs fixes nets des administrations publiques en 2024 : 1 732,2 Md€ pour un PIB de 2 919,9 Md€, Insee,
          tableaux 8.204 et 1.101, S31), soit 11,0 % brut, moins une dépréciation de 6,3 % (consommation de capital fixe des administrations publiques en 2023 : 108 Md€ sur 1 701,8 Md€ d’actifs nets, FIPECO d’après l’Insee, S36).
          (3) BTP (rénovation, logements), énergie, eau, spatial et recherche : 0, par prudence. La rénovation et les renouvelables remplacent des équipements existants et leurs gains (énergie importée évitée) figurent
          déjà dans les coûts évités ; Pisani-Ferry et Mahfouz (S17) et la DG Trésor (S35) jugent que ces investissements de substitution n’augmentent pas le potentiel de croissance (la DG Trésor note que ses investissements de transition
          ne servent « a priori » pas à augmenter significativement la production). Les réseaux d’eau sont surtout des réfections ; les logements neufs produisent un service de logement, mais aucun rendement sourcé n’est retenu ici (piste à documenter).
          Résultat : r = 0,231 × 6,5 % + 0,117 × 4,7 % = 1,50 + 0,55, soit environ 2 %. Fourchette de lecture : 1 % (prudente) à 3 % (capital public à l’élasticité de 0,083 de Bom et Ligthart, S16, eau comprise).
          Recoupement : dans le modèle QUEST de la Commission européenne (Pfeiffer, Varga et in ’t Veld, S34), l’investissement NGEU (environ 4 % du PIB de l’UE) relève le PIB de l’UE de 0,7 % en 2030 et de 0,4 % en 2040
          (0,3 et 0,2 si le capital public est peu productif ; France : +0,4 % en 2030, dont 0,1 point de retombées des autres pays, et +0,2 % en 2040), avec une élasticité de 0,12 et une dépréciation de 5 % ;
          ces chiffres incluent l’effet de demande et ne se convertissent pas directement en r. Avec r = 2 % et α = 0,45, le garde-fou de non-cumul retient l’effet d’offre et écarte le report de la demande.
          Autres repères : selon le FMI (S15), 1 point de PIB d’investissement public augmente le PIB de 0,4 % la même année et de 1,5 % à quatre ans ;
          Bom et Ligthart (S16) estiment l’élasticité de la production au capital public à 0,083 à court terme et 0,122 à long terme. Ici, 1 point de PIB investi chaque année
          augmente le PIB de 1,45 % chaque année à r = 0 (multiplicateur seul), d’environ 1,5 % la quatrième année à r = 2 % (valeur par défaut) et d’environ 1,6 % à r = 5 % (calculs non directement comparables). Effet sur le solde : effet<sub>t</sub> = prélèvements nouveaux × PIB<sub>t</sub> ÷ PIB⁰<sub>2027</sub>
          + θ × ΔPIB<sub>t</sub> + coûts évités + leviers − dépenses nouvelles − frictions, θ = recettes publiques par euro de PIB supplémentaire (35 % par défaut, réglable de 20 à 55 %).
          Le terme θ × ΔPIB remplace les retours directs et indirects des filières, les retours sur dépenses courantes et l’effet récessif du moteur, pour ne rien compter deux fois ;
          à θ = 35 %, les deux derniers sont identiques à ceux du moteur. Il porte aussi sur l’effet d’offre : la production des capacités nouvelles rapporte des recettes au même taux.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Report de la demande vers des produits français (option, réindustrialisation) : μ<sub>t</sub> = max(μ<sub>min</sub> ; μ<sub>0</sub> − α × K<sup>éch</sup><sub>t−1</sub> × (1 + π)<sup>t−2027</sup> ÷ PIB⁰<sub>t</sub>)
          est la part importée de la demande créée par le programme, μ<sub>0</sub> = 22 % (part étrangère de la demande intérieure finale en 2019, Banque de France, S18),
          μ<sub>min</sub> = 11 % (son niveau de 1965, S18), K<sup>éch</sup> le capital accumulé par les seules filières de biens échangeables (automobile, industrie,
          agriculture, mer, numérique ; même calcul que K) et α la baisse de la part importée, en point, par point de PIB de capital (hypothèse de modélisation, 0,45 par défaut,
          réglable de 0 à 2 par pas de 0,05). Report<sub>t</sub> = [(1 − μ<sub>t</sub>) ÷ (1 − μ<sub>0</sub>) − 1] × (investissements des filières × multiplicateur + retours sur dépenses
          courantes ÷ 0,35 + effet récessif ÷ 0,35) : la demande déjà créée par le programme est davantage servie par la production française, sans gain de capacité supposé,
          mais sans s’ajouter à l’effet d’offre (non-cumul, ci-dessous). Garde-fous automatiques : le BTP et l’énergie sont exclus, car leurs importations évitées figurent déjà dans les coûts évités ;
          le rail, l’eau et le spatial aussi, car leur capital ne produit pas de biens échangeables ; le plancher μ<sub>min</sub> limite le report à environ +14 % de cette demande ;
          si l’effet d’offre et le report sont tous deux positifs, seul le plus grand est retenu, car ils peuvent décrire la même production nouvelle. Approximation au premier
          ordre : la fuite commerciale du moteur (frictions) n’est pas modifiée. Aucune source ne chiffre α directement ; dérivation : α = (1 point de PIB en Md€) × (valeur ajoutée ÷ capital brut de l’industrie manufacturière) × (gain de « made in France » par Md€ de valeur ajoutée relocalisée).
          1 point de PIB 2024 = 29,2 Md€ (Insee). Industrie manufacturière (branches C10 à C33) en 2024 : capital fixe brut de 724,6 Md€, valeur ajoutée de 279,3 Md€, soit 0,385 (Insee, tableaux 6.401 à 6.460 et 6.201, S31) ; le capital brut est retenu
          parce que du capital neuf se valorise au coût de remplacement. Banque de France, document de travail 992, tableau 1 (S18) : 1 Md€ de valeur ajoutée industrielle implantée en France plutôt qu’à l’étranger augmente la valeur ajoutée française de 2,0 Md€
          (dont 1,0 Md€ chez les fournisseurs) et le « made in France » de 0,039 point (de 0,016 pour la chimie à 0,082 pour l’agroalimentaire), avec une demande totale inchangée, sans contrainte d’offre et sans prise en compte de l’investissement initial.
          α = 29,2 × 0,385 × 0,039 ≈ 0,44, arrondi à 0,45 ; fourchette de lecture de 0,2 (chimie) à 0,9 (capital net : rapport de 0,765, capital net de 365,2 Md€). Limites : pleine utilisation des capacités, importations remplacées une pour une ;
          le gain mesuré sur toute la demande est appliqué à la seule demande du programme ; le report et l’effet d’offre décrivent en partie la même production (d’où le non-cumul). Repère signalé : le contenu en importations de l’investissement
          (formation brute de capital fixe, stocks et objets de valeur) était de 32,3 % en 2015, contre 24,6 % pour l’ensemble de la demande finale (Insee, « made in France », tableau T13, S37) ; la part importée de départ de 22 % (S18) est peut-être
          basse pour une demande surtout faite d’investissement (piste, sans effet sur le modèle).
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Réalisation de l’investissement (options) : x est la part des prêts du pôle public bancaire effectivement empruntée (100 % par défaut, réglable de 0 à 100 %).
          Dans chaque filière, l’investissement réalisé vaut investissement − (1 − x) × prêts du pôle ; le surcroît de PIB des filières, le capital K, K<sup>éch</sup> et les
          coûts évités (au prorata de l’investissement réalisé de chaque filière) en découlent, et la bonification est multipliée par x. Les subventions de l’État restent
          dépensées (choix prudent). Le moteur n’est pas modifié : les emplois et le solde du moteur supposent toujours tous les prêts empruntés. Les flux liés
          à l’investissement des filières (surcroît de PIB des filières, I<sub>t</sub>, capital, coûts évités, part de l’État dans l’investissement, bonification, investissement de substitution)
          sont nuls en 2026 et 2027, puis montent linéairement à partir de 2028 : année pleine × min(1 ; (t − 2027) ÷ D), D étant la durée de montée en charge
          (10 ans par défaut, réglable de 10 à 30 ; hypothèse de modèle, justifiée et référencée dans le tableau des hypothèses, entrée « durée de montée en charge de l’investissement des filières ») ;
          les autres montants (prélèvements, dépenses courantes, leviers) gardent l’année pleine en 2030. Repères mesurés
          en Espagne (Funcas, S19) : environ 27 % de l’enveloppe de prêts européens conservée (22,7 sur 83,2 Md€), 35 mesures abandonnées faute de demande ; fin 2025,
          87 % des réformes réalisées contre 35 % des investissements.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Électricité à prix régulé (option, écart nul par défaut) : l’électricité est vendue par un monopole public à un prix égal au coût complet du nucléaire historique plus une marge. Tout est exprimé en écart au coût complet
          (61,5 €/MWh courants en 2026-2028, 68,4 en 2029-2031 ; 60,3 et 63,4 €2026/MWh ; CRE, S20), en euros 2027 indexés sur les prix. Notations : e = écart entre le prix de marché du scénario tendanciel et le coût complet (€/MWh, de 0 à 100) ;
          m = marge du monopole (16,5 €/MWh par défaut, réglable de 0 à 25) ; s<sub>1</sub> = 78 − 61,5 = 16,5 et s<sub>2</sub> = 110 − 61,5 = 48,5 €/MWh, les tarifs de taxation et d’écrêtement du versement nucléaire universel (VNU) du projet d’arrêté soumis à la CRE
          (S30) exprimés en écart au coût complet ; k = 362 ÷ 451 ≈ 0,80, la part du nucléaire historique dans la consommation (362 TWh de production retenue par la CRE en moyenne sur 2026-2028, S20 ; 451 TWh consommés en 2025, S22).
          Depuis le 01/01/2026, le VNU taxe 50 % des revenus du parc nucléaire historique d’EDF au-delà du seuil de taxation et 90 % au-delà du seuil d’écrêtement, puis les reverse à tous les consommateurs (S30). Dans le scénario sans programme,
          la minoration de la facture par MWh consommé vaut donc v(e) = k × [0,5 × min(max(e − s<sub>1</sub>, 0), s<sub>2</sub> − s<sub>1</sub>) + 0,9 × max(e − s<sub>2</sub>, 0)]. Le consommateur y paie P − v ; avec le programme, il paie min(coût complet + m, P − v) :
          le prix régulé n’est jamais supérieur au prix sans programme. Le gain par MWh est g = max(0, e − m − v(e)) : si le prix de marché est inférieur au coût complet plus la marge, le gain est nul, jamais négatif, et un écart négatif n’a aucun effet
          (l’effet n’est pas symétrique). La marge reste à EDF : ce n’est ni une baisse de facture ni une perte de recettes publiques. L’effet s’applique de 2028 à 2028 + n − 1 (n = 2 par défaut, réglable de 1 à 8).
          Pour chaque année concernée, la baisse de la facture des consommateurs vaut T<sub>t</sub> = g × 0,451 Md€ × (1 + π)<sup>t−2027</sup> (451 TWh supposés constants). Surcroît de PIB : ΔPIB<sub>t</sub> = 0,14 × T<sub>t</sub>,
          effet de niveau limité aux années concernées, issu d’une simulation du modèle FR-BDF de la Banque de France sur le bouclier tarifaire (S27) : c’est un résultat de modèle, pas une mesure. Il s’ajoute aux autres composantes de ΔPIB
          et passe donc par θ × ΔPIB (recettes sur le surcroît d’activité). Effet direct sur le solde : −40 % × T<sub>t</sub>, somme de trois pertes de recettes : impôt sur les sociétés d’EDF (25 %),
          dividende versé à l’État (9 % : 12 % du résultat net après impôt, S24, S25) et TVA sur la part des ménages (6 % : 20 % × 144,2 TWh ÷ 451 TWh, S26, S22). Justification : par rapport au scénario sans programme, le résultat d’EDF baisse de T
          (EDF ne paie plus la taxe VNU, qui était reversée aux consommateurs et neutre pour le solde public).
          Approximations : le coût complet du nucléaire est appliqué à toute la consommation (le coût moyen de l’ensemble du parc n’est pas publié) ; les seuils du VNU sont supposés suivre le coût complet (la loi les révise tous les trois ans en fonction de ce coût) ;
          la minoration est calculée sur la consommation annuelle (le projet de décret ne la vise que d’avril à octobre, sans changer le montant total) ; la taxe VNU est traitée comme neutre pour le solde public ; les tarifs de 78 et 110 €/MWh sont ceux du projet d’arrêté, non de l’arrêté définitif.
          Repères, sans fixer la valeur : prix à terme base France au 19/10/2026 : 109,81, 67,98 et 61,12 €/MWh pour 2027, 2028 et 2029 (S21).
          Le scénario sans programme ne finance aucun bouclier tarifaire ; si le tendanciel en avait financé un comme en 2022, le programme l’économiserait, mais ce gain n’est pas compté.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Rachat d’Engie (option, coché par défaut) : en 2028, l’État achète les actions qu’il ne détient pas, soit (1 − 22,7 %) × 62 Md€ ≈ 48 Md€ (part de l’État de 22,7 % après l’augmentation de capital de 02/2026, S28 ;
          capitalisation retenue de 62 Md€ dans une fourchette de 61 à 64 Md€, S29). Ces deux sources sont des sources de marché secondaires. Le montant est ajouté à la dette de 2028 : dette<sub>2028</sub> = dette<sub>2027</sub> − solde<sub>2028</sub> + 48 Md€.
          L’achat de titres n’entre pas dans le déficit. Le calcul est hors prime de contrôle : une offre publique d’achat se paierait en général plus cher. Les dividendes d’Engie ne sont pas comptés, et le modèle ne calcule aucune
          charge d’intérêts : la dette supplémentaire n’en porte pas.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Main-d’œuvre et immigration de travail (trajectoires seulement ; décision d’ajout du 09/11/2026). Principe : le surcroît de PIB du programme suppose déjà que tous les emplois créés sont pourvus. Les travailleurs immigrés
          n’ajoutent donc pas de PIB en plus : ils rendent possible celui déjà compté, là où il n’y a pas assez de chômeurs du métier. Les emplois qui ne trouvent ni chômeur ni nouvel arrivant ne sont pas créés, et le PIB correspondant non plus.
          Emplois : E<sub>f,t</sub> = emplois d’année pleine de la filière f (moteur) × part de l’investissement réalisée (même règle que x) × min(1 ; (t − 2027) ÷ D). Seule la part directe est soumise à la contrainte :
          d = f<sub>j</sub> ÷ (f<sub>j</sub> + (1 − f<sub>j</sub>) × mult ÷ 1,45), avec f<sub>j</sub> = 0,65 ; le reste, induit par le multiplicateur, est supposé pourvu par des chômeurs de l’ensemble de l’économie, sans contrainte.
          Emplois directs à pourvoir par groupe de métiers g : J<sub>g,t</sub> = Σ<sub>f</sub> d × E<sub>f,t</sub> × part<sub>f,g</sub>. Réserve de chômeurs : k × DE<sub>g</sub>, avec DE<sub>g</sub> les demandeurs d’emploi en catégories ABC du groupe g
          (stock fixe de 09/2026, France métropolitaine, DARES, S38 ; 17 groupes de domaines ROME, voir <code>src/data/metiers.ts</code>) et k réglable de 10 à 50 % (25 % par défaut). Manque : M<sub>g,t</sub> = max(0 ; J<sub>g,t</sub> − k × DE<sub>g</sub>),
          G<sub>t</sub> = Σ<sub>g</sub> M<sub>g,t</sub>. Travailleurs immigrés : W<sub>t</sub> = φ × G<sub>t</sub> ; emplois non créés : N<sub>t</sub> = (1 − φ) × G<sub>t</sub> ; migrants nets supplémentaires (stock) :
          P<sub>t</sub> = W<sub>t</sub> ÷ 0,7 (variante de l’Insee à +50 000 migrants par an : environ 650 000 actifs supplémentaires en 2040, soit 0,68 à 0,72 actif par migrant net, S42) ; solde migratoire supplémentaire de l’année :
          P<sub>t</sub> − P<sub>t−1</sub>, en plus des +150 000 par an du scénario central de l’Insee (S43). Les projets de recrutement et la part jugée difficile de l’enquête BMO 2026 (S39) sont codés pour information ; le modèle ne s’en sert pas.
          Emplois non créés : part non réalisée u<sub>t</sub> = N<sub>t</sub> ÷ (emplois directs de l’année) ; elle réduit d’autant les flux liés à l’investissement des filières (surcroît de PIB des filières, coûts évités, capital ajouté dans l’année, donc effet d’offre et report de la demande).
          Les dépenses de l’État et la bonification sont inchangées (choix prudent, comme pour les prêts non empruntés). Avec φ = 100 %, le PIB est identique à celui du modèle sans contrainte : seules changent les dépenses des nouveaux habitants et les recettes de la régularisation.
          Dépenses des nouveaux habitants : D<sub>t</sub> = P<sub>t</sub> × 21 300 € × PIB⁰<sub>t</sub> ÷ PIB 2025, retranchées de l’effet sur le solde. Leurs recettes passent déjà par θ × ΔPIB : elles ne sont pas ajoutées. Le montant de 21 300 € (euros 2025)
          suit la méthode centrale de l’OCDE (S46) : les biens publics purs (fonctions 01 et 02 de la classification COFOG : défense, intérêts de la dette, organes exécutifs et législatifs) ne varient pas avec la population ; ils pèsent 10,94 % de la dépense hors intérêts (Insee, tableau 3.301, 2024, S45).
          Calcul pour 2025 : dépense hors intérêts 1 714,2 − 64,7 = 1 649,5 Md€ ; part fixe 180,4 Md€ ; dépense variable 1 469,1 Md€ ; population moyenne 68,97 millions. Fourchette : 14 900 € (sans pensions, pour un arrivant d’âge actif) à 23 900 € (seuls les intérêts fixes).
          L’indexation sur le PIB tendanciel en valeur est une approximation prudente : elle ignore la croissance de la population.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Régularisation (à partir de 2028, 410 000 personnes par défaut, réglable de 0 à 700 000) : R<sub>t</sub> = effectif × 61,9 % × 55 % × 14 570 € × PIB⁰<sub>t</sub> ÷ PIB 2025, soit environ 4 960 € par personne régularisée en 2025 et environ 2,0 Md€ pour 410 000 personnes.
          61,9 % : taux d’emploi des immigrés de 15 à 64 ans (Insee, enquête Emploi 2025, S44 ; 71,9 % pour les personnes sans ascendance migratoire). 14 570 € : cotisations sociales effectives de 446,3 Md€ (Insee, tableau 3.217, 2025, S45) ÷ 30,64 millions d’emplois.
          55 % : après la régularisation espagnole de 2005, les cotisations ont augmenté de 4 189 € par personne régularisée, « only 55 percent of what we would have anticipated » d’un cotisant moyen (Monras, Vázquez-Grenno et Elias, S48).
          Aucun effet sur le PIB : ces personnes vivent et travaillent déjà en France, et la comptabilité nationale estime déjà l’économie non déclarée. Aucune dépense nouvelle n’est modélisée : le passage de l’aide médicale de l’État à la protection universelle maladie transfère une dépense qui existe déjà ;
          les droits nouvellement ouverts (aides au logement, prestations familiales, RSA après 5 ans de titre de séjour) ne sont pas chiffrés faute de source ; la régularisation ne s’ajoute pas à la population.
          Valeur de 410 000 : l’Espagne a régularisé 578 375 personnes en 2005 (691 655 demandes, 83,6 % acceptées ; Monras et al., note 25 p. 11, d’après l’annuaire statistique de l’immigration 2005, S48), alors que la population irrégulière était estimée à « close to 1 million » (p. 3), soit environ 58 %.
          En 2026, le gouvernement espagnol prévoyait 500 000 bénéficiaires (presse) pour 840 000 personnes en situation irrégulière au 01/01/2025 (Funcas, S49), soit environ 60 %. Cette part d’environ 58 % est appliquée à la population en situation irrégulière en France, « estimé à 700 000 par le ministère de l’intérieur » (Sénat, avis budgétaire 2026, S50) : environ 410 000.
          Limites de cette valeur : rapportée à la population, la référence espagnole donnerait environ 906 000 personnes, plus que toute la population irrégulière estimée en France (d’où le plafond de 700 000 du curseur) ; le programme vise les travailleurs, les étudiants et les parents d’enfants scolarisés sans papiers, sans effectif chiffré, et aucune estimation de ces sous-groupes n’existe.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Répartition des emplois entre métiers : la répartition des emplois de chaque filière entre les 17 groupes de métiers est une hypothèse de travail, non sourcée (aucune source ne décrit les métiers occupés par les emplois de chaque filière) ; elle pèse directement sur le résultat.
          Les groupes logistique, conduite routière et informatique comptent beaucoup de demandeurs d’emploi par rapport aux emplois d’année pleine qui leur sont attribués (en catégories ABC, environ 10, 12 et 6 fois ces emplois pour la logistique, la conduite routière et l’informatique, avant application de k) : aucune contrainte n’y apparaît, alors que des profils précis peuvent manquer.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          solde<sub>t</sub> = recettes⁰<sub>t</sub> − dépenses⁰<sub>t</sub> + effet<sub>t</sub> ; dette<sub>t</sub> = dette<sub>t−1</sub> − solde<sub>t</sub> (dette fin 2026 : 3 640 Md€, PLF 2027, S14) ;
          croissance en volume<sub>t</sub> = PIB<sub>t</sub> ÷ PIB<sub>t−1</sub> ÷ (1 + π) − 1. Le solde du moteur (cascade, indicateurs) reste exprimé en euros 2027, sans effet de la croissance :
          en 2030, l’effet de la trajectoire en diffère par l’inflation, par les prélèvements nouveaux appliqués au PIB avec programme et par le calcul des recettes sur le surcroît d’activité.
        </p>
      </Carte>

      <Carte titre={`Corrections par rapport au modèle d’origine (impact sur le scénario actif, année pleine)`}>
        <Tableau legende="Corrections et impact chiffré" colonnes={['Correction', 'Justification', 'Impact marginal sur le solde', 'Impact isolé']}>
          {impacts.map((i) => (
            <tr key={i.cle} className="border-b border-line/70 align-top">
              <th scope="row" className="px-2 py-2 font-semibold">{CORRECTIONS[i.cle].titre}</th>
              <td className="px-2 py-2 text-xs text-ink-soft">{CORRECTIONS[i.cle].texte}</td>
              <td className="nombre px-2 py-2 text-right">
                {fmtMd(i.marginal, { signe: true })}
                {!i.active && <div className="font-sans text-xs font-normal text-ink-soft">si activée (désactivée par défaut)</div>}
              </td>
              <td className="nombre px-2 py-2 text-right">{fmtMd(i.isole, { signe: true })}</td>
            </tr>
          ))}
          <tr className="bg-surface-alt font-bold">
            <th scope="row" className="px-2 py-2" colSpan={2}>Somme des impacts des corrections actives · solde affiché</th>
            <td className="nombre px-2 py-2 text-right">{fmtMd(totalCorr, { signe: true })}</td>
            <td className="nombre px-2 py-2 text-right">{fmtMd(resultat.solde, { signe: true })}</td>
          </tr>
        </Tableau>
        <p className="mt-2 text-xs text-ink-soft">
          Impact marginal : solde avec toutes les corrections − solde en retirant celle-ci. Impact isolé : solde avec cette seule correction − solde du modèle d’origine. Les deux diffèrent car certaines corrections interagissent.
          Les valeurs se recalculent avec les curseurs.
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          Le modèle d’origine fixait aussi des trajectoires de déficit et de dette par des formules arbitraires (départ à −3,1 % dans le calcul et −5,1 % à l’affichage) : elles sont remplacées par la trajectoire ci-dessus.
          La mention « Monte-Carlo » désignait une simple interpolation linéaire ; elle est désormais distincte du vrai Monte-Carlo. Les résultats chiffrés affichés en dur ont été supprimés : tout est calculé.
        </p>
      </Carte>

      <Carte titre="Toutes les hypothèses du modèle">
        <Tableau legende="Hypothèses du modèle" colonnes={['Hypothèse', 'Valeur', 'Statut', 'Source', 'Note']}>
          {Object.entries(HYPOTHESES).map(([k, h]) => (
            <tr key={k} className="border-b border-line/70 align-top">
              <th scope="row" className="px-2 py-2 font-medium">{h.libelle}</th>
              <td className="nombre px-2 py-2 whitespace-nowrap">
                {fmtValeurUnite(h.valeur, h.unite)}
                {'calcule' in h && h.calcule && <div className="font-sans text-xs font-normal text-ink-soft">calculé</div>}
              </td>
              <td className="px-2 py-2"><Badge statut={h.statut} /></td>
              <td className="px-2 py-2 text-xs text-ink-soft">
                {h.source}
                {'refs' in h && h.refs && <div className="mt-1"><RefSources refs={[...h.refs]} /></div>}
              </td>
              <td className="px-2 py-2 text-xs text-ink-soft">{h.note}</td>
            </tr>
          ))}
        </Tableau>
      </Carte>

      <Carte titre="Corrections issues de la vérification">
        <Tableau legende="Corrections de données issues de la vérification du 08/11/2026" colonnes={['Donnée', 'Avant (modèle d’origine)', 'Après (source)']}>
          {[
            ['Quotient conjugal/familial', 'Ligne de 10 Md€ en recettes An 1', 'Retirée : absente du cadrage (S1)'],
            ['ISF renforcé climatique', 'Ligne isolée, hors sous-total (somme des lignes : 116,4 Md€)', 'Regroupé avec flat tax, niches et CVAE (44 Md€) ; somme des lignes : 106,4 Md€ (S1)'],
            ['BTP : logements publics (État)', '3,10', '3 (S2)'],
            ['BTP : rénovation des logements sociaux (État / pôle)', '0,25 / 1,50', '0,4 / 1,7 (S2)'],
            ['BTP : chaudières (pôle)', '2,20', '2,8 (S2)'],
            ['BTP : rénovation et entretien du patrimoine (État)', '0,60', '0,4 (S2)'],
            ['BTP : total (État / pôle / total)', '12,00 / 35,60 / 47,60 (écart de transcription)', '12,06 / 36,4 / 48,46 (S2)'],
            ['Automobile : lignes', 'Ligne « Nouvelles lignes de production » oubliée', 'Ajoutée ; État / pôle / total : 1,37 / 3,10 / 4,47 (S3)'],
            ['Emplois BTP', '280 000', 'Plus de 300 000 (S2)'],
            ['Emplois automobile', '90 000', 'Plus de 40 000 (S3)'],
            ['Déficit tendanciel', '−5,1 % du PIB, constant', '−5,4 % du PIB en 2026 (S1, S14), puis constant par défaut : dépenses au rythme du PIB, écart réglable'],
            ['PIB et croissance', 'PIB 2026 de 3 000 Md€, croissance nominale de 2,5 % sans effet sur les recettes (ordres de grandeur)', 'PIB 2025 de 2 991,1 Md€ (S10), croissance réelle de 0,4 % en 2026, 0,9 % en 2027 et 1,2 % en 2028 (S12, S13), puis 1,2 % par an (réglable), inflation de 1,5 % (S13, S14, réglable) ; recettes à 52,2 % du PIB (S11) ; surcroît de PIB dû au programme'],
            ['Stock détenu par la BCE (Eurosystème)', '~750 Md€', '597,0 Md€ (Eurosystème, 31/10/2026, S8 + S9)'],
            ['Gain brut du gel BCE', '22 Md€', 'Environ 18,2 Md€ (prorata du stock : 597,0 × taux implicite + OATi)'],
            ['Dette 2026', '118 % du PIB', 'Hypothèse pessimiste du PLF 2027 : 119,3 % × 3 051 Md€ ≈ 3 640 Md€ (S14), soit environ 119,4 % du PIB 2026 tendanciel avec les hypothèses par défaut (le cadrage du programme retenait 3 595 Md€, S1)'],
            ['Effet durable des investissements', 'Absent', 'Capital accumulé par les filières × r par an, dès l’année suivante, sans usure ; r = 2 % par défaut (rendement net moyen pondéré par filière, S31 à S36, hypothèse de modélisation), réglable de 0 à 20 % (repères S15, S16, S34)'],
            ['Report de la demande vers des produits français', 'Absent (fuite commerciale fixe)', 'La part importée de la demande créée par le programme (22 %, S18) baisse avec le capital des filières de biens échangeables, sans descendre sous 11 % (S18) ; 0,45 par défaut (dérivé de S18, S31 et S37, hypothèse de modélisation), réglable de 0 à 2 ; non cumulé avec l’effet durable (avec les valeurs par défaut, seul l’effet durable est retenu)'],
            ['Prêts du pôle public bancaire empruntés', 'Tous, implicitement', 'Option : part réglable de 0 à 100 % (100 % par défaut) ; l’investissement financé par les prêts non empruntés n’a pas lieu (repères espagnols, S19)'],
            ['Calendrier de l’investissement', 'Année pleine en 2030 pour tout le programme', 'Flux liés à l’investissement des filières (surcroît de PIB, capital, coûts évités, part de l’État, bonification, investissement de substitution) nuls en 2026-2027, puis montée linéaire à partir de 2028 sur D ans (10 par défaut, réglable de 10 à 30 ; hypothèse de modèle, repère espagnol S19) ; le reste du programme garde l’année pleine en 2030'],
            ['Montant de la CADES', 'Hypothèse non sourcée', '19 Md€/an (S6)'],
            ['Bonification du pôle bancaire', '8 % (Gemini)', '0 % par défaut, réglable de 0 à 8 % (S4 : le pôle doit rester à l’équilibre financier)'],
          ].map(([a, b, c]) => (
            <tr key={a} className="border-b border-line/70 align-top">
              <th scope="row" className="px-2 py-2 font-medium">{a}</th>
              <td className="px-2 py-2 text-ink-soft">{b}</td>
              <td className="px-2 py-2">{c}</td>
            </tr>
          ))}
        </Tableau>
        <p className="mt-2 text-xs text-ink-soft">{NOTE_BONIFICATION}</p>
        <p className="mt-2 text-xs text-ink-soft">{NOTE_SECTEURS}</p>
      </Carte>

      <Carte titre="Portée du cadrage officiel et mesures sans chiffrage">
        <p className="text-sm text-ink-soft">
          Selon S1, le document « ne constitue pas un chiffrage complet du programme L’Avenir en Commun qui s’étalera sur plusieurs années ». Il vise un ajustement de 25 Md€ et
          de « stabiliser notre dette par rapport au PIB en un quinquennat ».
        </p>
        <p className="mt-2 text-sm font-semibold">Mesures citées sans chiffrage officiel :</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
          <li>fin des exonérations de cotisations au-dessus de 2 SMIC (S1) ;</li>
          <li>impôt sur le revenu à 14 tranches « au cours du mandat » (S1) ;</li>
          <li>SMIC à 1 700 € net (S1) ;</li>
          <li>blocage du carburant à 1,70 €/l (S1) ;</li>
          <li>fin du quotient conjugal/familial : figure dans le programme (chapitre « Une économie au service des besoins », partie 2), sans montant et hors budget 2027 (S6).</li>
        </ul>
        <p className="mt-3 text-sm font-semibold">Année pleine.</p>
        <p className="text-sm text-ink-soft">
          Les mesures sont confirmées par le programme et les plans : retraite à 60 ans avec 40 annuités comme objectif du mandat et pension minimale au SMIC (S1), 100 % Sécu (S5),
          100 000 soignants et médecins à l’hôpital et 300 000 dans le médico-social et les Ehpad (S5), IR à 14 tranches (S1). Les montants (42, 26, 17 Md€ de dépenses ;
          19, 20, 23, 22 Md€ de recettes) ne figurent pas dans les sources : ce sont des hypothèses non sourcées. Selon S5, les complémentaires ont collecté 46,5 Md€ de cotisations
          santé en 2024 ; le 100 % Sécu serait financé par la transformation de ces primes en cotisations et environ 10 Md€ d’économies de frais de gestion. Les 26 et 23 Md€ du
          modèle n’en sont pas issus.
        </p>
      </Carte>

      <Carte titre="Écarts constatés dans le modèle d’origine">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li><strong>P10/P90 :</strong> le modèle d’origine affichait 83,7 et 147,5 Md€ comme totaux P10/P90, alors que la somme des données donne 86,7 et 148,0.</li>
          <li><strong>Résultats affichés :</strong> les résultats chiffrés écrits en dur dans le modèle d’origine ne correspondaient pas à son propre moteur (par exemple +58,4 affiché contre +157,5 calculé pour le programme complet).</li>
        </ul>
      </Carte>

      <Carte titre="Limites">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>La plupart des montants sont des hypothèses non sourcées ; les résultats en héritent et ne constituent pas une prévision.</li>
          <li>Pas d’effet « boule de neige » des intérêts ; croissance tendancielle exogène ; l’effet durable des investissements (2 % par an par défaut) repose sur un rendement unique, moyenne pondérée de rendements par filière, net de la dépréciation et sans usure du capital, avec un rendement nul pour les filières qui remplacent des équipements (bâtiment, énergie, eau, spatial, recherche) et sans rendement sourcé pour les logements neufs ; le report de la demande vers des produits français (0,45 par défaut) n’est pas chiffré directement par une source : il est dérivé de S18 et S31 et repose sur un coefficient unique pour cinq filières, avec pleine utilisation des capacités et importations remplacées une pour une, sans distinguer les produits ni les délais d’installation, et il est écarté par le non-cumul tant que l’effet durable est plus grand ; sans distinguer les produits ni les délais d’installation ; pas de réaction des marchés ni des agents modélisée finement.</li>
          <li>Électricité à prix régulé : la gratuité des premiers kWh n’est pas chiffrée ; les recettes d’exportation d’électricité (solde exportateur d’environ 92 TWh en 2025, S23) ne sont pas comptées ; le risque juridique vis-à-vis de l’Union européenne n’est pas évalué ; l’indemnisation éventuelle des fournisseurs alternatifs n’est pas comptée ; le coût moyen de production de l’ensemble du parc n’est pas publié (seul le coût complet du nucléaire historique l’est, CRE, S20) : il est appliqué à toute la consommation, et l’écart de prix reste une hypothèse de l’utilisateur ; les seuils du VNU sont supposés suivre le coût complet, la taxe VNU est neutre pour le solde public et les tarifs retenus sont ceux d’un projet d’arrêté (S30).</li>
          <li>Gaz (Engie) : aucune baisse du prix du gaz n’est modélisée. La France importe la quasi-totalité de son gaz naturel, dont le prix se forme sur les marchés européens et mondiaux ; un monopole public ne peut pas vendre durablement sous son coût d’approvisionnement. Les gains possibles (contrats à long terme, marge commerciale) ne sont pas chiffrés faute de source. Le rachat d’Engie reste un pur effet de dette.</li>
          <li>Rachat d’Engie : hors prime de contrôle, sans charge d’intérêts, sans dividendes, avec des chiffres de marché issus de sources secondaires (S28, S29).</li>
          <li>Main-d’œuvre : les emplois de 8 filières sur 10 ne sont pas sourcés (hypothèses non sourcées) ; la répartition des emplois entre métiers est une hypothèse de travail ; les emplois induits sont supposés pourvus sans contrainte ; la réserve de chômeurs est un stock fixe de 09/2026, qui ne tient pas compte du « halo » autour du chômage (1,9 million de personnes), ni de la mobilité entre métiers, ni de l’évolution du chômage.</li>
          <li>Main-d’œuvre : la formation de chômeurs ou de salariés aux métiers en tension n’est pas comptée. Les indemnités de chômage économisées quand des chômeurs sont embauchés ne sont pas modélisées (voir la piste 2 de <code>docs/pistes-a-modeliser.md</code>).</li>
          <li>Immigration de travail : la décomposition espagnole de la croissance, selon laquelle les immigrés expliquent environ la moitié de la croissance du PIB de 2022 à 2025 (1,7 point) mais 0,5 point de celle du PIB par habitant, est comptable et non causale ; la Banque d’Espagne écrit elle-même que l’évaluation « requeriría una visión de equilibrio general » (S47). Le modèle suit le PIB total, qui ne dit pas ce que devient le PIB par habitant : les nouveaux habitants coûtent 21 300 € par an chacun, alors que leurs recettes ne passent que par le taux de 35 centimes sur le surcroît de PIB.</li>
          <li>Régularisation : voir la valeur de 410 000, la référence espagnole (S48, S49) et le plafond de 700 000 ; aucun effet sur le PIB, aucune dépense nouvelle chiffrée (droits ouverts non chiffrés faute de source), aucun effet sur la population.</li>
          <li>Le Monte-Carlo n’explore que l’incertitude sur le volume d’investissement des filières ; les autres paramètres sont fixes.</li>
          <li>Le stock détenu par l’Eurosystème baisse chaque année (titres échus non réinvestis) : le gain d’un gel diminue donc avec le temps, ce que le modèle « année pleine » ne représente pas.</li>
          <li>Gel BCE : hypothèse du modèle (non présente dans les sources S1, S4, S6) selon laquelle les réserves bancaires créées par les rachats de la BCE sont converties en réserves obligatoires non rémunérées ; la Banque de France cesse alors à la fois de percevoir les intérêts des titres gelés et de rémunérer ces réserves, l’opération est neutre pour elle et l’État conserve le gain brut. Le coût est supporté par les banques. Décision relevant de la BCE.</li>
          <li>Dans la trajectoire, les montants du programme suivent l’inflation, les prélèvements nouveaux et les recettes existantes sont proportionnels au PIB (élasticité de 1). Le solde du moteur reste en euros 2027.</li>
          <li>Le coefficient récessif, le taux de retour fiscal, les recettes par euro de PIB supplémentaire et la croissance des dépenses tendancielles sont des hypothèses de modélisation.</li>
          <li>Une conversion de dette en dette perpétuelle ne réduit pas la dette au sens de Maastricht.</li>
          <li>La faisabilité juridique des leviers n’est pas évaluée ici. Pour toute décision, une validation par des experts est nécessaire.</li>
        </ul>
      </Carte>
    </div>
  )
}
