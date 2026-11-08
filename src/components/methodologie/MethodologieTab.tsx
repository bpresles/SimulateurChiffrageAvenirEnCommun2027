import type { ReactNode } from 'react'
import { HYPOTHESES } from '../../data/hypotheses'
import { STATUTS, type StatutFiabilite } from '../../data/sources'
import { fmtMd, fmtValeurUnite } from '../../lib/format'
import type { CleCorrection } from '../../model/types'
import type { Modele } from '../../state/useModele'
import { MENTION_INDEPENDANCE } from '../layout/PiedDePage'
import { Badge } from '../ui/Badge'
import { Avertissement, Carte } from '../ui/Carte'

const CORRECTIONS: Record<CleCorrection, { titre: string; texte: string }> = {
  bonification: {
    titre: 'Bonification du Pôle bancaire : double compte supprimé',
    texte: 'Le levier primaire à 0 % comptait 8 Md€ en gain alors que la bonification est déjà une friction évitée. Seuls 6,5 Md€ restent en gain ; la bonification est comptée en friction aussi en An 1 (au prorata de la montée en charge).',
  },
  cades: {
    titre: 'CADES : exclue du solde consolidé',
    texte: 'La CRDS est déjà une recette de la trajectoire de base. La réaffecter ne crée pas de recette publique : gain pour la Sécurité sociale, pas pour le solde consolidé (option pour la compter).',
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
  const totalCorr = impacts.reduce((s, i) => s + i.marginal, 0)
  return (
    <div className="space-y-5">
      <Carte>
        <h1 className="text-xl font-extrabold">Méthodologie et sources</h1>
        <p className="mt-2 max-w-4xl text-sm text-ink-soft">
          Cette page décrit le moteur de calcul, toutes ses hypothèses, les corrections apportées au modèle d’origine et ses limites. Les affirmations rapportées sont
          attribuées au programme ; l’outil n’en garantit pas l’exactitude. <strong>{MENTION_INDEPENDANCE}</strong>
        </p>
      </Carte>

      <Avertissement titre="Origine des chiffres">
        <p>
          Les 8 filières non publiées, tous les retours sectoriels (directs, indirects, coûts évités), les emplois et les montants des leviers monétaires ont été estimés avec un
          assistant IA et ne sont pas sourcés. Les chiffres « Cadrage officiel » ont été transcrits par ce même assistant à partir du cadrage budgétaire et des livrets publiés :
          la transcription n’a pas été vérifiée sur la source. Les fourchettes attribuées à des instituts sont citées et non vérifiées.
        </p>
      </Avertissement>

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
CADES (comptée)= AP ? 19 × cades : 0, uniquement si l’option « compter la CADES » est active
Primaire BCE   = 6,5 × primaire × (AP ? 1 : 0,5)
Circuit Trésor = 8,5 × trésor × (AP ? 1 : 0,5)
Fuite import   = max(2,5 ; (1,85 − mult) × 8)
Bonification   = Banque × 0,08 × (1 − primaire) × échelle
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
          <strong>Trajectoire 2026-2032.</strong> PIB<sub>t</sub> = PIB<sub>2026</sub> × 1,025<sup>(t−2026)</sup> ; solde<sub>t</sub> = −5,1 % × PIB<sub>t</sub> + effet<sub>t</sub> ; dette<sub>t</sub> = dette<sub>t−1</sub> − solde<sub>t</sub>.
          Effet nul en 2026, solde An 1 en 2027, interpolation linéaire en 2028-2029, solde d’année pleine dès 2030.
        </p>
      </Carte>

      <Carte titre={`Corrections par rapport au modèle d’origine (impact sur le scénario actif, ${horizonLabel})`}>
        <Tableau legende="Corrections et impact chiffré" colonnes={['Correction', 'Justification', 'Impact marginal sur le solde', 'Impact isolé']}>
          {impacts.map((i) => (
            <tr key={i.cle} className="border-b border-line/70 align-top">
              <th scope="row" className="px-2 py-2 font-semibold">{CORRECTIONS[i.cle].titre}</th>
              <td className="px-2 py-2 text-xs text-ink-soft">{CORRECTIONS[i.cle].texte}</td>
              <td className="nombre px-2 py-2 text-right">{fmtMd(i.marginal, { signe: true })}</td>
              <td className="nombre px-2 py-2 text-right">{fmtMd(i.isole, { signe: true })}</td>
            </tr>
          ))}
          <tr className="bg-surface-alt font-bold">
            <th scope="row" className="px-2 py-2" colSpan={2}>Somme des impacts marginaux · solde corrigé</th>
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
              <td className="nombre px-2 py-2 whitespace-nowrap">{fmtValeurUnite(h.valeur, h.unite)}</td>
              <td className="px-2 py-2"><Badge statut={h.statut} /></td>
              <td className="px-2 py-2 text-xs text-ink-soft">{h.source}</td>
              <td className="px-2 py-2 text-xs text-ink-soft">{h.note}</td>
            </tr>
          ))}
        </Tableau>
      </Carte>

      <Carte titre="Incohérences de données connues">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li><strong>Recettes An 1 :</strong> les lignes détaillées totalisent 116,4 Md€ pour un total annoncé de 106,4 Md€. La ligne « ISF renforcé climatique » (10 Md€) n’entre dans aucun sous-total. Le moteur retient 106,4. Le modèle d’origine omettait en outre le quotient conjugal dans sa matrice.</li>
          <li><strong>BTP :</strong> la décomposition du livret donne 12,21 Md€ pour l’État et 47,81 Md€ au total, contre 12,00 et 47,60 annoncés. Le moteur retient 12,00 / 35,60 / 47,60.</li>
          <li><strong>P10/P90 :</strong> le modèle d’origine affichait 83,7 et 147,5 Md€ comme totaux P10/P90, alors que la somme des données donne 86,7 et 148,0.</li>
          <li><strong>Résultats affichés :</strong> les résultats chiffrés écrits en dur dans le modèle d’origine ne correspondaient pas à son propre moteur (par exemple +58,4 affiché contre +157,5 calculé pour le programme complet).</li>
        </ul>
      </Carte>

      <Carte titre="Limites">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-soft">
          <li>La plupart des montants sont des hypothèses non sourcées ; les résultats en héritent et ne constituent pas une prévision.</li>
          <li>Modèle statique : pas d’effet « boule de neige » des intérêts, croissance exogène, pas de réaction des marchés ni des agents modélisée finement.</li>
          <li>Le Monte-Carlo n’explore que l’incertitude sur le volume d’investissement des filières ; les autres paramètres sont fixes.</li>
          <li>Le coefficient récessif et le taux de retour fiscal sont des hypothèses de modélisation.</li>
          <li>Une conversion de dette en dette perpétuelle ne réduit pas la dette au sens de Maastricht.</li>
          <li>La faisabilité juridique des leviers n’est pas évaluée ici. Pour toute décision, une validation par des experts est nécessaire.</li>
        </ul>
      </Carte>
    </div>
  )
}
