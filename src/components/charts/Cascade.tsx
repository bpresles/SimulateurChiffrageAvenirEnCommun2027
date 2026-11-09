import { useId } from 'react'
import { fmtMd } from '../../lib/format'
import type { ResultatSimulation } from '../../model/types'
import { useLargeurConteneur } from '../../lib/useLargeurConteneur'
import { TableauDonnees } from '../ui/TableauDonnees'
import { bornes, echelle, graduations } from './echelle'

interface Barre {
  label: string
  valeur: number
  total?: boolean
}

export function barresCascade(r: ResultatSimulation): Barre[] {
  return [
    { label: 'Dépenses', valeur: -r.depenses.total },
    { label: 'Recettes du cadrage', valeur: r.recettesAn1 },
    { label: 'Recettes année pleine', valeur: r.recettesAP },
    { label: 'Retours directs', valeur: r.roiDirect },
    { label: 'Retours indirects', valeur: r.roiIndirect },
    { label: 'Coûts évités', valeur: r.coutsEvites },
    { label: 'Effet récessif', valeur: r.effetRecessif },
    { label: 'Leviers monétaires', valeur: r.leviers.total },
    { label: 'Frictions', valeur: -r.frictions.total },
    { label: 'Solde', valeur: r.solde, total: true },
  ]
}

const L = 44, H = 320, HAUT = 24, BAS = 78, LARGEUR_MIN = 760

/** Retour à la ligne glouton, au plus 3 lignes. */
function couper(label: string, maxCar: number): string[] {
  const lignes: string[] = []
  let cur = ''
  for (const mot of label.split(' ')) {
    if (cur && (cur + ' ' + mot).length > maxCar) {
      lignes.push(cur)
      cur = mot
    } else cur = cur ? cur + ' ' + mot : mot
  }
  if (cur) lignes.push(cur)
  return lignes.slice(0, 3)
}

export function Cascade({ resultat }: { resultat: ResultatSimulation }) {
  const id = useId()
  const barres = barresCascade(resultat)
  const [ref, largeur] = useLargeurConteneur<HTMLDivElement>()
  const W = Math.max(largeur, LARGEUR_MIN)
  const PAS = (W - L - 6) / barres.length
  const maxCar = Math.max(8, Math.floor((PAS - 8) / 6.2))
  const rects = barres.map((b, i) => {
    if (b.total) return { ...b, debut: 0, fin: b.valeur }
    const debut = barres.slice(0, i).reduce((acc, x) => (x.total ? acc : acc + x.valeur), 0)
    return { ...b, debut, fin: debut + b.valeur }
  })
  const [lo, hi] = bornes([0, ...rects.flatMap((r) => [r.debut, r.fin])])
  const y = echelle(lo, hi, H - BAS, HAUT)
  const ticks = graduations(lo, hi, 6)
  const resume = `Solde de ${fmtMd(resultat.solde, { signe: true })}.`
  return (
    <div>
      <div ref={ref} className="w-full min-w-0 overflow-x-auto" tabIndex={0} role="region" aria-label="Cascade du solde, défilement horizontal possible">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`} className="h-auto w-full min-w-[760px]">
          <title id={`${id}-t`}>Cascade du solde budgétaire</title>
          <desc id={`${id}-d`}>
            {`${resume} Barres successives : dépenses, recettes du cadrage, recettes année pleine, retours directs, retours indirects, coûts évités, effet récessif, leviers monétaires, frictions puis solde. Les valeurs sont dans le tableau de données ci-dessous.`}
          </desc>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeDasharray={t === 0 ? undefined : '3 3'} strokeWidth={t === 0 ? 1.5 : 1} />
              <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-ink-soft)">
                {t}
              </text>
            </g>
          ))}
          {rects.map((r, i) => {
            const x = L + i * PAS + 8
            const haut = Math.min(y(r.debut), y(r.fin))
            const h = Math.max(1.5, Math.abs(y(r.debut) - y(r.fin)))
            const couleur = r.total ? 'var(--color-brand)' : r.valeur >= 0 ? 'var(--color-positif)' : 'var(--color-negatif)'
            const lignes = couper(r.label, maxCar)
            return (
              <g key={r.label}>
                <rect x={x} y={haut} width={PAS - 16} height={h} fill={couleur} rx={2} />
                <text x={x + (PAS - 16) / 2} y={r.valeur >= 0 ? haut - 5 : haut + h + 13} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-ink)" className="nombre">
                  {fmtMd(r.valeur, { signe: true, unite: false })}
                </text>
                {lignes.map((l, k) => (
                  <text key={k} x={x + (PAS - 16) / 2} y={H - BAS + 18 + k * 13} textAnchor="middle" fontSize="11" fill="var(--color-ink)">
                    {l}
                  </text>
                ))}
              </g>
            )
          })}
          <text x={4} y={12} fontSize="11" fill="var(--color-ink-soft)">Md€/an</text>
        </svg>
      </div>
      <TableauDonnees
        legende="Composantes de la cascade du solde"
        colonnes={['Composante', 'Md€/an']}
        lignes={barres.map((b) => [b.label, fmtMd(b.valeur, { signe: true, unite: false })])}
      />
    </div>
  )
}
