import { QuadriKidsAI } from '@gamepark/quadri-kids/ai/QuadriKidsAI'
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
import { QuadriKidsScoring } from './scoring/QuadriKidsScoring'
import { Tutorial } from './tutorial/Tutorial'

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
      scoring={new QuadriKidsScoring()}
      ai={QuadriKidsAI}
      tutorial={new Tutorial()}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
