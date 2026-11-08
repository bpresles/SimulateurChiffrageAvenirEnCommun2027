import { EnTete } from './components/layout/EnTete'
import { idOnglet, idPanneau } from './components/layout/Onglets'
import { PiedDePage } from './components/layout/PiedDePage'
import { FilieresTab } from './components/filieres/FilieresTab'
import { LeviersTab } from './components/leviers/LeviersTab'
import { MatriceTab } from './components/matrice/MatriceTab'
import { MethodologieTab } from './components/methodologie/MethodologieTab'
import { SimulateurTab } from './components/simulateur/SimulateurTab'
import { useModele } from './state/useModele'
import { useSimulationParams } from './state/useSimulationParams'

export default function App() {
  const etat = useSimulationParams()
  const modele = useModele(etat.params, etat.rho)
  const horizonLabel = etat.params.horizon === 'an1' ? 'An 1' : 'année pleine'
  const { onglet } = etat
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Aller au contenu
      </a>
      <EnTete onglet={onglet} onChange={etat.setOnglet} solde={modele.resultat.solde} horizonLabel={horizonLabel} />
      <main id="contenu" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div role="tabpanel" id={idPanneau(onglet)} aria-labelledby={idOnglet(onglet)} tabIndex={0}>
          {onglet === 'simulateur' && <SimulateurTab etat={etat} modele={modele} />}
          {onglet === 'filieres' && <FilieresTab params={etat.params} modele={modele} />}
          {onglet === 'leviers' && <LeviersTab resultat={modele.resultat} />}
          {onglet === 'matrice' && <MatriceTab />}
          {onglet === 'methodologie' && <MethodologieTab modele={modele} horizonLabel={horizonLabel} />}
        </div>
      </main>
      <PiedDePage />
    </>
  )
}
