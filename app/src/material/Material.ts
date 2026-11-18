import { css } from '@emotion/react'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { ObjectiveCardType, objectiveDeckLocation } from '@gamepark/quadri-kids/material/ObjectiveCard'
import { TileColor } from '@gamepark/quadri-kids/material/TileColor'
import { ChooseObjectiveDeck, CustomMoveType } from '@gamepark/quadri-kids/rules/CustomMoveType'
import { RuleId } from '@gamepark/quadri-kids/rules/RuleId'
import { CardDescription, ItemContext, MaterialDescription, TokenDescription } from '@gamepark/react-game'
import { isCustomMoveType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { createElement } from 'react'
import { objectiveImages, ObjectiveBack, quadriObjectiveImages, QuadriObjectiveBack, tileImages } from '../images/Images'
import { cardBorderRadius, cardSize, tileSize, tileThickness } from '../locators/TableLayout'
import { ChooseDeckButton } from './ChooseDeckButton'

type Item = MaterialItem<number, LocationType>
type Context = ItemContext<number, MaterialType, LocationType>
type Move = MaterialMove<number, MaterialType, LocationType>

/** A Color tile: a square of thick cardboard, 3.5 cm. */
class ColorTileDescription extends TokenDescription<number, MaterialType, LocationType, TileColor> {
  width = tileSize
  height = tileSize
  borderRadius = 0.15
  thickness = tileThickness
  images = tileImages

  /** During their turn, a click on a pile chooses it, a second click lets go of it (decision D6, see `TileSelection`). */
  getShortClickLocalMove(context: Context) {
    const { rules, player, index } = context
    if (rules.game.rule?.id !== RuleId.PlaceTile || player === undefined || rules.getActivePlayer() !== player) return undefined
    const tile = rules.material(MaterialType.ColorTile).index(index)
    if (tile.getItem()?.location.type !== LocationType.TilePile) return undefined
    return tile.getItem()?.selected ? tile.unselectItem() : tile.selectItem()
  }

  getItemExtraCss(item: Item) {
    return item.selected ? selectedCss : undefined
  }
}

const selectedCss = css`
  > * {
    box-shadow: 0 0 0.4em 0.25em white;
  }
`

/** Cards of 6 × 6 cm. While the players choose their deck, each draw pile carries the button to choose it. */
abstract class ObjectiveDescription extends CardDescription<number, MaterialType, LocationType, number> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius

  isMenuAlwaysVisible() {
    return true
  }

  /** Cooperative variant: "Lorsqu'un objectif est atteint, il est retourné face cachée." (still readable in its help dialog) */
  isFlippedOnTable(item: Partial<Item>, context: Context) {
    return item.location?.rotation === true || super.isFlippedOnTable(item, context)
  }

  getItemMenu(item: Item, context: Context, legalMoves: Move[]) {
    const deckLocation = objectiveDeckLocation[context.type as ObjectiveCardType]
    if (item.location.type !== deckLocation) return undefined
    const deck = context.rules.material(context.type).location(deckLocation)
    if (item.location.x !== deck.maxBy((card) => card.location.x!).getItem()?.location.x) return undefined
    const move = legalMoves
      .filter(isCustomMoveType<CustomMoveType, ChooseObjectiveDeck>(CustomMoveType.ChooseObjectiveDeck))
      .find((move) => move.data?.deck === context.type)
    return move ? createElement(ChooseDeckButton, { move }) : undefined
  }
}

/** An Objective card of Quadri Kids. */
class ObjectiveCardDescription extends ObjectiveDescription {
  images = objectiveImages
  backImage = ObjectiveBack
}

/** An Objective card of Quadri worth 4 or 5 points (decision Q29). */
class QuadriObjectiveCardDescription extends ObjectiveDescription {
  images = quadriObjectiveImages
  backImage = QuadriObjectiveBack
}

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.ColorTile]: new ColorTileDescription(),
  [MaterialType.ObjectiveCard]: new ObjectiveCardDescription(),
  [MaterialType.QuadriObjectiveCard]: new QuadriObjectiveCardDescription()
}
