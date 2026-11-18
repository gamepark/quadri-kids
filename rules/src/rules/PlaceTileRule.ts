import { isMoveItemType, ItemMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { getTileDestinations } from '../material/PlayArea'
import { RuleId } from './RuleId'

/**
 * "A son tour, le joueur actif pioche une tuile Couleur dans la pile de son choix et la pose selon la règle suivante :
 * Placer la nouvelle tuile bord à bord (pas en diagonale) avec une tuile Couleur déjà présente ou par-dessus une tuile
 * Couleur (pas de restriction au nombre d'étages)"
 */
export class PlaceTileRule extends PlayerTurnRule<number, MaterialType, LocationType> {
  getPlayerMoves() {
    const piles = this.material(MaterialType.ColorTile).location(LocationType.TilePile)
    const playArea = this.material(MaterialType.ColorTile).location(LocationType.PlayArea)
    return getTileDestinations(playArea).flatMap((destination) => piles.moveItems(destination, 1))
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    if (isMoveItemType(MaterialType.ColorTile)(move) && move.location.type === LocationType.PlayArea) {
      return [this.startRule(RuleId.CompleteObjectives)]
    }
    return []
  }
}
