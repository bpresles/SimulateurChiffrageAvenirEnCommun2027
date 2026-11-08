import type { ReactNode } from 'react'

interface Props {
  colonnes: string[]
  lignes: ReactNode[][]
  legende: string
}

/** Alternative accessible aux graphiques : tableau de données repliable. */
export function TableauDonnees({ colonnes, lignes, legende }: Props) {
  return (
    <details className="mt-3 text-sm">
      <summary className="cursor-pointer font-semibold text-brand underline-offset-2 hover:underline">
        Afficher les données du graphique
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <caption className="sr-only">{legende}</caption>
          <thead>
            <tr className="border-b border-line">
              {colonnes.map((c) => (
                <th key={c} scope="col" className="px-2 py-1.5 font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lignes.map((l, i) => (
              <tr key={i} className="border-b border-line/60">
                {l.map((c, j) => (
                  j === 0 ? (
                    <th key={j} scope="row" className="px-2 py-1 font-medium">{c}</th>
                  ) : (
                    <td key={j} className="nombre px-2 py-1">{c}</td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
