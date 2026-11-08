import type { Fourchette } from './budgetAn1'
import type { StatutFiabilite } from './sources'

export interface LigneAnneePleine {
  id: string
  libelle: string
  montant: number
  fourchette: Fourchette
  statut: StatutFiabilite
  commentaire?: string
}

const l = (id: string, libelle: string, montant: number, min: number, max: number, commentaire?: string): LigneAnneePleine => ({
  id, libelle, montant, fourchette: { min, max }, statut: 'hypothese-non-sourcee', commentaire,
})

export const DEPENSES_ANNEE_PLEINE: LigneAnneePleine[] = [
  l('ap-d-retraite', 'Retraite à 60 ans et pension au SMIC', 42, 35, 52),
  l('ap-d-secu', '100 % Sécu et 100 000 soignants', 26, 20, 30),
  l('ap-d-minima', 'RSA/ASPA au seuil de pauvreté', 17, 14, 21),
]

export const RECETTES_ANNEE_PLEINE: LigneAnneePleine[] = [
  l('ap-r-dividendes', 'Cotisations sur dividendes', 19, 14, 22),
  l('ap-r-patronales', 'Cotisations patronales et fin des exonérations', 20, 16, 24),
  l('ap-r-mutuelles', 'Bascule des mutuelles', 23, 19, 25, 'Remplace des primes existantes.'),
  l('ap-r-ir', 'IR à 14 tranches et CSG progressive', 22, 16, 26),
]
