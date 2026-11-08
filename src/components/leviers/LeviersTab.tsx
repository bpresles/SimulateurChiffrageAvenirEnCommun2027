import { LEVIERS, type Levier } from '../../data/leviers'
import { NOTE_BONIFICATION, POLE_BANCAIRE_FAITS } from '../../data/poleBancaire'
import { RefSources } from '../ui/RefSources'
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
        <h2 className="text-xl font-extrabold">Les quatre leviers monétaires et de dette envisagés</h2>
        <p className="mt-2 max-w-4xl text-sm text-ink-soft">
          Le programme prévoit quatre mesures monétaires et de dette (S1, S6). Leur effet budgétaire est chiffré ici par le modèle, avec des hypothèses non sourcées, sauf la CADES (S6).
          Cette page présente chacune d’elles, son montant brut, la façon dont ce simulateur la compte après correction, et son cadre juridique. Les ordres de grandeur sont
          rattachés à leur source officielle lorsqu’elle existe, et marqués « à vérifier » sinon. Une évaluation juridique et économique indépendante est nécessaire avant toute conclusion.
        </p>
      </Carte>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {LEVIERS.map((l) => (
          <Carte key={l.id} className="flex min-w-0 flex-col gap-3">
            <div>
              <p className="text-xs font-bold uppercase text-ink-soft">Levier {l.numero}</p>
              <h2 className="text-base font-bold">{l.titre}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="nombre text-lg font-bold">{fmtMd(l.montantBrut, { signe: true })}/an</span>
              <span className="text-xs text-ink-soft">brut (fourchette citée : {fmtNombre(l.fourchette.min ?? 0)} à {fmtNombre(l.fourchette.max ?? 0)})</span>
              <Badge statut={l.statutMontant} />
              <RefSources refs={l.refsMontant} />
              <span className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${l.badgeJuridique.ton === 'bce' ? 'border-negatif/40 bg-negatif-soft text-negatif' : 'border-line bg-neutre-soft text-ink-soft'}`}>{l.badgeJuridique.texte}</span>
            </div>
            <section>
              <h3 className="text-sm font-bold">Mécanisme</h3>
              <p className="text-sm text-ink-soft">{l.mecanisme}</p>
              {l.limites && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  {l.limites.map((t) => <li key={t}>{t}</li>)}
                </ul>
              )}
              <ul className="mt-2 space-y-1 text-sm">
                {l.decomposition.map((c) => (
                  <li key={c.libelle} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-line/60 py-1">
                    <span className="min-w-0 break-words">{c.libelle}</span>
                    {c.dynamique === 'bonification' ? (
                      <span className="nombre shrink-0 text-right">{fmtMd(resultat.frictions.bonificationSansLevier)}</span>
                    ) : c.montant === null ? (
                      <span className="min-w-0 break-words text-right text-ink-soft">{c.texte ?? '—'}</span>
                    ) : (
                      <span className="nombre shrink-0 text-right">{fmtMd(c.montant, { signe: true })}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-lg bg-brand-soft p-3">
              <h3 className="text-sm font-bold">Comment le moteur le compte après correction</h3>
              <p className="text-sm">{l.comptageMoteur}</p>
              <p className="mt-1 text-xs text-ink-soft">Modèle d’origine : {l.comptageOrigine}</p>
              <p className="mt-2 text-sm">
                Scénario actif ({resultat.horizon === 'an1' ? 'An 1' : 'année pleine'}) : <strong className="font-semibold">{montantCompte(l, resultat)}</strong>
              </p>
              {l.id === 'primaireBce' && (
                <p className="mt-1 text-sm">
                  Friction de bonification évitée par le levier : <strong className="font-semibold">{fmtMd(resultat.frictions.bonificationSansLevier)}</strong> selon le taux réglé.
                </p>
              )}
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
                    <li key={o.libelle}>
                      <span className="break-words">{o.libelle} : <span className="font-medium">{o.valeur}</span></span>{' '}
                      {o.refs ? <RefSources refs={o.refs} /> : <span className="text-xs font-semibold text-attention">(à vérifier)</span>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </Carte>
        ))}
      </div>
      <Carte titre="Le pôle public bancaire (S4)">
        <ul className="space-y-1.5 text-sm">
          {POLE_BANCAIRE_FAITS.map((f) => (
            <li key={f.libelle} className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-line/60 py-1">
              <span className="min-w-0 break-words font-medium">{f.libelle}</span>
              <span className="min-w-0 break-words text-ink-soft sm:max-w-[60%] sm:text-right">{f.valeur} <RefSources refs={f.refs} /></span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-soft">{NOTE_BONIFICATION}</p>
      </Carte>
      <Avertissement titre="Précautions">
        Ces mécanismes touchent à la politique monétaire et à la dette. Leur faisabilité, leur coût réel et leurs réactions de marché ne sont pas modélisés finement ici.
        Toute décision ou engagement doit être validé par des experts compétents (juridiques, économiques, financiers).
      </Avertissement>
    </div>
  )
}
