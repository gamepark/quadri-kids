import { MaterialGameSetup } from '@gamepark/rules-api'
import { QuadriKidsOptions } from './QuadriKidsOptions'
import { QuadriKidsRules } from './QuadriKidsRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class QuadriKidsSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, QuadriKidsOptions> {
  Rules = QuadriKidsRules

  setupMaterial(_options: QuadriKidsOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
