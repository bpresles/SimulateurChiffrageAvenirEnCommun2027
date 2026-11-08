import type { Fourchette } from './budgetAn1'
import type { StatutFiabilite } from './sources'

export type CleLevier = 'gelBce' | 'primaireBce' | 'circuitTresor' | 'cades'

export interface ComposanteLevier {
  libelle: string
  /** Montant en Md€/an, ou null si non chiffré. */
  montant: number | null
  texte?: string
}

export interface OrdreGrandeur {
  libelle: string
  valeur: string
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
  decomposition: ComposanteLevier[]
  cadreJuridique: string
  /** Vrai si le levier requiert une évolution des traités ou un accord BCE. */
  necessiteBce: boolean
  /** Façon dont le moteur compte ce levier après correction. */
  comptageMoteur: string
  /** Comptage du modèle d'origine, pour comparaison. */
  comptageOrigine: string
  ordresGrandeur: OrdreGrandeur[]
}

export const BADGE_BCE = 'Nécessite une évolution des traités ou un accord BCE (art. 123 TFUE)'

export const LEVIERS: Levier[] = [
  {
    id: 'gelBce', numero: 1,
    titre: 'Gel ou conversion en dette perpétuelle à 0 % du stock détenu par la BCE, et fin des OATi',
    montantBrut: 22, fourchette: { min: 0, max: 22 }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'Selon le programme, les titres publics français détenus par la Banque de France et l’Eurosystème à la suite des programmes d’achats d’actifs seraient gelés ou convertis en dette perpétuelle à 0 %, et les titres indexés sur l’inflation (OATi) seraient arrêtés ou convertis. L’économie porte sur les intérêts versés.',
    decomposition: [
      { libelle: 'Intérêts économisés sur le stock détenu par la BCE (~750 Md€)', montant: 18.5 },
      { libelle: 'Arrêt et conversion des OATi', montant: 3.5 },
      { libelle: 'Effet sur le ratio dette/PIB comptable en cas d’extinction du stock', montant: null, texte: 'Voir remarque sur la dette au sens de Maastricht.' },
    ],
    cadreJuridique:
      'Une conversion en dette perpétuelle ou une annulation des titres détenus par l’Eurosystème se heurte à l’article 123 TFUE (financement monétaire) et exige une évolution des traités ou un accord au Conseil des gouverneurs de la BCE. Une conversion en dette perpétuelle ne réduit pas la dette au sens de Maastricht.',
    necessiteBce: true,
    comptageMoteur: 'Compté intégralement (22 Md€ × part activée) en année pleine uniquement, comme gain d’intérêts sur le solde. Aucune correction appliquée.',
    comptageOrigine: 'Identique.',
    ordresGrandeur: [
      { libelle: 'Part de la dette détenue par l’Eurosystème', valeur: '21 à 25 % (~750 à 850 Md€), à vérifier' },
      { libelle: 'Charge d’intérêts de la dette publique', valeur: '~70 Md€/an, à vérifier' },
      { libelle: 'Dette publique', valeur: '~3 595 Md€ (118 % du PIB), à vérifier' },
    ],
  },
  {
    id: 'primaireBce', numero: 2,
    titre: 'Emprunt direct à la banque centrale sur le marché primaire à 0 %',
    montantBrut: 14.5, fourchette: { min: 0, max: 14.5 }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'Aujourd’hui, l’État emprunte par l’intermédiaire des spécialistes en valeurs du Trésor (SVT) à des taux de l’ordre de 3 %. Selon le programme, la banque centrale financerait directement à 0 % la transition écologique et le Pôle public bancaire. Le Pôle prêterait alors à 0 % sans que l’État ait à subventionner l’écart (bonification).',
    decomposition: [
      { libelle: 'Suppression du coût de bonification des prêts à 0 % du Pôle bancaire', montant: 8.0 },
      { libelle: 'Financement primaire à 0 % des investissements publics', montant: 6.5 },
      { libelle: 'Escompte à 0 % pour les investissements verts des PME/TPE', montant: null, texte: 'Crédit sélectif, non chiffré.' },
    ],
    cadreJuridique:
      'Le financement monétaire direct des États est interdit par l’article 123 TFUE. Le levier suppose une évolution des traités ou un accord de la BCE.',
    necessiteBce: true,
    comptageMoteur:
      'Seuls les 6,5 Md€ de financement à 0 % sont comptés en gain. Les 8 Md€ de bonification sont une friction du modèle : sans le levier le Pôle prête à 0 % et l’État paie la bonification ; avec le levier cette friction disparaît. La compter aussi comme gain serait un double compte. Le gain total de passer de 0 à 100 % est donc 6,5 Md€ plus la friction de bonification évitée.',
    comptageOrigine: '14,5 Md€ comptés en gain, et la bonification également comptée en friction quand le levier est partiel.',
    ordresGrandeur: [
      { libelle: 'Taux de refinancement via les SVT', valeur: '3,1 à 3,5 %, à vérifier' },
    ],
  },
  {
    id: 'circuitTresor', numero: 3,
    titre: 'Rétablissement d’un « circuit du Trésor » (modèle d’après-guerre modernisé)',
    montantBrut: 8.5, fourchette: { min: 4, max: 10 }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'Selon le programme, l’État organiserait un circuit de collecte de l’épargne nationale pour réduire sa dépendance aux marchés : planchers obligatoires de bons du Trésor pour les banques, centralisation accrue du Livret A à la Caisse des Dépôts, orientation d’une part de l’assurance-vie vers des titres publics de transition.',
    decomposition: [
      { libelle: 'Planchers obligatoires d’effets publics', montant: 5.5 },
      { libelle: 'Orientation d’une part de l’assurance-vie', montant: 3.0 },
      { libelle: 'Centralisation accrue du Livret A/B', montant: null, texte: 'Flux de l’ordre de 100 Md€/an, non compté comme gain budgétaire.' },
      { libelle: 'Neutralisation de la prime de risque obligataire', montant: null, texte: 'Représentée par la friction de spread (11 Md€ sans le levier).' },
    ],
    cadreJuridique:
      'Largement de niveau national (réglementation bancaire et épargne réglementée), mais soumis au droit européen sur la libre circulation des capitaux et à la supervision prudentielle. Validation juridique requise.',
    necessiteBce: false,
    comptageMoteur: 'Gain de 8,5 Md€ × part activée (moitié en An 1) ; sans le levier, une friction de spread de 11 Md€ × (1 − part activée) est comptée en année pleine.',
    comptageOrigine: 'Identique.',
    ordresGrandeur: [
      { libelle: 'Encours d’épargne financière des ménages', valeur: '~6 000 Md€, à vérifier' },
    ],
  },
  {
    id: 'cades', numero: 4,
    titre: 'Arrêt de l’amortissement accéléré de la dette sociale par la CADES',
    montantBrut: 19, fourchette: { min: 9.5, max: 19 }, statutMontant: 'hypothese-non-sourcee',
    mecanisme:
      'La CADES affecte aujourd’hui environ 19 Md€ par an de CRDS et de CSG à l’amortissement de la dette sociale. Selon le programme, ce flux serait réaffecté à l’Assurance maladie et aux retraites, et la dette sociale serait maintenue au sein de la dette publique générale.',
    decomposition: [
      { libelle: 'Réaffectation du flux CRDS/CSG vers l’Assurance maladie et la CNAV', montant: 19.0 },
      { libelle: 'Part du coût de la retraite à 60 ans couverte (selon le programme)', montant: null, texte: 'Environ 48 %, non vérifié.' },
    ],
    cadreJuridique:
      'Relève de la loi organique relative aux lois de financement de la Sécurité sociale, votée par le Parlement.',
    necessiteBce: false,
    comptageMoteur:
      'Par défaut, 0 dans le solde consolidé : la CRDS est déjà une recette de la trajectoire de base. La réaffecter ne crée pas de recette publique, elle arrête seulement l’amortissement de la dette. C’est un gain pour la Sécurité sociale, pas pour le solde consolidé. Une option permet de la compter quand même.',
    comptageOrigine: '19 Md€ comptés comme gain du solde public consolidé.',
    ordresGrandeur: [],
  },
]
