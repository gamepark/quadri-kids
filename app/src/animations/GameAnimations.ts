import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { MaterialGameAnimations } from '@gamepark/react-game'

/** Short moves: after each tile, the completed objectives and the new cards follow one another. */
export const gameAnimations = new MaterialGameAnimations<number, MaterialType, LocationType>()

gameAnimations.forMaterial(MaterialType.ColorTile).duration(400)
gameAnimations.forMaterial(MaterialType.ObjectiveCard).duration(500)
gameAnimations.forMaterial(MaterialType.QuadriObjectiveCard).duration(500)
