import { MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { GameMode } from '../GameMode'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { getObjectivePattern, ObjectiveCardType, objectiveCardTypes, objectiveDeckLocation } from '../material/ObjectiveCard'
import { findPattern } from '../material/Pattern'
import { getTopColors } from '../material/PlayArea'
import { tileColors } from '../material/TileColor'
import { getGameMode, QuadriKidsOptions } from '../QuadriKidsOptions'
import { RuleId } from './RuleId'

/**
 * "À tout moment, même s'il n'est pas le joueur actif, un joueur peut valider un objectif réalisé. Il place la carte
 * Objectif face visible devant lui et pioche un nouvel objectif, pour toujours en avoir 2 dans sa main."
 * The completed objectives are validated automatically after each tile (decision D4).
 * Then: "La partie prend fin lorsqu'une pile de tuiles Couleur est épuisée, le joueur actif termine alors son tour.
 * La partie se termine aussi immédiatement si tous les objectifs ont été réalisés."
 */
export class CompleteObjectivesRule extends PlayerTurnRule<number, MaterialType, LocationType> {
  onRuleStart() {
    return this.isCooperative ? this.completeCooperativeObjectives() : this.completeNextObjective()
  }

  get isCooperative() {
    return getGameMode({ players: this.game.players.length, ...(this.game.options as Partial<QuadriKidsOptions>) }) === GameMode.Cooperative
  }

  /**
   * One objective at a time: the card goes in front of its player, who draws a new one, then everything is
   * checked again, since the card drawn may already be completed (decision H7).
   * Decision H8: The active player first, then the others in the order of play.
   */
  completeNextObjective(): MaterialMove<number, MaterialType, LocationType>[] {
    const colors = getTopColors(this.material(MaterialType.ColorTile).location(LocationType.PlayArea))
    const players = this.game.players
    const active = players.indexOf(this.player)
    for (const player of [...players.slice(active), ...players.slice(0, active)]) {
      for (const type of objectiveCardTypes) {
        const completed = this.material(type)
          .location(LocationType.PlayerHand)
          .player(player)
          .filter((card) => card.id !== undefined && findPattern(colors, getObjectivePattern(type, card.id as number)) !== undefined)
        if (!completed.length) continue
        const deck = this.material(type).location(objectiveDeckLocation[type]).deck()
        return [
          completed.limit(1).moveItem({ type: LocationType.CompletedObjectives, player }),
          ...(deck.length ? [deck.dealOne({ type: LocationType.PlayerHand, player })] : []),
          this.startRule(RuleId.CompleteObjectives)
        ]
      }
    }
    return this.endTurn(this.allCompetitiveObjectivesCompleted)
  }

  /**
   * Decision H28: "tous les objectifs ont été réalisés": no card left in any hand nor in the decks the players draw from.
   */
  get allCompetitiveObjectivesCompleted() {
    if (this.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).length) return false
    if (this.material(MaterialType.QuadriObjectiveCard).location(LocationType.PlayerHand).length) return false
    return objectiveCardTypes.every((type: ObjectiveCardType) => {
      const used = this.material(type).location(LocationType.CompletedObjectives).length > 0
      return !used || this.material(type).location(objectiveDeckLocation[type]).length === 0
    })
  }

  /** "Lorsqu'un objectif est atteint, il est retourné face cachée." */
  completeCooperativeObjectives(): MaterialMove<number, MaterialType, LocationType>[] {
    const colors = getTopColors(this.material(MaterialType.ColorTile).location(LocationType.PlayArea))
    const objectives = this.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives)
    const completed = objectives.filter((card) => !card.location.rotation && findPattern(colors, getObjectivePattern(MaterialType.ObjectiveCard, card.id as number)) !== undefined)
    const remaining = objectives.filter((card) => !card.location.rotation).length - completed.length
    // "La partie est gagnée si les 15 objectifs sont réalisés avant que l'une des pioches de tuiles Couleur ne soit épuisée."
    // Decision H30: the objectives completed by the tile that empties a pile still count.
    return [...completed.rotateItems(true), ...this.endTurn(remaining === 0)]
  }

  endTurn(allObjectivesCompleted: boolean): MaterialMove<number, MaterialType, LocationType>[] {
    if (allObjectivesCompleted || this.isAnyPileEmpty) return [this.endGame()]
    return [this.startPlayerTurn(RuleId.PlaceTile, this.nextPlayer)]
  }

  /** Decision Q27: the active player has laid their tile and the objectives are validated, then the game ends. */
  get isAnyPileEmpty() {
    const piles = this.material(MaterialType.ColorTile).location(LocationType.TilePile)
    return tileColors.some((color) => piles.id(color).getQuantity() === 0)
  }
}
