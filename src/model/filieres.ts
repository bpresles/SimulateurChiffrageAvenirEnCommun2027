import { FILIERES, type Filiere } from '../data/filieres'
import { hv } from '../data/hypotheses'
import type { Agregat, FiliereCalculee } from './types'
import { interpPercentile } from './percentile'

/**
 * Agrégation des filières, à l'identique du modèle d'origine
 * (getAggregated10Sectors), sans l'arrondi des emplois par filière.
 * Si `investissements` est fourni (un par filière), il remplace l'interpolation.
 */
export function agregerFilieres(
  percentile: number,
  multiplicateur: number,
  investissements?: readonly number[],
  filieres: readonly Filiere[] = FILIERES,
): Agregat {
  const ratioMult = multiplicateur / hv('multiplicateurRef')
  const fe = hv('facteurEvitesFixe')
  const fj = hv('facteurEmploisFixe')
  let totalInvest = 0, totalEtat = 0, totalBanque = 0, totalDirect = 0, totalIndirect = 0, totalEvites = 0, totalEmplois = 0
  const details: FiliereCalculee[] = filieres.map((s, i) => {
    const inv = investissements ? investissements[i] : interpPercentile(s.p10, s.p50, s.p90, percentile)
    const scale = inv / s.p50
    const etat = s.etatP50 * scale
    const banque = s.banqueP50 * scale
    const direct = s.roiDirectP50 * scale
    const indirect = s.roiIndirectP50 * scale * ratioMult
    const evites = s.coutsEvitesP50 * scale * (fe + (1 - fe) * ratioMult)
    const emplois = s.emploisP50 * scale * (fj + (1 - fj) * ratioMult)
    totalInvest += inv
    totalEtat += etat
    totalBanque += banque
    totalDirect += direct
    totalIndirect += indirect
    totalEvites += evites
    totalEmplois += emplois
    return { id: s.id, invest: inv, etat, banque, direct, indirect, evites, emplois }
  })
  return { totalInvest, totalEtat, totalBanque, totalDirect, totalIndirect, totalEvites, totalEmplois, details }
}
