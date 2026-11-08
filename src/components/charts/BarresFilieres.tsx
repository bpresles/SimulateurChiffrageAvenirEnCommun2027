import { useId } from 'react'
import type { Filiere } from '../../data/filieres'
import { fmtMd } from '../../lib/format'
import type { Agregat } from '../../model/types'
import { useLargeurConteneur } from '../../lib/useLargeurConteneur'
import { TableauDonnees } from '../ui/TableauDonnees'
import { echelle, graduations } from './echelle'

const R = 24, LIGNE = 30, T = 24

export function BarresFilieres({ filieres, agregat, libellePercentile }: { filieres: Filiere[]; agregat: Agregat; libellePercentile: string }) {
  const id = useId()
  const [ref, W] = useLargeurConteneur<HTMLDivElement>()
  const L = Math.min(210, Math.round(W * 0.4))
  const maxCar = Math.max(8, Math.floor((L - 10) / 5.8))
  const H = T + filieres.length * LIGNE + 28
  const max = Math.max(...filieres.map((f) => f.p90)) * 1.05
  const x = echelle(0, max, L, W - R)
  const ticks = graduations(0, max, 5)
  const parId = new Map(agregat.details.map((d) => [d.id, d]))
  return (
    <figure className="min-w-0">
      <div ref={ref} className="w-full min-w-0 overflow-hidden">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block" role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>Investissement par filière ({libellePercentile})</title>
        <desc id={`${id}-d`}>
          Barres horizontales : part État et part Pôle bancaire de chaque filière au {libellePercentile}, avec une moustache allant du P10 au P90 de la filière.
        </desc>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={T - 6} y2={H - 28} stroke="var(--color-line)" />
            <text x={x(t)} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--color-ink-soft)">{t}</text>
          </g>
        ))}
        {filieres.map((f, i) => {
          const d = parId.get(f.id)!
          const cy = T + i * LIGNE + LIGNE / 2
          return (
            <g key={f.id}>
              <text x={L - 8} y={cy + 4} textAnchor="end" fontSize="11" fill="var(--color-ink)">
                {f.num}. {f.nom.length > maxCar ? f.nom.slice(0, maxCar - 1).trimEnd() + '…' : f.nom}
              </text>
              <rect x={x(0)} y={cy - 8} width={Math.max(0, x(d.etat) - x(0))} height={16} fill="var(--color-brand)" />
              <rect x={x(d.etat)} y={cy - 8} width={Math.max(0, x(d.etat + d.banque) - x(d.etat))} height={16} fill="var(--color-info)" opacity={0.75} />
              <line x1={x(f.p10)} x2={x(f.p90)} y1={cy} y2={cy} stroke="var(--color-ink)" strokeWidth={1.5} />
              <line x1={x(f.p10)} x2={x(f.p10)} y1={cy - 6} y2={cy + 6} stroke="var(--color-ink)" strokeWidth={1.5} />
              <line x1={x(f.p90)} x2={x(f.p90)} y1={cy - 6} y2={cy + 6} stroke="var(--color-ink)" strokeWidth={1.5} />
            </g>
          )
        })}
        <text x={W - R} y={12} textAnchor="end" fontSize="11" fill="var(--color-ink-soft)">Md€/an</text>
      </svg>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <li className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 bg-brand" />État</li>
        <li className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 bg-info opacity-75" />Pôle bancaire</li>
        <li className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-5 bg-ink" />Moustache P10 – P90 de la filière</li>
      </ul>
      <TableauDonnees
        legende="Investissement par filière"
        colonnes={['Filière', `État (${libellePercentile})`, 'Pôle bancaire', 'Total', 'P10', 'P90']}
        lignes={filieres.map((f) => {
          const d = parId.get(f.id)!
          return [`${f.num}. ${f.nom}`, fmtMd(d.etat, { decimales: 2, unite: false }), fmtMd(d.banque, { decimales: 2, unite: false }), fmtMd(d.invest, { decimales: 2, unite: false }), fmtMd(f.p10, { decimales: 2, unite: false }), fmtMd(f.p90, { decimales: 2, unite: false })]
        })}
      />
    </figure>
  )
}
