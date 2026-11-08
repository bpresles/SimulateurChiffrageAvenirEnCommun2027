import type { SourceId } from './sources'

/** Faits publiés sur le pôle public bancaire (S4). Aucune logique. */
export interface FaitPole {
  libelle: string
  valeur: string
  refs: SourceId[]
}

export const POLE_BANCAIRE_FAITS: FaitPole[] = [
  { libelle: 'Fonds injectés dans l’économie', valeur: '+100 Md€/an : d’environ 100 à environ 200 Md€/an', refs: ['S4'] },
  { libelle: 'Ressources : SFIL', valeur: '+30 Md€', refs: ['S4'] },
  { libelle: 'Ressources : centralisation du livret A de 60 à 80 %', valeur: '+140 Md€', refs: ['S4'] },
  { libelle: 'Ressources : plafond du livret A de 23 000 à 30 000 €', valeur: '+40 Md€', refs: ['S4'] },
  { libelle: 'Autres ressources', valeur: 'Livret B ; refinancement auprès de la BCE « comme le font toutes les banques dans le cadre des traités »', refs: ['S4'] },
  { libelle: 'Équilibre financier', valeur: 'Le pôle « doit rester à l’équilibre financier », agit « sans peser sur le budget de l’État » et ne sera pas une administration publique au sens de la comptabilité nationale.', refs: ['S4'] },
]

export const NOTE_BONIFICATION =
  'Hypothèse de modélisation : le programme (S4) affirme l’équilibre financier du pôle ; seuls l’escompte à taux zéro pour les TPE-PME (S6) et des aides à la pierre compensant la hausse du taux du livret A (S4) pourraient peser sur le budget, sans montant officiel.'

export const NOTE_SECTEURS =
  'Les secteurs sont cités par le programme (S1, S4) : logement, transports, énergie, industrialisation, acier, textile, médicament, agriculture bio, numérique, robotique, spatial, maritime, eau, réseaux. Les montants associés sont des hypothèses non sourcées.'
