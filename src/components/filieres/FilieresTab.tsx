import { useState } from 'react'
import { FILIERES, type Filiere } from '../../data/filieres'
import { fmtEmplois, fmtMd, fmtNombre } from '../../lib/format'
import { agregerFilieres } from '../../model/filieres'
import type { SimulationParams } from '../../model/types'
import type { Modele } from '../../state/useModele'
import { BarresFilieres } from '../charts/BarresFilieres'
import { Histogramme } from '../charts/Histogramme'
import { Badge } from '../ui/Badge'
import { Carte } from '../ui/Carte'
import { Segmented } from '../ui/Segmented'

type Filtre = 'toutes' | 'publie' | 'estime'

function CarteFiliere({ f, d }: { f: Filiere; d: ReturnType<typeof agregerFilieres>['details'][number] }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-ink-soft">Filière {f.num}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${f.statut === 'publie' ? 'bg-brand-soft text-brand' : 'bg-attention-soft text-attention'}`}>
          {f.statut === 'publie' ? 'Livret publié' : 'Estimée, non publiée'}
        </span>
      </div>
      <h3 className="text-sm font-bold">{f.nom}</h3>
      <p className="text-xs text-ink-soft">{f.desc}</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <dt className="text-ink-soft">Investissement</dt>
        <dd className="nombre font-semibold">{fmtMd(d.invest, { decimales: 2 })}</dd>
        <dt className="text-ink-soft">État / Pôle bancaire</dt>
        <dd className="nombre">{fmtNombre(d.etat, 2)} / {fmtNombre(d.banque, 2)}</dd>
        <dt className="text-ink-soft">Fourchette P10–P90</dt>
        <dd className="nombre">{fmtNombre(f.p10, 2)} à {fmtNombre(f.p90, 2)}</dd>
        <dt className="text-ink-soft">Retours directs</dt>
        <dd className="nombre">{fmtMd(d.direct, { decimales: 2, signe: true })}</dd>
        <dt className="text-ink-soft">Retours indirects</dt>
        <dd className="nombre">{fmtMd(d.indirect, { decimales: 2, signe: true })}</dd>
        <dt className="text-ink-soft">Coûts évités (bruts)</dt>
        <dd className="nombre">{fmtMd(d.evites, { decimales: 2, signe: true })}</dd>
        <dt className="text-ink-soft">Emplois</dt>
        <dd className="nombre">{fmtEmplois(d.emplois)}</dd>
      </dl>
      <p className="text-xs text-ink-soft"><strong>Cibles :</strong> {f.cibles}</p>
      {f.note && <p className="text-xs text-ink-soft">{f.note}</p>}
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        <Badge statut={f.statutInvestissement} />
        <Badge statut={f.statutRoi} />
      </div>
    </article>
  )
}

export function FilieresTab({ params, modele }: { params: SimulationParams; modele: Modele }) {
  const [p, setP] = useState<10 | 50 | 90>(50)
  const [filtre, setFiltre] = useState<Filtre>('toutes')
  const agregat = agregerFilieres(p, params.multiplicateur)
  const visibles = FILIERES.filter((f) => filtre === 'toutes' || f.statut === filtre)
  const { mc, mcAJour } = modele
  const pLabel = `P${p}`
  return (
    <div className="space-y-5">
      <Carte titre="Investissement productif : 10 filières">
        <p className="mb-3 max-w-4xl text-sm text-ink-soft">
          Pour chaque filière, trois valeurs sont fournies (P10, P50, P90). Le sélecteur ci-dessous applique le même percentile à toutes les filières, par
          interpolation linéaire entre ces points : ce n’est pas une simulation. Les 2 filières « publiées » reposent sur des livrets ; les 8 autres, ainsi
          que tous les retours sectoriels, ont été estimés avec un assistant IA et ne sont pas sourcés.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Segmented<10 | 50 | 90>
            legende="Percentile appliqué à chaque filière"
            valeur={p}
            onChange={setP}
            options={[{ valeur: 10, label: 'P10' }, { valeur: 50, label: 'P50' }, { valeur: 90, label: 'P90' }]}
          />
          <Segmented<Filtre>
            legende="Filtrer les filières"
            valeur={filtre}
            onChange={setFiltre}
            options={[{ valeur: 'toutes', label: 'Toutes' }, { valeur: 'publie', label: 'Publiées' }, { valeur: 'estime', label: 'Estimées' }]}
          />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[
            ['Total investi', fmtMd(agregat.totalInvest)],
            ['Dont État', fmtMd(agregat.totalEtat)],
            ['Dont Pôle bancaire', fmtMd(agregat.totalBanque)],
            ['Emplois (hypothèse)', fmtEmplois(agregat.totalEmplois).replace(/\u00a0emplois$/, '')],
          ].map(([t, v]) => (
            <div key={t} className="rounded-lg bg-surface-alt p-3">
              <dt className="text-xs text-ink-soft">{t} ({pLabel})</dt>
              <dd className="nombre break-words text-base font-bold sm:text-lg">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs text-ink-soft">
          Somme des P10 individuels : {fmtMd(mc.sommeP10)} · somme des P90 : {fmtMd(mc.sommeP90)}. Ces sommes ne sont pas le P10 ou le P90 du total (voir ci-dessous).
        </p>
        <div className="mt-4">
          <BarresFilieres filieres={visibles} agregat={agregat} libellePercentile={pLabel} />
        </div>
      </Carte>

      <Carte titre="Simulation Monte-Carlo du volume d’investissement">
        <p className="mb-3 max-w-4xl text-sm text-ink-soft">
          {fmtNombre(mc.n, 0)} tirages reproductibles (graine fixe). Chaque filière suit une loi split-normale calée exactement sur ses P10, P50 et P90, avec une
          corrélation par facteur commun (ρ = {fmtNombre(mc.rho, 2)}, hypothèse de modélisation réglable dans le simulateur). <strong>Le Monte-Carlo ne porte que sur le
          volume d’investissement des filières</strong> ; tous les autres paramètres restent fixés par les curseurs du simulateur
          ({params.horizon === 'an1' ? 'An 1' : 'année pleine'}).{!mcAJour && ' Mise à jour en cours…'}
        </p>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Histogramme titre="Investissement total (Md€/an)" description="Distribution de l'investissement total des 10 filières sur les tirages." q={mc.investissement} unite="Md€/an" />
          <Histogramme titre="Solde (Md€/an)" description="Distribution du solde sur les tirages, les autres paramètres étant fixés par les curseurs." q={mc.solde} unite="Md€/an" />
        </div>
        <p className="mt-3 text-sm">
          P10 du total : <strong className="nombre">{fmtMd(mc.investissement.p10)}</strong> (somme des P10 individuels : <span className="nombre">{fmtMd(mc.sommeP10)}</span>) ·
          P90 du total : <strong className="nombre">{fmtMd(mc.investissement.p90)}</strong> (somme des P90 : <span className="nombre">{fmtMd(mc.sommeP90)}</span>).
          La diversification entre filières resserre l’intervalle du total.
        </p>
      </Carte>

      <div>
        <h2 className="mb-3 text-base font-bold">Détail par filière ({pLabel})</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visibles.map((f) => (
            <CarteFiliere key={f.id} f={f} d={agregat.details.find((d) => d.id === f.id)!} />
          ))}
        </div>
      </div>
    </div>
  )
}
