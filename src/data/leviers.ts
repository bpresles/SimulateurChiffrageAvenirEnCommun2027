import type { Fourchette } from './budgetAn1'
import { HYPOTHESES } from './hypotheses'
import type { SourceId, StatutFiabilite } from './sources'

export type CleLevier = 'gelBce' | 'primaireBce' | 'circuitTresor' | 'cades'

export interface ComposanteLevier {
  libelle: string
  /** Montant en Md€/an, ou null si non chiffré. */
  montant: number | null
  texte?: string
  /** Valeur calculée par le moteur selon le scénario actif (affichée à la place du montant). */
  dynamique?: 'bonification'
}

export interface OrdreGrandeur {
  libelle: string
  valeur: string
  /** Sources officielles ; sans référence, l'ordre de grandeur reste à vérifier. */
  refs?: SourceId[]
}

export interface BadgeJuridique {
  texte: string
  /** « bce » : décision ou modification institutionnelle requise ; « programme » : simple mesure du programme. */
  ton: 'bce' | 'programme'
}

export interface Levier {
  id: CleLevier
  numero: number
  titre: string
  /** Montant brut avant correction, Md€/an. */
  montantBrut: number
  fourchette: Fourchette
  statutMontant: StatutFiabilite
  mecanisme: string
  /** Limites propres au levier, affichées sur sa carte. */
  limites?: string[]
  decomposition: ComposanteLevier[]
  cadreJuridique: string
  badgeJuridique: BadgeJuridique
  /** Sources officielles du montant brut. */
  refsMontant?: SourceId[]
  /** Façon dont le moteur compte ce levier après correction. */
  comptageMoteur: string
  /** Comptage du modèle d'origine, pour comparaison. */
  comptageOrigine: string
  ordresGrandeur: OrdreGrandeur[]
}


export const LEVIERS: Levier[] = [
  {
    id: 'gelBce', numero: 1,
    titre: 'Gel ou conversion en dette perpétuelle à 0 % du stock détenu par la BCE, et fin des OATi',
    montantBrut: HYPOTHESES.gelBce.valeur, fourchette: { min: 0, max: HYPOTHESES.gelBce.valeur }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'Selon le programme (S1, S6), la BCE serait invitée à annuler ou transformer en dettes perpétuelles à taux nul la part de dette publique française qu’elle détient, et l’émission d’OATi (titres indexés sur l’inflation) prendrait fin. La fin des OATi porte sur les nouvelles émissions : le gain est progressif. L’économie porte sur les intérêts versés.',
    decomposition: [
      { libelle: 'Intérêts économisés sur les titres détenus par l’Eurosystème (597,0 Md€ au 31/10/2026, S8 + S9, × taux implicite : hypothèse non sourcée)', montant: HYPOTHESES.gelBceInterets.valeur },
      { libelle: 'Fin des OATi (nouvelles émissions ; hypothèse non sourcée)', montant: HYPOTHESES.gelBceOati.valeur },
      { libelle: 'Effet sur le ratio dette/PIB comptable en cas d’extinction du stock', montant: null, texte: 'Voir remarque sur la dette au sens de Maastricht.' },
    ],
    limites: [
      'Le stock baisse chaque année (titres échus non réinvestis) : le gain d’un gel diminue donc avec le temps, ce que le modèle « année pleine » ne représente pas.',
      'Hypothèse du modèle (non présente dans les sources S1, S4, S6) : les réserves bancaires créées par les rachats de la BCE sont converties en réserves obligatoires non rémunérées. La Banque de France cesse à la fois de percevoir les intérêts des titres gelés et de rémunérer ces réserves : l’opération est neutre pour elle et l’État conserve le gain brut. Le coût est supporté par les banques, qui perdent cette rémunération. Décision relevant de la BCE.',
    ],
    cadreJuridique:
      'Nécessite une décision de la BCE. Selon le programme (S1), pas de révision des traités nécessaire. Une conversion en dette perpétuelle ne réduit pas la dette au sens de Maastricht.',
    badgeJuridique: { texte: 'Nécessite une décision de la BCE. Selon le programme (S1), pas de révision des traités nécessaire.', ton: 'bce' },
    comptageMoteur: 'Compté intégralement (gain brut calculé d’environ 18,2 Md€ × part activée) en année pleine uniquement, comme gain d’intérêts sur le solde. Le gain brut est recalé au prorata du stock détenu (597,0 Md€ au 31/10/2026) ; le modèle d’origine retenait 22 Md€. Aucune autre correction appliquée.',
    comptageOrigine: 'Identique.',
    ordresGrandeur: [
      { libelle: 'Titres publics français détenus par l’Eurosystème', valeur: '597,0 Md€ au 31/10/2026 (PSPP 359,5 + PEPP 237,5), contre 663,1 Md€ au 31/12/2025', refs: ['S8', 'S9'] },
      { libelle: 'Banque de France, ses seuls avoirs, en coût amorti', valeur: '488 Md€ au 30/06/2026', refs: ['S7'] },
      { libelle: 'Dette détenue selon le programme (S1)', valeur: '600 Md€ (18 % de la dette), diminués de 80 Md€ en 2026, soit 13 % de la dette en 2027 ; ces 600 Md€ correspondent à la série BCE au 30/06/2026 (600,6 Md€)', refs: ['S1'] },
      { libelle: 'Charge d’intérêts de la dette publique', valeur: '2,9 % du PIB en 2027', refs: ['S1'] },
      { libelle: 'Dette publique', valeur: '3 595 Md€ en 2026', refs: ['S1'] },
    ],
  },
  {
    id: 'primaireBce', numero: 2,
    titre: 'Financement direct des États par la banque centrale (sans passer par les banques privées)',
    montantBrut: HYPOTHESES.primaireBceCorrige.valeur, fourchette: { min: 0, max: HYPOTHESES.primaireBceCorrige.valeur }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'Selon le programme (S6), il s’agit de proposer la modification du TFUE et du statut de la BCE pour lui permettre d’acheter de la dette publique sans passer par les banques privées, en mettant notamment en place une autorisation de découvert des États. Selon S4, le pôle public bancaire se refinancerait auprès de la BCE « comme le font toutes les banques dans le cadre des traités ». Hypothèse du modèle (non sourcée) : ce canal fournirait un financement à 0 % de la transition écologique et du pôle, de sorte que le pôle prêterait à 0 % sans bonification de l’État.',
    decomposition: [
      { libelle: 'Suppression du coût de bonification des prêts du pôle (friction évitée selon le taux réglé ; 0 % par défaut, S4)', montant: null, dynamique: 'bonification' },
      { libelle: 'Financement à 0 % des investissements publics (hypothèse du modèle, non sourcée)', montant: 6.5 },
      { libelle: 'Escompte à taux zéro pour les TPE-PME par le pôle public bancaire (S6)', montant: null, texte: 'Mesure du programme, non chiffrée.' },
    ],
    cadreJuridique:
      'Le financement monétaire direct des États est interdit par l’article 123 TFUE. Le programme (S6) propose de modifier le TFUE et le statut de la BCE pour lui permettre d’acheter de la dette publique sans passer par les banques privées, avec une autorisation de découvert des États.',
    badgeJuridique: { texte: 'Nécessite une modification du TFUE et des statuts de la BCE, proposée par le programme (S6).', ton: 'bce' },
    comptageMoteur:
      'Seuls les 6,5 Md€ de financement à 0 % sont comptés en gain. La bonification est une friction du modèle, calculée au taux réglé en hypothèses avancées (0 % par défaut : le programme affirme l’équilibre financier du pôle, S4). Si ce taux est positif, passer de 0 à 100 % du levier supprime cette friction ; la compter aussi comme gain serait un double compte.',
    comptageOrigine: '14,5 Md€ comptés en gain, et la bonification également comptée en friction quand le levier est partiel.',
    ordresGrandeur: [
      { libelle: 'Taux de refinancement via les spécialistes en valeurs du Trésor (SVT)', valeur: '3,1 à 3,5 % (hypothèse du modèle, à vérifier)' },
      { libelle: 'Pôle public bancaire', valeur: 'Équilibre financier affirmé par le programme : le coût de bonification est une hypothèse de modélisation', refs: ['S4'] },
    ],
  },
  {
    id: 'circuitTresor', numero: 3,
    titre: 'Rétablissement d’un « circuit du Trésor » (modèle d’après-guerre modernisé)',
    montantBrut: 8.5, fourchette: { min: 4, max: 10 }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'Selon le programme, il s’agit de « réinstaurer un circuit du Trésor pour sortir la dette publique de la main des marchés financiers » (S6), dans une « version modernisée en s’appuyant sur le pôle public bancaire et les acteurs financiers qui opèrent en France » (S1). Hypothèses du modèle (non sourcées) : planchers obligatoires de bons du Trésor pour les banques et orientation d’une part de l’assurance-vie vers des titres publics.',
    decomposition: [
      { libelle: 'Planchers obligatoires d’effets publics (hypothèse du modèle, non sourcée)', montant: 5.5 },
      { libelle: 'Orientation d’une part de l’assurance-vie (hypothèse du modèle, non sourcée)', montant: 3.0 },
      { libelle: 'Centralisation accrue du Livret A', montant: null, texte: 'Ressource du pôle public bancaire (S4), non comptée comme gain budgétaire.' },
      { libelle: 'Neutralisation de la prime de risque obligataire (hypothèse du modèle)', montant: null, texte: 'Représentée par la friction de spread (11 Md€ sans le levier).' },
    ],
    cadreJuridique:
      'Largement de niveau national (réglementation bancaire et épargne réglementée), mais soumis au droit européen sur la libre circulation des capitaux et à la supervision prudentielle. Validation juridique requise.',
    badgeJuridique: { texte: 'Mesure du programme (S6)', ton: 'programme' },
    comptageMoteur: 'Gain de 8,5 Md€ × part activée (moitié en An 1) ; sans le levier, une friction de spread de 11 Md€ × (1 − part activée) est comptée en année pleine.',
    comptageOrigine: 'Identique.',
    ordresGrandeur: [
      { libelle: 'Épargne des ménages', valeur: '6 600 Md€ selon S1 (6 500 Md€ selon S4)', refs: ['S1', 'S4'] },
    ],
  },
  {
    id: 'cades', numero: 4,
    titre: 'Arrêt de l’amortissement accéléré de la dette sociale par la CADES',
    montantBrut: 19, fourchette: { min: 9.5, max: 19 }, statutMontant: 'officiel', refsMontant: ['S6'],
    mecanisme:
      'Selon le programme (S6), il faut « réformer la Caisse d’amortissement de la dette sociale (Cades), qui prive la Sécurité sociale de 19 milliards d’euros par an ». Hypothèse du modèle (non sourcée) : ce flux de CRDS et de CSG serait réaffecté à l’Assurance maladie et aux retraites.',
    decomposition: [
      { libelle: 'Montant que la Cades prélève sur la Sécurité sociale (S6) ; réaffectation à l’Assurance maladie et aux retraites : hypothèse du modèle', montant: 19.0 },
    ],
    cadreJuridique:
      'Relève de la loi organique relative aux lois de financement de la Sécurité sociale, votée par le Parlement.',
    badgeJuridique: { texte: 'Mesure du programme (S6)', ton: 'programme' },
    comptageMoteur:
      'Par défaut, la réaffectation (19 Md€ × part activée) est comptée dans le solde, comme le chiffre le programme (S6). En lecture APU consolidée, la CRDS est déjà une recette de la trajectoire de base : la réaffecter n’ajoute pas de recette publique mais arrête l’amortissement de la dette, c’est un gain pour la Sécurité sociale. Décocher l’option « Compter la réaffectation CADES » applique cette lecture (0 dans le solde).',
    comptageOrigine: '19 Md€ comptés comme gain du solde public consolidé.',
    ordresGrandeur: [
      { libelle: 'Montant que la CADES prélève sur la Sécurité sociale', valeur: '19 Md€/an', refs: ['S6'] },
    ],
  },
]
