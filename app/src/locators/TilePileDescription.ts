import { css } from '@emotion/react'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { LocationDescription } from '@gamepark/react-game'
import { tileSize } from './TableLayout'
import { TilePileCount } from './TilePileCount'

/** The area of a pile, the size of a tile, that only carries the count: clicks go through to the tile. */
export class TilePileDescription extends LocationDescription<number, MaterialType, LocationType> {
  width = tileSize
  height = tileSize
  extraCss = css`
    pointer-events: none;
  `
  content = TilePileCount
}
