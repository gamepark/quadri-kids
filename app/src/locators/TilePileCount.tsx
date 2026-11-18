import { css } from '@emotion/react'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { useRules } from '@gamepark/react-game'
import { Location, MaterialRules } from '@gamepark/rules-api'

/** The number of tiles left in a pile, on the top left corner of the single tile that shows it. */
export const TilePileCount = ({ location }: { location: Location }) => {
  const rules = useRules<MaterialRules<number, MaterialType, LocationType>>()
  const count = rules?.material(MaterialType.ColorTile).location(LocationType.TilePile).id(location.id).getQuantity() ?? 0
  return <div css={countCss}>{count}</div>
}

const countCss = css`
  position: absolute;
  top: -0.5em;
  left: -0.5em;
  transform: translateZ(1em);
  min-width: 1.4em;
  padding: 0 0.3em;
  border-radius: 0.4em;
  background: white;
  color: black;
  font-size: 0.7em;
  font-weight: bold;
  line-height: 1.2em;
  text-align: center;
  box-shadow: 0 0 0.2em rgba(0, 0, 0, 0.5);
`
