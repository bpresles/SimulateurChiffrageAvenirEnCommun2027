/** Interpolation linéaire P10-P50-P90 (identique au modèle d'origine). */
export function interpPercentile(p10: number, p50: number, p90: number, p: number): number {
  if (p <= 50) {
    const t = (p - 10) / 40
    return p10 + t * (p50 - p10)
  }
  const t = (p - 50) / 40
  return p50 + t * (p90 - p50)
}

/** Quantile empirique (interpolation linéaire) d'un échantillon déjà trié, q dans [0,1]. */
export function quantileTrie(trie: ArrayLike<number>, q: number): number {
  const n = trie.length
  if (n === 0) return NaN
  const pos = q * (n - 1)
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return trie[lo] + (pos - lo) * (trie[hi] - trie[lo])
}
