import { useMemo, useState } from 'react'
import { RECETTES_AN1, sommeLignes } from '../../data/budgetAn1'
import { HYPOTHESES } from '../../data/hypotheses'
import { Download } from 'lucide-react'
import { telechargerCsv, versCsv } from '../../lib/csv'
import { fmtMd } from '../../lib/format'
import { Badge } from '../ui/Badge'
import { Avertissement, Carte } from '../ui/Carte'
import { ENTETES_CSV, FOURCHETTE_TEXTE, PILIERS, construireLignes, ligneCsv, type Pilier } from './lignes'

const normaliser = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const TOUTES = construireLignes()

export function MatriceTab() {
  const toutes = TOUTES
  const [q, setQ] = useState('')
  const [pilier, setPilier] = useState<Pilier | 'tous'>('tous')
  const visibles = useMemo(() => {
    const n = normaliser(q.trim())
    return toutes.filter(
      (l) => (pilier === 'tous' || l.pilier === pilier) && (n === '' || normaliser(`${l.mesure} ${l.commentaire} ${l.sousPilier ?? ''}`).includes(n)),
    )
  }, [toutes, q, pilier])
  const somme = sommeLignes(RECETTES_AN1)

  return (
    <div className="space-y-5">
      <Carte>
        <h1 className="text-xl font-extrabold">Matrice détaillée des mesures</h1>
        <p className="mt-2 max-w-4xl text-sm text-ink-soft">
          Toutes les lignes du chiffrage : dépenses et recettes de première année, dépenses et recettes d’année pleine, 10 filières d’investissement et 4 leviers
          monétaires. Montants en Md€ par an. Le statut indique la fiabilité de chaque chiffre.
        </p>
      </Carte>
      <Avertissement titre="Écart de données à signaler">
        <p>
          Les recettes An 1 annoncées totalisent <strong className="nombre">{fmtMd(HYPOTHESES.recettesAn1.valeur)}</strong>, alors que la somme des lignes détaillées ci-dessous
          vaut <strong className="nombre">{fmtMd(somme)}</strong>, soit un écart de <strong className="nombre">{fmtMd(somme - HYPOTHESES.recettesAn1.valeur)}</strong>. La ligne « ISF renforcé climatique » (10 Md€)
          n’entre dans aucun sous-total annoncé. Le moteur utilise 106,4 Md€. Fourchette réaliste totale citée pour l’année 1 : {FOURCHETTE_TEXTE} Md€ (estimation externe citée, non vérifiée).
        </p>
      </Avertissement>
      <Carte>
        <div className="mb-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="mat-q" className="block text-xs font-semibold text-ink-soft">Rechercher</label>
            <input id="mat-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mesure ou commentaire"
              className="w-64 max-w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
          </div>
          <div>
            <label htmlFor="mat-p" className="block text-xs font-semibold text-ink-soft">Pilier</label>
            <select id="mat-p" value={pilier} onChange={(e) => setPilier(e.target.value as Pilier | 'tous')}
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
              <option value="tous">Tous les piliers</option>
              {PILIERS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button
            type="button"
            onClick={() => telechargerCsv('matrice-detaillee.csv', versCsv(ENTETES_CSV, visibles.map(ligneCsv)))}
            className="ml-auto flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Download aria-hidden="true" className="h-4 w-4" /> Exporter en CSV ({visibles.length})
          </button>
        </div>
        <p className="mb-2 text-xs text-ink-soft" role="status">{visibles.length} ligne{visibles.length > 1 ? 's' : ''} affichée{visibles.length > 1 ? 's' : ''}.</p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Matrice détaillée, défilement horizontal possible">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-line bg-surface-alt">
                {['Pilier', 'Mesure', 'An 1', 'Année pleine', 'Fourchette', 'Statut', 'Commentaire'].map((c) => (
                  <th key={c} scope="col" className="px-2 py-2 font-bold">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibles.map((l) => (
                <tr key={l.id} className="border-b border-line/70 align-top">
                  <td className="px-2 py-2 text-xs font-semibold text-ink-soft">{l.pilier}</td>
                  <th scope="row" className="px-2 py-2 font-medium">{l.mesure}</th>
                  <td className="nombre px-2 py-2 text-right">{l.an1}</td>
                  <td className="nombre px-2 py-2 text-right">{l.anneePleine}</td>
                  <td className="nombre px-2 py-2">
                    {l.fourchette}
                    {l.statutFourchette && <div className="mt-1"><Badge statut={l.statutFourchette} /></div>}
                  </td>
                  <td className="px-2 py-2"><Badge statut={l.statut} /></td>
                  <td className="px-2 py-2 text-xs text-ink-soft">{l.commentaire}</td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr><td colSpan={7} className="px-2 py-6 text-center text-ink-soft">Aucune ligne ne correspond.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Carte>
    </div>
  )
}
