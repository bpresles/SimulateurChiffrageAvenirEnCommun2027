import { useId } from 'react'
import { fmtNombre } from '../../lib/format'
import type { Quantiles } from '../../model/monteCarlo'
import { useLargeurConteneur } from '../../lib/useLargeurConteneur'
import { TableauDonnees } from '../ui/TableauDonnees'
import { echelle, graduations } from './echelle'

const H = 220, L = 12, R = 12, T = 22, B = 32

interface Props {
  titre: string
  description: string
  q: Quantiles
  unite: string
  decimales?: number
}

export function Histogramme({ titre, description, q, unite, decimales = 1 }: Props) {
  const id = useId()
  const [ref, W] = useLargeurConteneur<HTMLDivElement>()
  const { min, max, pas, comptes } = q.histogramme
  const cmax = Math.max(...comptes)
  const x = echelle(min, max, L, W - R)
  const y = echelle(0, cmax, H - B, T)
  const ticks = graduations(min, max, 6)
  const reperes = [
    { v: q.p10, nom: 'P10' },
    { v: q.p50, nom: 'P50' },
    { v: q.p90, nom: 'P90' },
  ]
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 text-sm font-bold">{titre}</figcaption>
      <div ref={ref} className="w-full min-w-0 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>{titre}</title>
        <desc id={`${id}-d`}>{`${description} P10 : ${fmtNombre(q.p10, decimales)} ; P50 : ${fmtNombre(q.p50, decimales)} ; P90 : ${fmtNombre(q.p90, decimales)} ${unite}.`}</desc>
        {comptes.map((c, i) => (
          <rect key={i} x={x(min + i * pas) + 0.5} y={y(c)} width={Math.max(1, x(min + (i + 1) * pas) - x(min + i * pas) - 1)} height={H - B - y(c)} fill="var(--color-info)" opacity={0.8} />
        ))}
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="var(--color-ink-soft)" />
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - 14} textAnchor="middle" fontSize="11" fill="var(--color-ink-soft)">{fmtNombre(t, 0)}</text>
        ))}
        {min < 0 && max > 0 && <line x1={x(0)} x2={x(0)} y1={T} y2={H - B} stroke="var(--color-ink)" strokeWidth={1.5} />}
        {reperes.map((r, i) => (
          <g key={r.nom}>
            <line x1={x(r.v)} x2={x(r.v)} y1={T - 4} y2={H - B} stroke="var(--color-brand)" strokeWidth={2} strokeDasharray={r.nom === 'P50' ? undefined : '5 3'} />
            <text x={x(r.v)} y={12} textAnchor={i === 0 ? 'end' : i === 2 ? 'start' : 'middle'} dx={i === 0 ? -3 : i === 2 ? 3 : 0} fontSize="11" fontWeight="700" fill="var(--color-brand)">{r.nom}</text>
          </g>
        ))}
        <text x={W - R} y={H - 2} textAnchor="end" fontSize="11" fill="var(--color-ink-soft)">{unite}</text>
      </svg>
      </div>
      <TableauDonnees
        legende={titre}
        colonnes={['Intervalle', 'Tirages']}
        lignes={comptes.map((c, i) => [`${fmtNombre(min + i * pas, decimales)} à ${fmtNombre(min + (i + 1) * pas, decimales)}`, String(c)])}
      />
    </figure>
  )
}
