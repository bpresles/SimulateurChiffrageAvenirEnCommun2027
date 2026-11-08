import { STATUTS, type StatutFiabilite } from '../../data/sources'

const STYLES: Record<StatutFiabilite, string> = {
  officiel: 'bg-brand-soft text-brand border-brand/30',
  'estimation-externe': 'bg-info-soft text-info border-info/30',
  'hypothese-non-sourcee': 'bg-attention-soft text-attention border-attention/30',
  'hypothese-modele': 'bg-neutre-soft text-ink-soft border-line',
}

export function Badge({ statut, court = false }: { statut: StatutFiabilite; court?: boolean }) {
  const info = STATUTS[statut]
  return (
    <span
      title={info.description}
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight ${STYLES[statut]}`}
    >
      {court ? info.label.replace('Hypothèse de modélisation', 'Modélisation').replace('Hypothèse non sourcée', 'Non sourcée') : info.label}
    </span>
  )
}
