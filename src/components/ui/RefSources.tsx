import { SOURCES, type SourceId } from '../../data/sources'

/** Références cliquables vers le registre des sources ; l'info-bulle donne titre, date et URL. */
export function RefSources({ refs }: { refs?: SourceId[] }) {
  if (!refs || refs.length === 0) return null
  return (
    <span className="inline-flex flex-wrap gap-1">
      {refs.map((id) => {
        const s = SOURCES[id]
        const info = `${id} — ${s.titre} (${s.date}) : ${s.url}`
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={info}
            aria-label={info}
            className="rounded border border-line bg-surface px-1.5 py-0.5 font-sans text-[11px] font-bold text-brand underline-offset-2 hover:underline"
          >
            {id}
          </a>
        )
      })}
    </span>
  )
}
