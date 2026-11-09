import { fmtMd, fmtNombre, fmtPct } from '../../lib/format'
import type { Modele } from '../../state/useModele'
import type { useSimulationParams } from '../../state/useSimulationParams'
import { Cascade } from '../charts/Cascade'
import { Courbes } from '../charts/Courbes'
import { BoutonReinitialiser } from '../ui/BoutonReinitialiser'
import { Carte } from '../ui/Carte'
import { CurseursEconomie, CurseursLeviers } from './Curseurs'
import { HypothesesAvancees } from './HypothesesAvancees'
import { KpiCards } from './KpiCards'
import { Presets } from './Presets'
import { ANNEES, ameliorationDeficit, type Trajectoires } from '../../model/trajectoire'
import type { SimulationParams } from '../../model/types'
import { hv } from '../../data/hypotheses'

type Etat = ReturnType<typeof useSimulationParams>

function NoteDeficit({ t }: { t: Trajectoires }) {
  const { deficitTendanciel, effet, pointsPib, suffisant } = ameliorationDeficit(t)
  const z = fmtNombre(Math.abs(pointsPib), 1)
  const unite = Math.abs(pointsPib) < 2 ? 'point' : 'points'
  const debut = (
    <>
      Le solde du programme est mesuré par rapport à la trajectoire sans réforme : un solde positif réduit le déficit sans le supprimer. En 2030, le déficit tendanciel est de {fmtPct(deficitTendanciel)} du PIB ; dans le scénario actif, le programme{' '}
    </>
  )
  if (suffisant)
    return <>{debut}l’améliore de {z} {unite} de PIB, soit plus que le déficit tendanciel : le solde public devient excédentaire.</>
  return (
    <>
      {debut}
      {pointsPib >= 0 ? 'l’améliore' : 'le dégrade'} de {z} {unite} de PIB ({fmtMd(effet, { signe: true, decimales: 1 })} en 2030, en euros courants).
    </>
  )
}

function NoteReport({ t }: { t: Trajectoires }) {
  const fin = t.effets[t.effets.length - 1]
  return (
    <>
      {' '}Report de la demande vers des produits français (option) : le capital des filières de biens échangeables fait baisser la part importée
      de la demande créée par le programme de {fmtPct(hv('partImporteeDemande'), 0)} à {fmtPct(fin.partImporteePct, 1)} en {fin.annee}
      {fin.plancherAtteint ? ' (plancher de 11 % atteint)' : ''}
      {fin.gainEcarte === 'substitution' ? (
        '. Ce gain n’est pas compté : l’effet durable des investissements, plus grand, décrit en partie la même production.'
      ) : (
        <>
          , soit {fmtMd(fin.deltaPibSubstitution, { signe: true, decimales: 1 })} de PIB cette année-là.
          {fin.gainEcarte === 'offre' && ' L’effet durable des investissements, plus petit, n’est alors pas compté : il décrit en partie la même production.'}
        </>
      )}
    </>
  )
}

function NoteCroissance({ t, rendementPct, substitution, dureeInvest }: { t: Trajectoires; rendementPct: number; substitution: number; dureeInvest: number }) {
  const effet = t.effets.find((e) => e.annee === 2030)!
  const tend = t.tendanciel.find((p) => p.annee === 2030)!
  const ecart = (effet.deltaPib / tend.pib) * 100
  const fin = ANNEES[ANNEES.length - 1]
  const ecartFin = t.programme.find((p) => p.annee === fin)!.croissanceReellePct - t.tendanciel.find((p) => p.annee === fin)!.croissanceReellePct
  return (
    <>
      En 2030, le PIB avec le programme s’écarte de {fmtPct(ecart, 1, true)} du tendanciel ({fmtMd(effet.deltaPib, { signe: true, decimales: 1 })} courants).
      Pendant la montée en charge, la demande créée par le programme accélère la croissance
      {` : jusqu’en 2030 pour la plupart des mesures ; l’investissement des filières, lui, démarre en 2028 et monte en charge sur ${dureeInvest} ans, soit jusqu’en ${2027 + dureeInvest} (hypothèse réglable).`}{' '}
      {rendementPct > 0 ? (
        <>
          Ensuite, à programme constant, l’effet de demande ne croît plus, mais les capacités de production créées par les investissements des filières
          continuent de s’accumuler ({fmtNombre(rendementPct, 0)} centimes de PIB par an par euro investi, hypothèse réglable) : en {fin}, la croissance
          reste supérieure de {fmtNombre(ecartFin, 2)} point au tendanciel. Les gains de productivité et de qualification ne sont pas modélisés à part.
        </>
      ) : (
        <>
          Le rythme complet de l’investissement des filières n’est atteint qu’en {2027 + dureeInvest}, après l’horizon des trajectoires : jusqu’en {fin},
          la croissance reste portée par cette montée en charge. À programme constant, le PIB garde ensuite son écart et sa croissance revient vers le
          rythme tendanciel. L’effet durable des investissements sur les capacités de production est réglé à 0 : le surcroît de PIB vient de la seule demande.
          Hypothèse réglable dans les hypothèses avancées (2 % par défaut, rendement moyen des filières qui créent des capacités ; une partie des
          investissements de transition remplace des équipements existants sans accroître les capacités, Pisani-Ferry et Mahfouz, S17).
        </>
      )}
      {substitution > 0 && <NoteReport t={t} />}
    </>
  )
}

const ANNEES_EFFET = ANNEES.filter((a) => a >= 2027)
const DEBUT = ANNEES[0]
const FIN = ANNEES[ANNEES.length - 1]
const PERIODE = `${DEBUT}-${FIN}`

function DecompositionEffet({ t, params }: { t: Trajectoires; params: SimulationParams }) {
  const effets = ANNEES_EFFET.map((a) => t.effets.find((e) => e.annee === a)!)
  const points = ANNEES_EFFET.map((a) => {
    const prog = t.programme.find((p) => p.annee === a)!
    const tend = t.tendanciel.find((p) => p.annee === a)!
    return prog.soldePct - tend.soldePct
  })
  const md = (v: number) => fmtNombre(v, 1, true)
  const theta = fmtNombre(params.tauxRecettesActivitePct, 0)
  const solde: [string, (e: (typeof effets)[number]) => number][] = [
    ['Prélèvements nouveaux (proportionnels au PIB avec programme)', (e) => e.prelevements],
    [`Recettes sur le surcroît d’activité (${theta} centimes par euro de PIB)`, (e) => e.recettesInduites],
    ['Coûts évités', (e) => e.coutsEvites],
    ['Leviers monétaires et financiers', (e) => e.leviers],
    ['Électricité à prix régulé : effet direct (impôt sur les sociétés, dividende d’EDF, TVA)', (e) => e.electriciteDirect],
    ['Dépenses nouvelles', (e) => -e.depenses],
    ['Dépenses des nouveaux habitants (immigration de travail, 21 300 € par habitant en euros 2025)', (e) => -e.depensesNouveauxHabitants],
    ['Régularisation : cotisations des personnes régularisées en emploi', (e) => e.recettesRegularisation],
    ['Frictions (bonification, spread, importations)', (e) => -e.frictions],
  ]
  const pib: [string, (e: (typeof effets)[number]) => number][] = [
    ['dont investissements des filières × multiplicateur', (e) => e.deltaPibFilieres],
    ['dont dépenses courantes', (e) => e.deltaPibDepensesCourantes],
    ['dont activité freinée par les prélèvements nouveaux', (e) => e.deltaPibRecessif],
    [`dont capacités de production (capital accumulé × ${fmtNombre(params.rendementCapitalPct, 0)} %)`, (e) => e.deltaPibOffre],
    ['dont baisse de la facture d’électricité (+0,14 × baisse de la facture, simulation et non mesure)', (e) => e.deltaPibElectricite],
    [`dont report de la demande vers des produits français (${fmtNombre(params.substitutionImports, 2)} point par point de PIB investi)`, (e) => e.deltaPibSubstitution],
  ]
  const personnes: [string, (e: (typeof effets)[number]) => number][] = [
    ['Emplois directs du programme à pourvoir (hors emplois induits)', (e) => e.emploisDirectsCrees],
    ['dont pourvus par des chômeurs du métier', (e) => e.emploisPourvusChomeurs],
    ['dont pourvus par des travailleurs immigrés', (e) => e.travailleursImmigres],
    ['dont non créés, faute de chômeur ni de nouvel arrivant', (e) => e.emploisNonCrees],
    ['Migrants nets supplémentaires (stock, travailleurs ÷ 0,7)', (e) => e.migrantsSupplementaires],
    ['Solde migratoire supplémentaire de l’année', (e) => e.soldeMigratoireSupplementaire],
  ]
  const arrivees = effets.filter((e) => e.annee >= 2028).reduce((somme, e) => somme + e.soldeMigratoireSupplementaire, 0) / effets.filter((e) => e.annee >= 2028).length
  const ecartes = effets.filter((e) => e.gainEcarte !== null)
  const cellule = 'nombre px-2 py-1 text-right'
  const entete = (
    <tr className="border-b border-line">
      <th scope="col" className="px-2 py-1.5 font-semibold">Md€ courants</th>
      {ANNEES_EFFET.map((a) => (
        <th key={a} scope="col" className="px-2 py-1.5 text-right font-semibold">{a}</th>
      ))}
    </tr>
  )
  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold">D’où vient l’effet du programme sur le solde public</h3>
      <p className="mt-1 text-xs text-ink-soft">
        Chaque ligne s’ajoute au solde tendanciel ; leur somme donne l’effet total. Les recettes publiques existantes (52,2 % du PIB) et les prélèvements
        nouveaux suivent le PIB ; le surcroît de PIB dû au programme, détaillé en bas, rapporte en plus les recettes de la deuxième ligne.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[44rem] text-left text-xs sm:text-sm">
          <caption className="sr-only">Décomposition annuelle de l’effet du programme sur le solde public et du surcroît de PIB, en milliards d’euros courants</caption>
          <thead>{entete}</thead>
          <tbody>
            {solde.map(([libelle, f]) => (
              <tr key={libelle} className="border-b border-line/60">
                <th scope="row" className="px-2 py-1 font-medium">{libelle}</th>
                {effets.map((e) => <td key={e.annee} className={cellule}>{md(f(e))}</td>)}
              </tr>
            ))}
            <tr className="border-b border-line font-bold">
              <th scope="row" className="px-2 py-1">Effet total sur le solde</th>
              {effets.map((e) => <td key={e.annee} className={cellule}>{md(e.effet)}</td>)}
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className="px-2 py-1 font-medium">Amélioration du solde, points de PIB</th>
              {points.map((v, i) => <td key={ANNEES_EFFET[i]} className={cellule}>{fmtNombre(v, 1, true)}</td>)}
            </tr>
            <tr className="border-b border-line/60">
              <th scope="row" className="px-2 pb-1 pt-3 font-semibold">Surcroît de PIB dû au programme</th>
              {effets.map((e) => <td key={e.annee} className={`${cellule} pt-3 font-semibold`}>{md(e.deltaPib)}</td>)}
            </tr>
            {pib.map(([libelle, f]) => (
              <tr key={libelle} className="border-b border-line/60 text-ink-soft">
                <th scope="row" className="py-1 pl-5 pr-2 font-normal">{libelle}</th>
                {effets.map((e) => <td key={e.annee} className={cellule}>{md(f(e))}</td>)}
              </tr>
            ))}
            <tr className="border-b border-line/60">
              <th scope="row" className="px-2 pb-1 pt-3 font-semibold">Main-d’œuvre (nombre de personnes)</th>
              {effets.map((e) => <td key={e.annee} className={`${cellule} pt-3`} aria-hidden="true" />)}
            </tr>
            {personnes.map(([libelle, f]) => (
              <tr key={libelle} className="border-b border-line/60 text-ink-soft">
                <th scope="row" className="px-2 py-1 font-normal">{libelle}</th>
                {effets.map((e) => <td key={e.annee} className={cellule}>{fmtNombre(f(e), 0)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        Arrivées nettes supplémentaires : {fmtNombre(Math.round(arrivees / 1000) * 1000, 0)} par an en moyenne de 2028 à {FIN}, en plus des 150 000 par an du scénario central de l’Insee.
        Les travailleurs immigrés ne s’ajoutent pas au surcroît de PIB : celui-ci suppose déjà tous les emplois pourvus ; ils le rendent possible là où les chômeurs du métier ne suffisent pas.
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        Pour mémoire, le moteur (cascade ci-dessus) donne {fmtMd(t.composantesAn1.soldeMoteur, { signe: true, decimales: 1 })} en An 1 et{' '}
        {fmtMd(t.composantesAP.soldeMoteur, { signe: true, decimales: 1 })} en année pleine, en euros 2027. La trajectoire s’en écarte parce qu’elle convertit
        les montants en euros courants, applique les prélèvements nouveaux au PIB avec programme et calcule les recettes sur le surcroît d’activité
        au lieu des retours fiscaux des filières, des retours sur dépenses courantes et de l’effet récessif du moteur, qu’elle remplace pour ne rien compter deux fois.
      </p>
      {ecartes.length > 0 && (
        <p className="mt-2 text-xs text-ink-soft">
          Garde-fou : en {ecartes.map((e) => e.annee).join(', ')}, l’effet durable des investissements et le report de la demande sont tous deux positifs.
          Ils peuvent décrire la même production nouvelle : seul le plus grand est retenu, l’autre est mis à 0 dans le tableau.
        </p>
      )}
    </div>
  )
}

/** Repère : les montants du cadrage officiel de première année (S1), lus avec les réserves déjà documentées dans la méthodologie. */
function ReperePremiereAnnee({ t, onMethodologie }: { t: Trajectoires; onMethodologie: () => void }) {
  return (
    <aside aria-labelledby="repere-cadrage" className="rounded-xl border border-line bg-surface-alt p-4 text-sm shadow-sm">
      <h2 id="repere-cadrage" className="text-sm font-bold">Repère : cadrage officiel de première année (2027)</h2>
      <p className="mt-1 text-ink-soft">
        À lire avec esprit critique : ce n’est pas un chiffrage du programme sur la durée, que le simulateur cherche à évaluer.
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
        <li>
          Montants du cadrage (S1) : <strong className="nombre text-ink">{fmtMd(hv('depensesAn1'))}</strong> de dépenses et{' '}
          <strong className="nombre text-ink">{fmtMd(hv('recettesAn1'))}</strong> de recettes en première année.
        </li>
        <li>
          Solde calculé par le moteur pour la première année avec les réglages actuels :{' '}
          <strong className="nombre text-ink">{fmtMd(t.composantesAn1.soldeMoteur, { signe: true, decimales: 1 })}</strong> (euros 2027, pour mémoire).
        </li>
        <li>
          Selon S1, le document « ne constitue pas un chiffrage complet du programme L’Avenir en Commun qui s’étalera sur plusieurs années » ;
          il vise un ajustement de 25 Md€. Plusieurs mesures y sont citées sans chiffrage officiel.
        </li>
        <li>
          Le modèle d’origine a été corrigé sur quatre points : bonification du pôle bancaire, CADES, coûts évités, effet récessif des prélèvements nouveaux.
        </li>
      </ul>
      <p className="mt-2">
        <button type="button" onClick={onMethodologie} className="font-semibold text-brand underline">
          Voir la méthodologie
        </button>
      </p>
    </aside>
  )
}

export function SimulateurTab({ etat, modele }: { etat: Etat; modele: Modele }) {
  const { params, setParam, appliquerScenario, rho, setRho, scenarioActif, sansLeviersActif, changerLeviers, reinitialiser, reinitialisable, setOnglet } = etat
  const { resultat: r, trajectoires: t, soldesScenarios, soldesSansLeviers } = modele
  const gel = params.gelBcePct > 0
  return (
    <div className="space-y-5">
      <Carte>
        <h2 className="text-xl font-extrabold">Explorer les effets budgétaires d’un programme de dépenses, de recettes et d’investissement</h2>
        <div className="mt-2 max-w-4xl space-y-2 text-sm text-ink-soft">
          <p>
            Cet outil reprend un chiffrage budgétaire fondé sur le cadrage de première année publié par le programme et sur des hypothèses
            complémentaires, puis calcule la variation du solde des administrations publiques par rapport à une trajectoire sans réforme.
            Chaque curseur correspond à une hypothèse explicite, et chaque chiffre est calculé par le moteur, jamais saisi à la main.
          </p>
          <p>
            Pour le lire : partez d’un préréglage puis ajustez les curseurs ; les résultats portent sur l’année pleine et sur les trajectoires jusqu’en 2035. Le badge de chaque
            valeur indique son degré de fiabilité ; de nombreuses valeurs sont des hypothèses non sourcées. Les intervalles Monte-Carlo ne portent que
            sur le volume d’investissement des filières. Il s’agit d’un outil pédagogique, pas d’une prévision.{' '}
            <button type="button" onClick={() => setOnglet('methodologie')} className="font-semibold text-brand underline">
              Lire la méthodologie et les sources
            </button>
            .
          </p>
        </div>
      </Carte>

      <Carte>
        <Presets
          actif={scenarioActif}
          sansLeviers={sansLeviersActif}
          soldes={soldesScenarios}
          soldesSans={soldesSansLeviers}
          onChoisir={(c) => appliquerScenario(c, sansLeviersActif)}
          onChangerLeviers={changerLeviers}
          onReinitialiser={reinitialiser}
          reinitialisable={reinitialisable}
        />
      </Carte>

      <KpiCards modele={modele} />

      <ReperePremiereAnnee t={t} onMethodologie={() => setOnglet('methodologie')} />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex justify-end lg:col-span-2 lg:-mb-2">
          <BoutonReinitialiser onClick={reinitialiser} actif={reinitialisable} compact />
        </div>
        <CurseursEconomie params={params} r={r} setParam={setParam} />
        <CurseursLeviers params={params} r={r} setParam={setParam} />
      </div>

      <HypothesesAvancees params={params} rho={rho} setRho={setRho} setParam={setParam} bonificationMd={r.frictions.bonification} />

      <Carte titre="Du solde sans réforme au solde avec réforme : décomposition">
        <p className="mb-3 text-sm text-ink-soft">Chaque barre est une composante du solde, en Md€ par an. Sur mobile, le graphique défile horizontalement.</p>
        <Cascade resultat={r} />
      </Carte>

      <Carte titre={`Trajectoire ${PERIODE}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Courbes
              titre="Croissance du PIB en volume, % par an"
              description={`Croissance annuelle du PIB hors inflation de ${DEBUT} à ${FIN}, avec le programme et en tendanciel.`}
              annees={ANNEES}
              unite="% par an"
              note={<NoteCroissance t={t} rendementPct={params.rendementCapitalPct} substitution={params.substitutionImports} dureeInvest={params.dureeMonteeInvestissement} />}
              domaine={[0, 2]}
              decimales={1}
              series={[
                { nom: 'Avec le programme', couleur: 'var(--color-brand)', valeurs: t.programme.map((p) => p.croissanceReellePct) },
                { nom: 'Tendanciel', couleur: 'var(--color-ink-soft)', pointille: true, valeurs: t.tendanciel.map((p) => p.croissanceReellePct) },
              ]}
            />
          </div>
          <Courbes
            titre="Déficit public, % du PIB"
            description={`Solde public en pourcentage du PIB de ${DEBUT} à ${FIN}, avec le programme et en tendanciel.`}
            annees={ANNEES}
            unite="% du PIB"
            note={<NoteDeficit t={t} />}
            domaine={[-7, 0]}
            pasGraduation={1}
            decimales={1}
            series={[
              { nom: 'Avec le programme', couleur: 'var(--color-brand)', valeurs: t.programme.map((p) => p.soldePct) },
              { nom: 'Tendanciel', couleur: 'var(--color-ink-soft)', pointille: true, valeurs: t.tendanciel.map((p) => p.soldePct) },
            ]}
          />
          <Courbes
            titre="Dette publique, % du PIB"
            description={`Dette publique en pourcentage du PIB de ${DEBUT} à ${FIN}, avec le programme, en tendanciel et hors stock BCE gelé.`}
            annees={ANNEES}
            unite="% du PIB"
            series={[
              { nom: 'Avec le programme', couleur: 'var(--color-brand)', valeurs: t.programme.map((p) => p.dettePct) },
              { nom: 'Tendanciel', couleur: 'var(--color-ink-soft)', pointille: true, valeurs: t.tendanciel.map((p) => p.dettePct) },
              ...(gel
                ? [{ nom: 'Dette hors stock BCE gelé (indicateur non Maastricht)', couleur: 'var(--color-negatif)', pointille: true, valeurs: t.programme.map((p) => p.detteHorsBcePct) }]
                : []),
            ]}
          />
        </div>
        <DecompositionEffet t={t} params={params} />
        <div className="mt-4 space-y-1 text-xs text-ink-soft">
          <p>
            Scénario tendanciel : PIB 2025 de {fmtNombre(hv('pib2025'), 1)} Md€ (Insee, S10), croissance réelle de {fmtPct(hv('croissance2026'))} en 2026,
            {' '}{fmtPct(hv('croissance2027'))} en 2027 et {fmtPct(hv('croissance2028'))} en 2028 (Insee et Banque de France, S12 et S13), puis{' '}
            {fmtPct(params.croissanceLongTermePct)} par an (dernière projection prolongée ; réglable), inflation de {fmtPct(params.inflationPct)} (S13, S14),
            recettes publiques à {fmtPct(hv('tauxRecettesPubliques'))} du PIB (Insee, S11), déficit 2026 de {fmtPct(-hv('deficitTendanciel'))} du PIB (S1, S14),
            puis dépenses au rythme du PIB{params.ecartDepensesPct === 0 ? ' (déficit tendanciel constant ; écart réglable)' : `, avec un écart de ${fmtNombre(params.ecartDepensesPct, 1, true)} point par an (hypothèse du modèle)`},
            dette fin 2026 de {fmtNombre(hv('dette2026'), 0)} Md€ (119,3 % du PIB, hypothèse pessimiste du PLF 2027, S14).
          </p>
          <p>
            Programme : les montants du moteur (euros 2027) sont nuls en 2026, égaux à l’An 1 en 2027, interpolés en 2028-2029, puis égaux à l’année pleine
            dès 2030 ; l’inflation les convertit en euros courants. Seule exception, l’investissement des filières suit son propre calendrier.{' '}
            Les flux liés à l’investissement des filières (surcroît de PIB, capital, coûts évités, part de l’État dans l’investissement, bonification,
            investissement de substitution) sont nuls en 2026 et 2027, puis montent linéairement à partir de 2028 : le rythme d’une année vaut le rythme
            de pleine année × (année − 2027) / {params.dureeMonteeInvestissement}, plafonné à 1 (hypothèse réglable ; avec 10 ans, environ la moitié du rythme est atteinte en 2032 ;
            repères : en Espagne, 35 % des investissements du plan de relance réalisés fin 2025 contre 87 % des réformes, Funcas, S19 ; objectif de
            100 % d’énergies renouvelables en 2060).{' '}
            {params.partPretsUtilisesPct < 100 ? (
              <>
                {fmtNombre(params.partPretsUtilisesPct, 0)} % seulement des prêts du pôle public bancaire sont empruntés : l’investissement qu’auraient
                financé les autres n’a pas lieu, à chaque étape de la montée en charge (hypothèse réglable ; repère : l’Espagne a conservé environ 27 % de son enveloppe de prêts européens, Funcas, S19).{' '}
              </>
            ) : (
              <>Tous les prêts du pôle public bancaire sont supposés empruntés (réglable ; repère espagnol : environ 27 %, Funcas, S19).{' '}</>
            )}
            {params.rendementCapitalPct > 0 ? (
              <>
                Les investissements des filières s’accumulent en capital, qui ajoute chaque année au PIB {fmtNombre(params.rendementCapitalPct, 0)} centimes
                par euro investi, dès l’année suivante (hypothèse réglable ; 2 % par défaut : moyenne des rendements nets par filière pondérée par l’investissement, S31 à S36 ; repères : FMI, S15 ; Bom et Ligthart, S16 ; à l’inverse, Pisani-Ferry et Mahfouz, S17).
              </>
            ) : (
              <>
                Les investissements des filières n’ont qu’un effet de demande : leur effet durable sur les capacités de production est réglé à 0 (2 % par défaut,
                voir la méthodologie ; S17 et S35 : une partie des investissements de transition n’accroît pas les capacités). Réglable de 0 à 20 % (repères : FMI, S15 ;
                Bom et Ligthart, S16).
              </>
            )}{' '}
            {params.substitutionImports > 0 ? (
              <>
                Report de la demande vers des produits français : chaque point de PIB de capital installé par les filières de biens échangeables
                (automobile, industrie, agriculture, mer, numérique) fait baisser de {fmtNombre(params.substitutionImports, 2)} point la part importée de la
                demande créée par le programme, partie de {fmtPct(hv('partImporteeDemande'), 0)} (Banque de France, S18) et bornée à{' '}
                {fmtPct(hv('partImporteeMin'), 0)} (son niveau de 1965) ; si l’effet durable est aussi activé, seul le plus grand des deux gains est retenu
                (hypothèse réglable ; 0,45 par défaut, dérivé de S18 et S31 faute de source directe).
              </>
            ) : (
              <>
                Le report de la demande vers des produits français (réindustrialisation) est réglé à 0 (0,45 par défaut, valeur dérivée de S18 et S31) ; réglable de 0 à 2.
              </>
            )}
          </p>
          <p>
            Électricité : {params.ecartPrixElectricite === 0 ? (
              <>par défaut, aucun écart entre le prix de marché tendanciel et le coût complet du nucléaire : aucun effet (réglable dans les hypothèses avancées). </>
            ) : (
              <>
                écart de {fmtNombre(params.ecartPrixElectricite, 0)} €/MWh par rapport au coût complet (euros 2027) et marge de {fmtNombre(params.margeElectricite, 1)} €/MWh pendant {params.anneesEcartElectricite} an{params.anneesEcartElectricite > 1 ? 's' : ''} à partir de 2028 :
                le gain est l’écart moins la marge et moins la minoration du versement nucléaire universel (S30), sans jamais être négatif (le prix régulé n’excède pas le prix sans programme) ;
                effet de −40 % de la baisse de la facture sur le solde (impôt sur les sociétés d’EDF, dividende, TVA) et de +0,14 de PIB par euro de baisse (simulation du
                modèle FR-BDF de la Banque de France, S27, et non mesure). {' '}
              </>
            )}
            Le scénario tendanciel ne finance aucun bouclier tarifaire : si le tendanciel en avait financé un comme en 2022, le programme l’économiserait ; ce gain n’est pas compté. Aucune baisse du prix du gaz n’est modélisée.
          </p>
          <p>
            Main-d’œuvre : {fmtNombre(params.partChomeursMobilisablesPct, 0)} % des demandeurs d’emploi de chaque groupe de métiers (DARES, 09/2026, S38) peuvent occuper les emplois directs créés ;
            les emplois en excédent sont pourvus à {fmtNombre(params.partEmploisManquantsImmigrationPct, 0)} % par une nouvelle immigration de travail (0,7 actif par migrant net, S42), le reste n’est pas créé
            (PIB, coûts évités et capital correspondants en moins). Les emplois induits par le multiplicateur sont supposés pourvus sans contrainte, et la répartition des emplois entre métiers
            est une hypothèse de travail non sourcée. Chaque migrant supplémentaire coûte 21 300 € par an (euros 2025, indexés sur le PIB tendanciel ; méthode de l’OCDE, S45 et S46) ; ses recettes passent déjà par les recettes sur le surcroît de PIB.
            Régularisation : {fmtNombre(params.effectifRegularisation, 0)} personnes à partir de 2028, 61,9 % en emploi (S44) cotisant 55 % d’un cotisant moyen (S48), sans effet sur le PIB ni dépense nouvelle modélisée
            (droits nouvellement ouverts non chiffrés faute de source).
          </p>
          <p>
            Rachat d’Engie : {params.rachatEngie ? (
              <>achat en 2028 de {fmtNombre(hv('coutRachatEngie'), 0)} Md€ de titres (hors prime de contrôle ; sources de marché secondaires, S28 et S29), qui augmente la dette sans toucher au déficit. Les dividendes d’Engie ne sont pas comptés et le modèle ne calcule aucune charge d’intérêts.</>
            ) : (
              <>non compté (case décochée dans les hypothèses avancées).</>
            )}
          </p>
          <p>
            Limites : pas d’effet « boule de neige » des intérêts sur la dette, pas d’usure du capital installé, recettes
            tendancielles strictement proportionnelles au PIB, gratuité des premiers kWh non chiffrée, recettes d’exportation d’électricité, risque juridique vis-à-vis de l’Union européenne et indemnisation éventuelle des fournisseurs alternatifs non comptés (voir la méthodologie). Une conversion en dette perpétuelle ne réduit pas la dette au sens de Maastricht : la courbe
            « hors stock BCE gelé » est un indicateur alternatif.
          </p>
        </div>
      </Carte>
    </div>
  )
}
