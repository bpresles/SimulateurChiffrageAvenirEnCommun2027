import { fmtPct } from '../../lib/format'
import type { Modele } from '../../state/useModele'
import type { useSimulationParams } from '../../state/useSimulationParams'
import { Cascade } from '../charts/Cascade'
import { Courbes } from '../charts/Courbes'
import { Carte } from '../ui/Carte'
import { Segmented } from '../ui/Segmented'
import { CurseursEconomie, CurseursLeviers } from './Curseurs'
import { HypothesesAvancees } from './HypothesesAvancees'
import { KpiCards } from './KpiCards'
import { Presets } from './Presets'
import { ANNEES } from '../../model/trajectoire'
import type { Horizon } from '../../model/types'
import { hv } from '../../data/hypotheses'

type Etat = ReturnType<typeof useSimulationParams>

export function SimulateurTab({ etat, modele }: { etat: Etat; modele: Modele }) {
  const { params, setParam, appliquerScenario, rho, setRho, scenarioActif, setOnglet } = etat
  const { resultat: r, trajectoires: t, soldesScenarios } = modele
  const gel = params.gelBcePct > 0
  return (
    <div className="space-y-5">
      <Carte>
        <h1 className="text-xl font-extrabold">Explorer les effets budgétaires d’un programme de dépenses, de recettes et d’investissement</h1>
        <div className="mt-2 max-w-4xl space-y-2 text-sm text-ink-soft">
          <p>
            Cet outil reprend un chiffrage budgétaire fondé sur le cadrage de première année publié par le programme et sur des hypothèses
            complémentaires, puis calcule la variation du solde des administrations publiques par rapport à une trajectoire sans réforme.
            Chaque curseur correspond à une hypothèse explicite, et chaque chiffre est calculé par le moteur, jamais saisi à la main.
          </p>
          <p>
            Pour le lire : choisissez un horizon (An 1 ou année pleine), partez d’un préréglage puis ajustez les curseurs. Le badge de chaque
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
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold">Horizon</span>
          <Segmented<Horizon>
            legende="Horizon de la simulation"
            valeur={params.horizon}
            onChange={(h) => setParam('horizon', h)}
            options={[{ valeur: 'an1', label: 'An 1 (2027)' }, { valeur: 'anneePleine', label: 'Année pleine' }]}
          />
        </div>
        <Presets actif={scenarioActif} soldes={soldesScenarios} onChoisir={appliquerScenario} />
      </Carte>

      <KpiCards modele={modele} params={params} />

      <div className="grid gap-5 lg:grid-cols-2">
        <CurseursEconomie params={params} r={r} setParam={setParam} />
        <CurseursLeviers params={params} r={r} setParam={setParam} />
      </div>

      <HypothesesAvancees params={params} rho={rho} setRho={setRho} setParam={setParam} />

      <Carte titre="Du solde sans réforme au solde avec réforme : décomposition">
        <p className="mb-3 text-sm text-ink-soft">Chaque barre est une composante du solde, en Md€ par an. Sur mobile, le graphique défile horizontalement.</p>
        <Cascade resultat={r} />
      </Carte>

      <Carte titre="Trajectoire 2026-2032">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Courbes
            titre="Déficit public, % du PIB"
            description="Solde public en pourcentage du PIB de 2026 à 2032, avec le programme et en tendanciel (déficit constant)."
            annees={ANNEES}
            unite="% du PIB"
            series={[
              { nom: 'Avec le programme', couleur: 'var(--color-brand)', valeurs: t.programme.map((p) => p.soldePct) },
              { nom: 'Tendanciel', couleur: 'var(--color-ink-soft)', pointille: true, valeurs: t.tendanciel.map((p) => p.soldePct) },
            ]}
          />
          <Courbes
            titre="Dette publique, % du PIB"
            description="Dette publique en pourcentage du PIB de 2026 à 2032, avec le programme, en tendanciel et hors stock BCE gelé."
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
        <div className="mt-4 space-y-1 text-xs text-ink-soft">
          <p>
            Hypothèses : PIB 2026 de {hv('pib2026')} Md€, croissance nominale de {fmtPct(hv('croissanceNominale'))} par an, déficit tendanciel de {fmtPct(hv('deficitTendanciel'))} du PIB, dette 2026 de {hv('dettePib2026')} % du PIB (ordres de grandeur repris du modèle d’origine, à mettre à jour).
            L’effet du programme est nul en 2026, égal au solde An 1 en 2027, interpolé en 2028-2029, puis égal au solde d’année pleine dès 2030.
          </p>
          <p>
            Limites : pas d’effet « boule de neige » des intérêts, croissance exogène. Une conversion en dette perpétuelle ne réduit pas la dette au sens de Maastricht : la courbe « hors stock BCE gelé » est un indicateur alternatif.
          </p>
        </div>
      </Carte>
    </div>
  )
}
