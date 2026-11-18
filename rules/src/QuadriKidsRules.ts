import { SecretMaterialRules, hideItemId, hideItemIdToOthers, MaterialGame, MaterialMove, PositiveSequenceStrategy, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'
import { TheFirstStepRule } from './rules/TheFirstStepRule'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class QuadriKidsRules
  extends SecretMaterialRules<number, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<number, MaterialType, LocationType>, MaterialMove<number, MaterialType, LocationType>, number>
{
  rules = {
    [RuleId.TheFirstStep]: TheFirstStepRule
  }

  locationsStrategies = {
    [MaterialType.ObjectiveCard]: {
      [LocationType.ObjectiveDeck]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new PositiveSequenceStrategy(),
      [LocationType.CompletedObjectives]: new PositiveSequenceStrategy(),
      [LocationType.CooperativeObjectives]: new PositiveSequenceStrategy()
    },
    [MaterialType.QuadriObjectiveCard]: {
      [LocationType.ObjectiveDeck]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new PositiveSequenceStrategy(),
      [LocationType.CompletedObjectives]: new PositiveSequenceStrategy()
    }
  }

  /** The draw piles are face down, and each player's hand is hidden from the others (competitive game). */
  hidingStrategies = {
    [MaterialType.ObjectiveCard]: {
      [LocationType.ObjectiveDeck]: hideItemId,
      [LocationType.PlayerHand]: hideItemIdToOthers
    },
    [MaterialType.QuadriObjectiveCard]: {
      [LocationType.ObjectiveDeck]: hideItemId,
      [LocationType.PlayerHand]: hideItemIdToOthers
    }
  }

  giveTime(): number {
    return 60
  }
}
