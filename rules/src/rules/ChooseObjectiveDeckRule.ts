import { CustomMove, isCustomMoveType, SimultaneousRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { HAND_SIZE, objectiveCardTypes } from '../material/ObjectiveCard'
import { ChooseObjectiveDeck, CustomMoveType } from './CustomMoveType'
import { RuleId } from './RuleId'

/**
 * "les parents peuvent utiliser des cartes Objectif de valeur 4 ou 5 du jeu Quadri": with the option, each
 * player chooses the Quadri Kids cards or the Quadri cards worth 4 and 5, then gets 2 cards of that deck
 * (decision Q29). [H29] Whoever chooses the Quadri cards plays with them alone: nothing is added to the Kids deck.
 */
export class ChooseObjectiveDeckRule extends SimultaneousRule<number, MaterialType, LocationType> {
  getActivePlayerLegalMoves(player: number) {
    return objectiveCardTypes.map((deck) => this.customMove<CustomMoveType, ChooseObjectiveDeck>(CustomMoveType.ChooseObjectiveDeck, { player, deck }))
  }

  onCustomMove(move: CustomMove) {
    if (!isCustomMoveType<CustomMoveType, ChooseObjectiveDeck>(CustomMoveType.ChooseObjectiveDeck)(move)) return []
    const { player, deck } = move.data!
    return [
      ...this.material(deck).location(LocationType.ObjectiveDeck).deck().deal({ type: LocationType.PlayerHand, player }, HAND_SIZE),
      this.endPlayerTurn(player)
    ]
  }

  getMovesAfterPlayersDone() {
    return [this.startPlayerTurn(RuleId.PlaceTile, this.game.players[0])]
  }
}
