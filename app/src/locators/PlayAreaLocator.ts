import { css } from '@emotion/react'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { getTileDestinations } from '@gamepark/quadri-kids/material/PlayArea'
import { RuleId } from '@gamepark/quadri-kids/rules/RuleId'
import { DropAreaDescription, Locator, LocationContext, MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialMove } from '@gamepark/rules-api'
import { cellCenter, tileSize, tileThickness } from './TableLayout'

type Context = MaterialContext<number, MaterialType, LocationType>

/** The pile of tiles the player has clicked, if any (see `TileSelection`). */
export const getSelectedPile = (context: Context) => context.rules.material(MaterialType.ColorTile).location(LocationType.TilePile).selected()

/**
 * A cell where the player may lay a tile: it lights up while a tile is dragged, or once a pile is
 * clicked. Clicking it then lays a tile of the clicked pile there.
 */
class TileDestinationDescription extends DropAreaDescription<number, MaterialType, LocationType> {
  width = tileSize
  height = tileSize
  borderRadius = 0.15

  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, location: Location<number, LocationType>, context: Context) {
    if (!isMoveItemType(MaterialType.ColorTile)(move) || !this.isMoveToLocation(move, location, context)) return false
    return getSelectedPile(context).getIndexes().includes(move.itemIndex)
  }

  getExtraCss(_location: Location<number, LocationType>, context: LocationContext<number, MaterialType, LocationType>) {
    return getSelectedPile(context).length ? selectableCss : undefined
  }
}

const selectableCss = css`
  background-color: rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0.3em 0.1em white;
  cursor: pointer;
`

/** A tile laid on another one is a layer higher: `z` is the number of tiles under it. */
export class PlayAreaLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = new TileDestinationDescription()

  getCoordinates(location: Location<number, LocationType>) {
    return { ...cellCenter(location.x ?? 0, location.y ?? 0), z: (location.z ?? 0) * tileThickness }
  }

  /** The cells where the player can lay a tile, during their turn only. */
  getLocations(context: Context): Location<number, LocationType>[] {
    const { rules, player } = context
    if (rules.game.rule?.id !== RuleId.PlaceTile || player === undefined || rules.getActivePlayer() !== player) return []
    return getTileDestinations(rules.material(MaterialType.ColorTile).location(LocationType.PlayArea))
  }
}
