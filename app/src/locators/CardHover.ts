import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { ItemContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { cardSize, tableBoundaries } from './TableLayout'

/** A card under the pointer is seen up close: twice the size of a real card, whatever its size on the table. */
const hoverSize = cardSize * 2

/** How far a span has to move along one axis to lie between `min` and `max`: nothing when it already does. */
const pushInside = (center: number, half: number, min: number, max: number): number => Math.min(Math.max(center, min + half), max - half) - center

/**
 * The transform of a hovered card shown at `scale` on the table. It applies inside the card, after its own scale,
 * so everything is divided by that scale. A card near the edge of the table is pushed back inside it.
 */
export const cardHoverTransform = (item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>, scale = 1): string[] => {
  const locator = context.locators[item.location.type]
  if (!locator) return []
  const { x = 0, y = 0 } = locator.getItemCoordinates(item, context)
  const table = tableBoundaries(context.rules, context.player)
  const half = hoverSize / 2
  const dx = pushInside(x, half, table.xMin, table.xMax)
  const dy = pushInside(y, half, table.yMin, table.yMax)
  return [`translate3d(${dx / scale}em, ${dy / scale}em, ${10 / scale}em)`, `scale(${hoverSize / cardSize / scale})`]
}
