import { RotateCcw } from 'lucide-react'

interface Props {
  onClick: () => void
  /** Faux si les réglages sont déjà à leurs valeurs de référence. */
  actif: boolean
  compact?: boolean
}

export function BoutonReinitialiser({ onClick, actif, compact = false }: Props) {
  const info = actif ? 'Réinitialiser les réglages (préréglage choisi et hypothèses avancées)' : 'Réglages déjà à leurs valeurs par défaut'
  return (
    <button
      type="button"
      onClick={actif ? onClick : undefined}
      disabled={!actif}
      aria-disabled={!actif}
      title={info}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-line font-semibold transition-colors ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
      } ${actif ? 'bg-surface text-brand hover:bg-brand-soft' : 'bg-surface-alt text-ink-soft opacity-60'}`}
    >
      <RotateCcw aria-hidden="true" className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      Réinitialiser les réglages
    </button>
  )
}
