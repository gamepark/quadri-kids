import {
  CompetitiveScore,
  hideItemId,
  hideItemIdToOthers,
  isMoveItemType,
  isStartPlayerTurn,
  isStartRule,
  MaterialGame,
  MaterialMove,
  PositiveSequenceStrategy,
  SecretMaterialRules,
  TimeLimit
} from '@gamepark/rules-api'
import { GameMode } from './GameMode'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { getObjectiveValue, objectiveCardTypes } from './material/ObjectiveCard'
import { getGameMode, QuadriKidsOptions } from './QuadriKidsOptions'
import { ChooseObjectiveDeckRule } from './rules/ChooseObjectiveDeckRule'
import { CompleteObjectivesRule } from './rules/CompleteObjectivesRule'
import { PlaceTileRule } from './rules/PlaceTileRule'
import { RuleId } from './rules/RuleId'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class QuadriKidsRules
  extends SecretMaterialRules<number, MaterialType, LocationType, RuleId>
  implements
    TimeLimit<MaterialGame<number, MaterialType, LocationType, RuleId>, MaterialMove<number, MaterialType, LocationType, RuleId>, number>,
    CompetitiveScore<MaterialGame<number, MaterialType, LocationType, RuleId>, MaterialMove<number, MaterialType, LocationType, RuleId>, number>
{
  rules = {
    [RuleId.ChooseObjectiveDeck]: ChooseObjectiveDeckRule,
    [RuleId.PlaceTile]: PlaceTileRule,
    [RuleId.CompleteObjectives]: CompleteObjectivesRule
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

  get gameMode() {
    return getGameMode({ players: this.game.players.length, ...(this.game.options as Partial<QuadriKidsOptions>) })
  }

  /**
   * After a tile, the objectives are checked against every hand, and a player only sees their own: the client cannot
   * compute which ones are completed, it waits for the server. Nothing is hidden in the cooperative variant.
   */
  isUnpredictableMove(move: MaterialMove<number, MaterialType, LocationType, RuleId>, player: number) {
    if (this.gameMode === GameMode.Competitive) {
      if (isMoveItemType(MaterialType.ColorTile)(move) && move.location.type === LocationType.PlayArea) return true
      if ((isStartRule(move) || isStartPlayerTurn(move)) && move.id === RuleId.CompleteObjectives) return true
    }
    return super.isUnpredictableMove(move, player)
  }

  /**
   * Competitive: "On compte alors les points de chaque joueur (points notés en bas des cartes Objectif)."
   * The most points wins; a tie for first place is a draw, without tie-breaker (decision Q25).
   * Cooperative: everybody shares the number of objectives completed.
   */
  getScore(player: number) {
    if (this.gameMode === GameMode.Cooperative) {
      return this.material(MaterialType.ObjectiveCard)
        .location(LocationType.CooperativeObjectives)
        .filter((card) => card.location.rotation === true).length
    }
    return objectiveCardTypes.reduce(
      (score, type) =>
        score +
        this.material(type)
          .location(LocationType.CompletedObjectives)
          .player(player)
          .getItems()
          .reduce((sum, card) => sum + getObjectiveValue(type, card.id as number), 0),
      0
    )
  }

  giveTime(): number {
    return 30
  }
}
