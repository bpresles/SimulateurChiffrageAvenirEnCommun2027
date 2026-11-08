/** Échelle linéaire simple et graduations « jolies ». */
export function echelle(d0: number, d1: number, r0: number, r1: number) {
  const span = d1 - d0 || 1
  return (v: number) => r0 + ((v - d0) / span) * (r1 - r0)
}

export function graduations(min: number, max: number, cible = 5): number[] {
  const span = max - min || 1
  const brut = span / cible
  const mag = Math.pow(10, Math.floor(Math.log10(brut)))
  const norm = brut / mag
  const pas = (norm >= 5 ? 5 : norm >= 2 ? 2 : 1) * mag
  const out: number[] = []
  for (let v = Math.ceil(min / pas) * pas; v <= max + 1e-9; v += pas) out.push(Math.round(v / pas) * pas)
  return out
}

export function bornes(valeurs: number[], marge = 0.08): [number, number] {
  const lo = Math.min(...valeurs)
  const hi = Math.max(...valeurs)
  const m = (hi - lo || 1) * marge
  return [lo - m, hi + m]
}
