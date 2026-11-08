import { useId, type ReactNode } from 'react'

interface Props {
  label: string
  valeur: number
  min: number
  max: number
  pas: number
  onChange: (v: number) => void
  /** Texte affiché à droite du libellé. */
  affichage: string
  /** Valeur lue par les lecteurs d'écran. */
  texteVocal: string
  disabled?: boolean
  aide?: ReactNode
  badge?: ReactNode
}

export function Slider({ label, valeur, min, max, pas, onChange, affichage, texteVocal, disabled, aide, badge }: Props) {
  const id = useId()
  return (
    <div className="py-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <label htmlFor={id} className="text-sm font-semibold">
          {label}
        </label>
        <span className="nombre text-sm font-medium text-brand" aria-hidden="true">
          {affichage}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={texteVocal}
        aria-describedby={aide ? `${id}-aide` : undefined}
      />
      {(aide || badge) && (
        <div id={`${id}-aide`} className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          {badge}
          {aide}
        </div>
      )}
    </div>
  )
}
