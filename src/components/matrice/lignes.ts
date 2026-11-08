import { DEPENSES_AN1, FOURCHETTE_REALISTE_RECETTES_AN1, RECETTES_AN1 } from '../../data/budgetAn1'
import { DEPENSES_ANNEE_PLEINE, RECETTES_ANNEE_PLEINE } from '../../data/anneePleine'
import { FILIERES, LIBELLE_POLE } from '../../data/filieres'
import { LEVIERS } from '../../data/leviers'
import { SOURCES, STATUTS, type SourceId, type StatutFiabilite } from '../../data/sources'
import { fmtFourchette, fmtMd, fmtNombre } from '../../lib/format'

export type Pilier =
  | 'Dépenses An 1'
  | 'Recettes An 1'
  | 'Dépenses année pleine'
  | 'Recettes année pleine'
  | 'Filières d’investissement'
  | 'Leviers monétaires'

export const PILIERS: Pilier[] = [
  'Dépenses An 1', 'Recettes An 1', 'Dépenses année pleine', 'Recettes année pleine', 'Filières d’investissement', 'Leviers monétaires',
]

export interface LigneMatrice {
  id: string
  pilier: Pilier
  sousPilier?: string
  mesure: string
  an1: string
  anneePleine: string
  fourchette: string
  statut: StatutFiabilite
  refs?: SourceId[]
  statutFourchette?: StatutFiabilite
  commentaire: string
}

const md = (v: number, d = 1) => fmtMd(v, { decimales: d, unite: false })
const TIRET = '—'

export function construireLignes(): LigneMatrice[] {
  const out: LigneMatrice[] = []
  for (const p of DEPENSES_AN1)
    for (const l of p.lignes)
      out.push({ id: l.id, pilier: 'Dépenses An 1', sousPilier: p.nom, mesure: l.libelle, an1: md(l.montant), anneePleine: TIRET, fourchette: TIRET, statut: l.statut, refs: l.refs, commentaire: p.nom })
  for (const p of RECETTES_AN1)
    for (const l of p.lignes)
      out.push({
        id: l.id, pilier: 'Recettes An 1', sousPilier: p.nom, mesure: l.libelle, an1: md(l.montant), anneePleine: TIRET,
        fourchette: l.fourchette ? fmtFourchette(l.fourchette.min, l.fourchette.max) : TIRET,
        statut: l.statut, refs: l.refs, statutFourchette: l.statutFourchette, commentaire: [p.nom, l.commentaire].filter(Boolean).join(' – '),
      })
  for (const l of DEPENSES_ANNEE_PLEINE)
    out.push({ id: l.id, pilier: 'Dépenses année pleine', mesure: l.libelle, an1: TIRET, anneePleine: md(l.montant), fourchette: fmtFourchette(l.fourchette.min, l.fourchette.max), statut: l.statut, commentaire: l.commentaire ?? '' })
  for (const l of RECETTES_ANNEE_PLEINE)
    out.push({ id: l.id, pilier: 'Recettes année pleine', mesure: l.libelle, an1: TIRET, anneePleine: md(l.montant), fourchette: fmtFourchette(l.fourchette.min, l.fourchette.max), statut: l.statut, commentaire: l.commentaire ?? '' })
  for (const f of FILIERES) {
    out.push({
      id: `f-${f.id}`, pilier: 'Filières d’investissement', sousPilier: `Filière ${f.num}`, mesure: f.nom,
      an1: TIRET,
      anneePleine: md(f.p50, 2),
      fourchette: fmtFourchette(f.p10, f.p90, 2),
      statut: f.statutInvestissement, refs: f.statutInvestissement === 'officiel' ? f.refs : undefined,
      commentaire: `${f.statut === 'publie' ? 'Montant annuel du livret publié' : 'Estimée, non publiée (secteur cité par le programme, montants non sourcés)'} ; État ${fmtNombre(f.etatP50, 2)} + ${LIBELLE_POLE} ${fmtNombre(f.banqueP50, 2)} ; retours (non sourcés) direct ${fmtNombre(f.roiDirectP50, 2)}, indirect ${fmtNombre(f.roiIndirectP50, 2)}, évités ${fmtNombre(f.coutsEvitesP50, 2)} ; ${fmtNombre(f.emploisP50, 0)} emplois${f.statut === 'publie' ? ' (source officielle)' : ' (hypothèse)'}. Fourchette P10–P90 : hypothèse non sourcée.`,
    })
    for (const [i, a] of (f.axes ?? []).entries())
      out.push({
        id: `f-${f.id}-axe${i}`, pilier: 'Filières d’investissement', sousPilier: `Filière ${f.num} – axe`, mesure: `↳ ${a.libelle}`,
        an1: TIRET, anneePleine: md(a.etat + a.banque, 2), fourchette: TIRET, statut: 'officiel', refs: f.refs,
        commentaire: `État ${fmtNombre(a.etat, 2)} ; ${LIBELLE_POLE} ${fmtNombre(a.banque, 2)}`,
      })
  }
  for (const l of LEVIERS)
    out.push({
      id: `l-${l.id}`, pilier: 'Leviers monétaires', sousPilier: `Levier ${l.numero}`, mesure: l.titre, an1: TIRET, anneePleine: md(l.montantBrut),
      fourchette: fmtFourchette(l.fourchette.min, l.fourchette.max), statut: l.statutMontant, refs: l.refsMontant,
      commentaire: `${l.badgeJuridique.texte} Comptage du moteur : ${l.comptageMoteur}`,
    })
  return out
}

export const ENTETES_CSV = ['Pilier', 'Mesure', 'An 1 (Md€)', 'Année pleine (Md€)', 'Fourchette (Md€)', 'Statut', 'Commentaire']

export function ligneCsv(l: LigneMatrice): string[] {
  const refs = l.refs?.length ? ` (${l.refs.map((r) => `${r} ${SOURCES[r].url}`).join(' ; ')})` : ''
  const statut = STATUTS[l.statut].label + refs + (l.statutFourchette ? ` ; fourchette : ${STATUTS[l.statutFourchette].label}` : '')
  return [l.pilier, l.mesure, l.an1, l.anneePleine, l.fourchette, statut, l.commentaire]
}

export const FOURCHETTE_TEXTE = fmtFourchette(FOURCHETTE_REALISTE_RECETTES_AN1.min, FOURCHETTE_REALISTE_RECETTES_AN1.max, 0)
