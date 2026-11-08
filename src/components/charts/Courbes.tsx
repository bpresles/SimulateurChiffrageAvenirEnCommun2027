import { useId, type ReactNode } from 'react'
import { fmtNombre } from '../../lib/format'
import { useLargeurConteneur } from '../../lib/useLargeurConteneur'
import { TableauDonnees } from '../ui/TableauDonnees'
import { bornes, echelle, graduations } from './echelle'

export interface Serie {
  nom: string
  couleur: string
  pointille?: boolean
  /** Valeur par année (null si non définie). */
  valeurs: (number | null)[]
}

interface Props {
  titre: string
  description: string
  annees: number[]
  series: Serie[]
  unite: string
  decimales?: number
  /** Domaine minimal de l'axe Y ; il est étendu aux entiers suivants si les données le dépassent. */
  domaine?: [number, number]
  /** Pas de graduation de l'axe Y (sinon automatique). */
  pasGraduation?: number
  /** Note discrète affichée sous le graphique. */
  note?: ReactNode
}

const H = 260, L = 44, R = 14, T = 20, B = 30

export function Courbes({ titre, description, annees, series, unite, decimales = 1, domaine, pasGraduation, note }: Props) {
  const id = useId()
  const [ref, W] = useLargeurConteneur<HTMLDivElement>()
  const toutes = series.flatMap((s) => s.valeurs.filter((v): v is number => v !== null))
  const [lo, hi] = domaine
    ? [Math.min(domaine[0], Math.floor(Math.min(...toutes))), Math.max(domaine[1], Math.ceil(Math.max(...toutes)))]
    : bornes(toutes, 0.1)
  const x = echelle(annees[0], annees[annees.length - 1], L, W - R)
  const y = echelle(lo, hi, H - B, T)
  const ticks = pasGraduation
    ? Array.from({ length: Math.floor((hi - lo) / pasGraduation) + 1 }, (_, i) => lo + i * pasGraduation)
    : graduations(lo, hi, 5)
  // Décimales des graduations : 1 si le pas est fractionnaire (ex. 0,5), sinon 0.
  const decTicks = ticks.length > 1 && !Number.isInteger(Math.round((ticks[1] - ticks[0]) * 1e9) / 1e9) ? 1 : 0
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 text-sm font-bold">{titre}</figcaption>
      <div ref={ref} className="w-full min-w-0 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>{titre}</title>
        <desc id={`${id}-d`}>{description}</desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke={domaine && t === 0 ? 'var(--color-ink-soft)' : 'var(--color-line)'} strokeWidth={domaine && t === 0 ? 1.5 : 1} />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-ink-soft)">{fmtNombre(t, decTicks)}</text>
          </g>
        ))}
        {annees.map((a) => (
          <text key={a} x={x(a)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--color-ink-soft)">{a}</text>
        ))}
        {series.map((s) => {
          const pts = s.valeurs
            .map((v, i) => (v === null ? null : `${x(annees[i]).toFixed(1)},${y(v).toFixed(1)}`))
            .filter(Boolean)
            .join(' ')
          return (
            <g key={s.nom}>
              <polyline points={pts} fill="none" stroke={s.couleur} strokeWidth={2.5} strokeDasharray={s.pointille ? '6 5' : undefined} strokeLinejoin="round" />
              {s.valeurs.map((v, i) => v !== null && <circle key={i} cx={x(annees[i])} cy={y(v)} r={3} fill={s.couleur} />)}
            </g>
          )
        })}
        <text x={4} y={12} fontSize="11" fill="var(--color-ink-soft)">{unite}</text>
      </svg>
      </div>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {series.map((s) => (
          <li key={s.nom} className="flex items-center gap-1.5">
            <svg width="24" height="8" aria-hidden="true">
              <line x1="0" x2="24" y1="4" y2="4" stroke={s.couleur} strokeWidth="3" strokeDasharray={s.pointille ? '5 3' : undefined} />
            </svg>
            {s.nom}
          </li>
        ))}
      </ul>
      <TableauDonnees
        legende={titre}
        colonnes={['Année', ...series.map((s) => s.nom)]}
        lignes={annees.map((a, i) => [String(a), ...series.map((s) => (s.valeurs[i] === null ? '—' : fmtNombre(s.valeurs[i]!, decimales)))])}
      />
      {note && <p className="mt-3 text-xs text-ink-soft">{note}</p>}
    </figure>
  )
}
