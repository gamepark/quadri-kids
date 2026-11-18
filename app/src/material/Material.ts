import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { TileColor } from '@gamepark/quadri-kids/material/TileColor'
import { CardDescription, MaterialDescription, TokenDescription } from '@gamepark/react-game'
import { objectiveImages, ObjectiveBack, quadriObjectiveImages, QuadriObjectiveBack, tileImages } from '../images/Images'
import { cardBorderRadius, cardSize, tileSize, tileThickness } from '../locators/TableLayout'

/** A Color tile: a square of thick cardboard, 3.5 cm. */
class ColorTileDescription extends TokenDescription<number, MaterialType, LocationType, TileColor> {
  width = tileSize
  height = tileSize
  borderRadius = 0.15
  thickness = tileThickness
  images = tileImages
}

/** An Objective card of Quadri Kids: 6 × 6 cm. */
class ObjectiveCardDescription extends CardDescription<number, MaterialType, LocationType, number> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius
  images = objectiveImages
  backImage = ObjectiveBack
}

/** An Objective card of Quadri worth 4 or 5 points (decision Q29): same size as the Kids ones. */
class QuadriObjectiveCardDescription extends CardDescription<number, MaterialType, LocationType, number> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius
  images = quadriObjectiveImages
  backImage = QuadriObjectiveBack
}

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.ColorTile]: new ColorTileDescription(),
  [MaterialType.ObjectiveCard]: new ObjectiveCardDescription(),
  [MaterialType.QuadriObjectiveCard]: new QuadriObjectiveCardDescription()
}
