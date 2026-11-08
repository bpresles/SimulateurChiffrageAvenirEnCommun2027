export const MENTION_INDEPENDANCE =
  'Simulateur indépendant, non affilié à La France insoumise ni à aucun parti. Outil pédagogique, pas une prévision.'

export function PiedDePage() {
  return (
    <footer className="mt-10 border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl space-y-1 px-4 py-6 text-sm text-ink-soft sm:px-6">
        <p className="font-semibold text-ink">{MENTION_INDEPENDANCE}</p>
        <p>
          Les montants sont exprimés en milliards d’euros (Md€). Les hypothèses sont explicites et modifiables dans le code source (dossier{' '}
          <code className="nombre">src/data</code>). Aucune donnée personnelle n’est collectée ; aucune ressource externe n’est chargée.
        </p>
      </div>
    </footer>
  )
}
