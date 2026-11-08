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

export function MethodologieTab({ modele, horizonLabel }: { modele: Modele; horizonLabel: string }) {
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
          les ressources du pôle public bancaire (S4), le montant de la CADES (S6) et les titres publics français détenus par l’Eurosystème (S8, S9, données BCE à fin octobre 2026) sont repris des documents officiels ; la Banque de France (S7) sert de source complémentaire. Les montants des 8 autres filières, les retours
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
          AP = horizon « année pleine ». mult = multiplicateur ; ratio = mult / 1,45.
        </p>
        <Eq>{`Dépenses       = 81,7 + (AP ? max(0 ; État_filières − 10) + 85 : 0)
Recettes An 1  = 106,4 × recouvrement
Recettes AP    = AP ? 84 × recettesAP% × (0,85 + 0,15 × recouvrement) : 0
Retours courants = base × (AP ? 1 : 10,5/14) × ratio
ROI direct     = Σ direct_filières × échelle + retours courants   (échelle = AP ? 1 : 0,42)
ROI indirect   = Σ indirect_filières × échelle
Coûts évités   = Σ évités_filières × échelle × part budgétaire
Effet récessif = − multiplicateurPrélèvements × (Recettes An 1 + Recettes AP × 61/84) × 0,35
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
          <strong>Trajectoire 2026-2032.</strong> PIB<sub>t</sub> = PIB<sub>2026</sub> × (1 + g)<sup>(t−2026)</sup>, g = croissance nominale tendancielle (2,5 % par défaut, réglable de 0 à 5 % en hypothèses avancées ; sans effet sur le solde en Md€, seulement sur les ratios en % du PIB) ; solde<sub>t</sub> = −5,4 % × PIB<sub>t</sub> + effet<sub>t</sub> ; dette<sub>t</sub> = dette<sub>t−1</sub> − solde<sub>t</sub>.
          Effet nul en 2026, solde An 1 en 2027, interpolation linéaire en 2028-2029, solde d’année pleine dès 2030.
        </p>
      </Carte>

      <Carte titre={`Corrections par rapport au modèle d’origine (impact sur le scénario actif, ${horizonLabel})`}>
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
            ['Déficit tendanciel', '−5,1 % du PIB', '−5,4 % du PIB (S1)'],
            ['Stock détenu par la BCE (Eurosystème)', '~750 Md€', '597,0 Md€ (Eurosystème, 31/10/2026, S8 + S9)'],
            ['Gain brut du gel BCE', '22 Md€', 'Environ 18,2 Md€ (prorata du stock : 597,0 × taux implicite + OATi)'],
            ['Dette 2026', '118 % du PIB', '3 595 Md€ (S1), soit 119,8 % du PIB hypothétique de 3 000 Md€'],
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
          <li>Modèle statique : pas d’effet « boule de neige » des intérêts, croissance exogène, pas de réaction des marchés ni des agents modélisée finement.</li>
          <li>Le Monte-Carlo n’explore que l’incertitude sur le volume d’investissement des filières ; les autres paramètres sont fixes.</li>
          <li>Le stock détenu par l’Eurosystème baisse chaque année (titres échus non réinvestis) : le gain d’un gel diminue donc avec le temps, ce que le modèle « année pleine » ne représente pas.</li>
          <li>Gel BCE : hypothèse du modèle (non présente dans les sources S1, S4, S6) selon laquelle les réserves bancaires créées par les rachats de la BCE sont converties en réserves obligatoires non rémunérées ; la Banque de France cesse alors à la fois de percevoir les intérêts des titres gelés et de rémunérer ces réserves, l’opération est neutre pour elle et l’État conserve le gain brut. Le coût est supporté par les banques. Décision relevant de la BCE.</li>
          <li>Les montants du programme sont supposés constants en euros 2027 ; leur poids en % du PIB diminue donc à mesure que le PIB croît.</li>
          <li>Le coefficient récessif et le taux de retour fiscal sont des hypothèses de modélisation.</li>
          <li>Une conversion de dette en dette perpétuelle ne réduit pas la dette au sens de Maastricht.</li>
          <li>La faisabilité juridique des leviers n’est pas évaluée ici. Pour toute décision, une validation par des experts est nécessaire.</li>
        </ul>
      </Carte>
    </div>
  )
}
