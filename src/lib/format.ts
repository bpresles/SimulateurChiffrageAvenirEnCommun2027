const NBSP = ' '

const cache = new Map<string, Intl.NumberFormat>()
function nf(decimales: number, signe: boolean): Intl.NumberFormat {
  const cle = `${decimales}|${signe}`
  let f = cache.get(cle)
  if (!f) {
    f = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
      signDisplay: signe ? 'exceptZero' : 'auto',
    })
    cache.set(cle, f)
  }
  return f
}

/** Évite l'affichage « -0,0 » après arrondi. */
const net = (v: number, d: number) => (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v)

export function fmtNombre(v: number, decimales = 1, signe = false): string {
  return nf(decimales, signe).format(net(v, decimales))
}

/** Montant en milliards d'euros. */
export function fmtMd(v: number, opts: { decimales?: number; signe?: boolean; unite?: boolean } = {}): string {
  const { decimales = 1, signe = false, unite = true } = opts
  const s = fmtNombre(v, decimales, signe)
  return unite ? `${s}${NBSP}Md€` : s
}

export function fmtPct(v: number, decimales = 1, signe = false): string {
  return `${fmtNombre(v, decimales, signe)}${NBSP}%`
}

export function fmtMult(v: number): string {
  return `${fmtNombre(v, 2)}${NBSP}x`
}

/** Emplois arrondis au millier le plus proche. */
export function fmtEmplois(v: number, signe = false): string {
  const arrondi = Math.round(v / 1000) * 1000
  return `${nf(0, signe).format(arrondi)}${NBSP}emplois`
}

/** Valeur numérique d'une hypothèse avec son unité. */
export function fmtValeurUnite(v: number, unite: string): string {
  const d = Number.isInteger(v) ? 0 : Math.abs(v) < 1 ? 3 : 2
  const s = nf(d, false).format(v)
  return unite ? `${s}${NBSP}${unite}` : s
}

export function fmtFourchette(min: number | null, max: number | null, decimales = 1): string {
  if (min === null && max === null) return '—'
  if (min === null) return `jusqu’à ${fmtNombre(max!, decimales)}`
  if (max === null) return `à partir de ${fmtNombre(min, decimales)}`
  return `${fmtNombre(min, decimales)} à ${fmtNombre(max, decimales)}`
}
