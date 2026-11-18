import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { tileColors } from '@gamepark/quadri-kids/material/TileColor'
import { DeckLocator, ItemContext, ListLocator, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { cardHoverTransform } from './CardHover'
import { PlayAreaLocator } from './PlayAreaLocator'
import {
  completedGap,
  completedSpot,
  cooperativeScale,
  cooperativeSpot,
  getPlayAreaCells,
  getSeat,
  handGap,
  handSpot,
  objectiveDeckSpot,
  seatScale,
  tilePileSpot
} from './TableLayout'
import { TilePileDescription } from './TilePileDescription'

type Context = MaterialContext<number, MaterialType, LocationType>
type Item = MaterialItem<number, LocationType>
type ItemCtx = ItemContext<number, MaterialType, LocationType>

/** Everything around the play area moves away from it as it grows. */
const playAreaDependency = (context: Context) => getPlayAreaCells(context.rules)

/** Each pile shows a single tile, with the number of tiles left written under it. */
class TilePileLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = new TilePileDescription()

  getLocations() {
    return tileColors.map((color) => ({ type: LocationType.TilePile, id: color }))
  }

  getCoordinates(location: Location<number, LocationType>, context: Context) {
    return tilePileSpot(context.rules, location.id)
  }

  getPositionDependencies(_location: Location<number, LocationType>, context: Context) {
    return playAreaDependency(context)
  }
}

class ObjectiveDeckLocator extends DeckLocator<number, MaterialType, LocationType> {
  constructor(private readonly type: MaterialType) {
    super()
  }

  getCoordinates(_location: Location<number, LocationType>, context: Context) {
    return objectiveDeckSpot(context.rules, this.type)
  }

  getPositionDependencies(_location: Location<number, LocationType>, context: Context) {
    return playAreaDependency(context)
  }
}

/** A row of cards of a player: full size for the player who looks at the table, half size for the others. */
abstract class PlayerCardsLocator extends ListLocator<number, MaterialType, LocationType> {
  getPositionDependencies(_location: Location<number, LocationType>, context: Context) {
    return playAreaDependency(context)
  }

  private scale(item: Item, context: ItemCtx) {
    return seatScale(getSeat(context.rules, item.location.player!, context.player))
  }

  placeItem(item: Item, context: ItemCtx): string[] {
    const scale = this.scale(item, context)
    return scale === 1 ? super.placeItem(item, context) : [...super.placeItem(item, context), `scale(${scale})`]
  }

  getHoverTransform(item: Item, context: ItemCtx) {
    return cardHoverTransform(item, context, this.scale(item, context))
  }
}

class PlayerHandLocator extends PlayerCardsLocator {
  getCoordinates(location: Location<number, LocationType>, context: Context) {
    return handSpot(context.rules, location.player!, context.player)
  }

  getGap(location: Location<number, LocationType>, context: Context) {
    return { x: handGap(getSeat(context.rules, location.player!, context.player)) }
  }
}

class CompletedObjectivesLocator extends PlayerCardsLocator {
  getCoordinates(location: Location<number, LocationType>, context: Context) {
    return completedSpot(context.rules, location.player!, context.player)
  }

  getGap(location: Location<number, LocationType>, context: Context) {
    return { x: completedGap(getSeat(context.rules, location.player!, context.player)) }
  }
}

/** The shared objectives of the cooperative variant, around the play area. */
class CooperativeObjectivesLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Location<number, LocationType>, context: Context) {
    return cooperativeSpot(context.rules, location.x ?? 0)
  }

  getPositionDependencies(_location: Location<number, LocationType>, context: Context) {
    return playAreaDependency(context)
  }

  placeItem(item: Item, context: ItemCtx): string[] {
    return [...super.placeItem(item, context), `scale(${cooperativeScale})`]
  }

  getHoverTransform(item: Item, context: ItemCtx) {
    return cardHoverTransform(item, context, cooperativeScale)
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.TilePile]: new TilePileLocator(),
  [LocationType.PlayArea]: new PlayAreaLocator(),
  [LocationType.ObjectiveDeck]: new ObjectiveDeckLocator(MaterialType.ObjectiveCard),
  [LocationType.QuadriObjectiveDeck]: new ObjectiveDeckLocator(MaterialType.QuadriObjectiveCard),
  [LocationType.PlayerHand]: new PlayerHandLocator(),
  [LocationType.CompletedObjectives]: new CompletedObjectivesLocator(),
  [LocationType.CooperativeObjectives]: new CooperativeObjectivesLocator()
}
