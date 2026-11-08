import { hv } from '../data/hypotheses'
import { agregerFilieres } from './filieres'
import type { CleCorrection, ModelOptions, ResultatSimulation, SimulationParams } from './types'

export const OPTIONS_PAR_DEFAUT: ModelOptions = {
  corrections: { bonification: true, cades: true, coutsEvites: true, effetRecessif: true },
}

/** Comportement du modèle d'origine : aucune correction. */
export const OPTIONS_ORIGINE: ModelOptions = {
  corrections: { bonification: false, cades: false, coutsEvites: false, effetRecessif: false },
}

export const CLES_CORRECTIONS: CleCorrection[] = ['bonification', 'cades', 'coutsEvites', 'effetRecessif']

/**
 * Moteur de simulation. Unités : Md€/an. Le solde est la variation du solde
 * des APU consolidé par rapport à la trajectoire sans réforme.
 * Aucun arrondi intermédiaire.
 */
export function simuler(
  params: SimulationParams,
  options: ModelOptions = OPTIONS_PAR_DEFAUT,
  investissements?: readonly number[],
): ResultatSimulation {
  const AP = params.horizon === 'anneePleine'
  const c = options.corrections
  const pct = (v: number) => v / 100
  const mult = params.multiplicateur
  const ratioMult = mult / hv('multiplicateurRef')

  const agregat = agregerFilieres(params.percentile, mult, investissements)
  const roiScale = AP ? 1 : hv('roiScaleAn1')

  // Dépenses
  const ajoutEtat = AP ? Math.max(0, agregat.totalEtat - hv('ecologieAn1')) : 0
  const sociales = AP ? hv('depensesSocialesAP') : 0
  const depenses = {
    base: hv('depensesAn1'),
    ajoutEtat,
    sociales,
    total: hv('depensesAn1') + ajoutEtat + sociales,
  }

  // Recettes
  const recettesAn1 = hv('recettesAn1') * pct(params.recouvrementPct)
  const recettesAPNominal = hv('recettesAP') * pct(params.recettesAnneePleinePct)
  const el = hv('recettesAPElasticiteBase')
  const recettesAP = AP ? recettesAPNominal * (el + (1 - el) * pct(params.recouvrementPct)) : 0

  // Retours
  const retoursCourants =
    params.retoursCourantsBase * (AP ? 1 : hv('retoursCourantsAn1Ratio')) * ratioMult
  const roiDirectFilieres = agregat.totalDirect * roiScale
  const roiDirect = roiDirectFilieres + retoursCourants
  const roiIndirect = agregat.totalIndirect * roiScale
  const coutsEvitesBruts = agregat.totalEvites * roiScale
  const coutsEvites = coutsEvitesBruts * (c.coutsEvites ? pct(params.partBudgetaireCoutsEvitesPct) : 1)

  // Effet récessif des prélèvements nouveaux
  const basePrelevements = recettesAn1 + recettesAP * hv('basePrelevementsAP')
  const effetRecessif = c.effetRecessif
    ? -(params.multiplicateurPrelevements * basePrelevements * hv('tauxRetourFiscalPib'))
    : 0

  // Leviers
  const gelBce = AP ? hv('gelBce') * pct(params.gelBcePct) : 0
  const cadesBrute = AP ? hv('cades') * pct(params.cadesPct) : 0
  const cadesComptee = c.cades ? (params.cadesCompteDansSolde ? cadesBrute : 0) : cadesBrute
  const primaire =
    (c.bonification ? hv('primaireBceCorrige') : hv('primaireBceGemini')) *
    pct(params.primaireBcePct) *
    (AP ? 1 : hv('leviersAn1Ratio'))
  const tresor = hv('tresor') * pct(params.circuitTresorPct) * (AP ? 1 : hv('leviersAn1Ratio'))
  const leviersTotal = gelBce + cadesComptee + primaire + tresor

  // Frictions
  const importations = Math.max(hv('fuiteImportMin'), (hv('fuiteImportSeuil') - mult) * hv('fuiteImportPente'))
  const bonification =
    agregat.totalBanque * hv('tauxBonification') * (1 - pct(params.primaireBcePct)) * (c.bonification ? roiScale : 1)
  const spread = AP ? (1 - pct(params.circuitTresorPct)) * hv('risqueSpread') : 0
  const frictionsTotal = AP
    ? bonification + spread + importations
    : importations * hv('fuiteImportAn1Ratio') + (c.bonification ? bonification : 0)
  const frictions = {
    bonification: AP || c.bonification ? bonification : 0,
    spread,
    importations: AP ? importations : importations * hv('fuiteImportAn1Ratio'),
    total: frictionsTotal,
  }

  const solde =
    recettesAn1 + recettesAP - depenses.total +
    roiDirect + roiIndirect + coutsEvites + effetRecessif +
    leviersTotal - frictionsTotal

  const retoursFilieres = roiDirectFilieres + roiIndirect + coutsEvites
  const autofinancementPct = (retoursFilieres / (agregat.totalInvest * roiScale)) * 100

  return {
    horizon: params.horizon,
    roiScale,
    agregat,
    depenses,
    recettesAn1,
    recettesAP,
    recettesAPNominal,
    retoursCourants,
    roiDirect,
    roiDirectFilieres,
    roiIndirect,
    coutsEvitesBruts,
    coutsEvites,
    basePrelevements,
    effetRecessif,
    leviers: { gelBce, cadesBrute, cadesComptee, primaire, tresor, total: leviersTotal },
    frictions,
    leviersNets: leviersTotal - frictionsTotal,
    retoursFilieres,
    autofinancementPct,
    solde,
  }
}

export interface ImpactCorrection {
  cle: CleCorrection
  /** solde(options) − solde(options sans cette correction) : apport de la correction dans le modèle courant. */
  marginal: number
  /** solde(seule cette correction) − solde(modèle d'origine). */
  isole: number
}

/** Relance le moteur correction par correction. */
export function impactCorrections(
  params: SimulationParams,
  options: ModelOptions = OPTIONS_PAR_DEFAUT,
): ImpactCorrection[] {
  const soldeAvec = simuler(params, options).solde
  const soldeOrigine = simuler(params, OPTIONS_ORIGINE).solde
  return CLES_CORRECTIONS.map((cle) => {
    const sans: ModelOptions = { corrections: { ...options.corrections, [cle]: false } }
    const seule: ModelOptions = { corrections: { ...OPTIONS_ORIGINE.corrections, [cle]: true } }
    return {
      cle,
      marginal: soldeAvec - simuler(params, sans).solde,
      isole: simuler(params, seule).solde - soldeOrigine,
    }
  })
}
