import { QuadriKidsOptionsSpecV2 } from '@gamepark/quadri-kids/QuadriKidsOptions'
import { QuadriKidsRules } from '@gamepark/quadri-kids/QuadriKidsRules'
import { QuadriKidsSetup } from '@gamepark/quadri-kids/QuadriKidsSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="quadri-kids"
      Rules={QuadriKidsRules}
      optionsSpec={QuadriKidsOptionsSpecV2}
      GameSetup={QuadriKidsSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
