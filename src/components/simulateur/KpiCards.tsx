import type { ReactNode } from 'react'
import { LIBELLE_POLE } from '../../data/filieres'
import { fmtEmplois, fmtMd, fmtPct } from '../../lib/format'
import type { Modele } from '../../state/useModele'
import type { SimulationParams } from '../../model/types'
import type { StatutFiabilite } from '../../data/sources'
import { Badge } from '../ui/Badge'

function Kpi({ titre, valeur, ton, children, statut }: { titre: string; valeur: string; ton?: 'positif' | 'negatif'; children: ReactNode; statut: StatutFiabilite }) {
  const couleur = ton === 'positif' ? 'text-positif' : ton === 'negatif' ? 'text-negatif' : 'text-ink'
  return (
    <article className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wide text-ink-soft">{titre}</h3>
      <p className={`nombre break-words text-xl font-bold xl:text-lg 2xl:text-xl ${couleur}`}>{valeur}</p>
      <div className="space-y-1 text-xs text-ink-soft">{children}</div>
      <div className="mt-auto pt-1"><Badge statut={statut} /></div>
    </article>
  )
}

export function KpiCards({ modele, params }: { modele: Modele; params: SimulationParams }) {
  const { resultat: r, trajectoires: t, mc, mcAJour } = modele
  const an1 = params.horizon === 'an1'
  const anneeH = an1 ? 2027 : 2030
  const pt = t.programme.find((p) => p.annee === anneeH)!
  const tend = t.tendanciel.find((p) => p.annee === anneeH)!
  const p2032 = t.programme.find((p) => p.annee === 2032)!
  const t2032 = t.tendanciel.find((p) => p.annee === 2032)!
  const interv = (a: number, b: number, d = 1) => `${fmtMd(a, { decimales: d, signe: true, unite: false })} à ${fmtMd(b, { decimales: d, signe: true })}`
  const stale = mcAJour ? '' : ' (mise à jour…)'
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Kpi titre={`Solde (${an1 ? 'An 1' : 'année pleine'})`} valeur={fmtMd(r.solde, { signe: true })} ton={r.solde >= 0 ? 'positif' : 'negatif'} statut="hypothese-modele">
        <p>Variation du solde des APU vs trajectoire sans réforme, par an.</p>
        <p>Intervalle Monte-Carlo P10–P90 : <strong className="nombre text-ink">{interv(mc.solde.p10, mc.solde.p90)}</strong>{stale}</p>
        <p>
          Déficit {anneeH} : <strong className="nombre text-ink">{fmtPct(pt.soldePct)}</strong> du PIB, contre{' '}
          <span className="nombre">{fmtPct(tend.soldePct)}</span> en tendanciel.
        </p>
      </Kpi>
      <Kpi titre="Investissements" valeur={fmtMd(r.agregat.totalInvest)} statut="hypothese-non-sourcee">
        <p>{fmtMd(r.agregat.totalEtat)} État + {fmtMd(r.agregat.totalBanque)} {LIBELLE_POLE}</p>
        <p>Intervalle Monte-Carlo P10–P90 du total : <strong className="nombre text-ink">{fmtMd(mc.investissement.p10)} à {fmtMd(mc.investissement.p90)}</strong>{stale}</p>
      </Kpi>
      <Kpi titre="Retours des filières" valeur={fmtMd(r.retoursFilieres, { signe: true })} statut="hypothese-non-sourcee">
        <p>Direct {fmtMd(r.roiDirectFilieres, { decimales: 0 })} · indirect {fmtMd(r.roiIndirect, { decimales: 0 })} · évités budgétaires {fmtMd(r.coutsEvites, { decimales: 0 })}</p>
        <p>Taux d’autofinancement : <strong className="nombre text-ink">{fmtPct(r.autofinancementPct, 0)}</strong>{an1 ? ' (rapporté à la montée en charge An 1)' : ''}</p>
      </Kpi>
      <Kpi titre="Leviers nets des frictions" valeur={fmtMd(r.leviersNets, { signe: true })} statut="hypothese-non-sourcee">
        <p>Leviers comptés {fmtMd(r.leviers.total, { signe: true })} − frictions {fmtMd(r.frictions.total)}</p>
        <p>BCE {fmtMd(r.leviers.gelBce, { decimales: 0 })} · CADES {fmtMd(r.leviers.cadesComptee, { decimales: 0 })} · primaire {fmtMd(r.leviers.primaire, { decimales: 1 })} · Trésor {fmtMd(r.leviers.tresor, { decimales: 1 })}</p>
      </Kpi>
      <Kpi titre="Emplois et dette/PIB 2032" valeur={fmtEmplois(r.agregat.totalEmplois, true)} statut="hypothese-non-sourcee">
        <p>Emplois : hypothèse non sourcée.</p>
        <p>Dette/PIB 2032 : <strong className="nombre text-ink">{fmtPct(p2032.dettePct)}</strong> (tendanciel <span className="nombre">{fmtPct(t2032.dettePct)}</span>) — projection simplifiée.</p>
      </Kpi>
    </div>
  )
}
