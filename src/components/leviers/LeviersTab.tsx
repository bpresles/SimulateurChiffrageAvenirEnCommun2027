import { BADGE_BCE, LEVIERS, type Levier } from '../../data/leviers'
import { fmtMd, fmtNombre } from '../../lib/format'
import type { ResultatSimulation } from '../../model/types'
import { Badge } from '../ui/Badge'
import { Avertissement, Carte } from '../ui/Carte'

function montantCompte(l: Levier, r: ResultatSimulation): string {
  switch (l.id) {
    case 'gelBce': return fmtMd(r.leviers.gelBce, { signe: true })
    case 'cades': return `${fmtMd(r.leviers.cadesComptee, { signe: true })} (brut : ${fmtMd(r.leviers.cadesBrute)})`
    case 'primaireBce': return `${fmtMd(r.leviers.primaire, { signe: true })} (friction de bonification restante : ${fmtMd(r.frictions.bonification)})`
    case 'circuitTresor': return `${fmtMd(r.leviers.tresor, { signe: true })} (friction de spread : ${fmtMd(r.frictions.spread)})`
  }
}

export function LeviersTab({ resultat }: { resultat: ResultatSimulation }) {
  return (
    <div className="space-y-5">
      <Carte>
        <h1 className="text-xl font-extrabold">Les quatre leviers monétaires et de dette envisagés</h1>
        <p className="mt-2 max-w-4xl text-sm text-ink-soft">
          Selon le programme, quatre mécanismes réduiraient la charge de la dette ou le coût de financement. Cette page présente chacun d’eux, son montant brut
          (hypothèse non sourcée), la façon dont ce simulateur le compte après correction, et son cadre juridique. Les ordres de grandeur cités sont
          à vérifier. Une évaluation juridique et économique indépendante est nécessaire avant toute conclusion.
        </p>
      </Carte>
      <div className="grid gap-5 lg:grid-cols-2">
        {LEVIERS.map((l) => (
          <Carte key={l.id} className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-ink-soft">Levier {l.numero}</p>
              <h2 className="text-base font-bold">{l.titre}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="nombre text-lg font-bold">{fmtMd(l.montantBrut, { signe: true })}/an</span>
              <span className="text-xs text-ink-soft">brut (fourchette citée : {fmtNombre(l.fourchette.min ?? 0)} à {fmtNombre(l.fourchette.max ?? 0)})</span>
              <Badge statut={l.statutMontant} />
              {l.necessiteBce && (
                <span className="rounded border border-negatif/40 bg-negatif-soft px-1.5 py-0.5 text-[11px] font-semibold text-negatif">{BADGE_BCE}</span>
              )}
            </div>
            <section>
              <h3 className="text-sm font-bold">Mécanisme</h3>
              <p className="text-sm text-ink-soft">{l.mecanisme}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {l.decomposition.map((c) => (
                  <li key={c.libelle} className="flex justify-between gap-3 border-b border-line/60 py-1">
                    <span>{c.libelle}</span>
                    <span className="nombre shrink-0 text-right">{c.montant === null ? c.texte ?? '—' : fmtMd(c.montant, { signe: true })}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg bg-brand-soft p-3">
              <h3 className="text-sm font-bold">Comment le moteur le compte après correction</h3>
              <p className="text-sm">{l.comptageMoteur}</p>
              <p className="mt-1 text-xs text-ink-soft">Modèle d’origine : {l.comptageOrigine}</p>
              <p className="mt-2 text-sm">
                Scénario actif ({resultat.horizon === 'an1' ? 'An 1' : 'année pleine'}) : <strong className="nombre">{montantCompte(l, resultat)}</strong>
              </p>
            </section>
            <section>
              <h3 className="text-sm font-bold">Cadre juridique</h3>
              <p className="text-sm text-ink-soft">{l.cadreJuridique}</p>
            </section>
            {l.ordresGrandeur.length > 0 && (
              <section>
                <h3 className="text-sm font-bold">Ordres de grandeur cités</h3>
                <ul className="text-sm text-ink-soft">
                  {l.ordresGrandeur.map((o) => (
                    <li key={o.libelle}>{o.libelle} : <span className="nombre">{o.valeur}</span></li>
                  ))}
                </ul>
              </section>
            )}
          </Carte>
        ))}
      </div>
      <Avertissement titre="Précautions">
        Ces mécanismes touchent à la politique monétaire et à la dette. Leur faisabilité, leur coût réel et leurs réactions de marché ne sont pas modélisés finement ici.
        Toute décision ou engagement doit être validé par des experts compétents (juridiques, économiques, financiers).
      </Avertissement>
    </div>
  )
}
