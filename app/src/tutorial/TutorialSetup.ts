import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { HAND_SIZE, objectiveCards } from '@gamepark/quadri-kids/material/ObjectiveCard'
import { TILES_PER_COLOR, TileColor, tileColors } from '@gamepark/quadri-kids/material/TileColor'
import { QuadriKidsSetup } from '@gamepark/quadri-kids/QuadriKidsSetup'

export const me = 1
export const opponent = 2

/** Line yellow-black-yellow: completed by a yellow tile under the black one (turn 1). */
export const firstObjective = 25
/** Chevron yellow-magenta-yellow: completed by a magenta tile on the cyan one (turn 2). */
export const secondObjective = 30
/**
 * Drawn by the player at turns 1 and 2: cyan shapes (a spaced line, then a corner), out of reach for a while since
 * the only cyan tile gets covered. A random card could be completed at once by the tiles of the script.
 */
const drawnObjectives = [42, 35]
/** Antoine's cards: all black, which nothing the script lays can complete. */
const opponentObjectives = [37, 5]

/** The start of the script is fixed, the rest of the game is random. */
export class TutorialSetup extends QuadriKidsSetup {
  setupTiles() {
    const { Yellow, Magenta, Black, Cyan } = TileColor
    this.material(MaterialType.ColorTile).createItems([
      { id: Yellow, location: { type: LocationType.PlayArea, x: 0, y: 0, z: 0 } },
      { id: Magenta, location: { type: LocationType.PlayArea, x: 1, y: 0, z: 0 } },
      { id: Black, location: { type: LocationType.PlayArea, x: 0, y: 1, z: 0 } },
      { id: Cyan, location: { type: LocationType.PlayArea, x: 1, y: 1, z: 0 } }
    ])
    this.material(MaterialType.ColorTile).createItems(
      tileColors.map((color) => ({ id: color, quantity: TILES_PER_COLOR - 1, location: { type: LocationType.TilePile, id: color } }))
    )
  }

  setupCompetitiveObjectives() {
    const cards = () => this.material(MaterialType.ObjectiveCard)
    cards().createItems(objectiveCards.map((id) => ({ id, location: { type: LocationType.ObjectiveDeck } })))
    cards().shuffle()
    // On top of the draw pile, the first one drawn last
    for (const id of [...drawnObjectives].reverse()) cards().id(id).moveItem({ type: LocationType.ObjectiveDeck })
    cards()
      .id((id: number) => id === firstObjective || id === secondObjective)
      .moveItems({ type: LocationType.PlayerHand, player: me })
    cards()
      .id((id: number) => opponentObjectives.includes(id))
      .moveItems({ type: LocationType.PlayerHand, player: opponent })
    if (cards().location(LocationType.PlayerHand).length !== HAND_SIZE * 2) throw new Error('The tutorial hands are wrong')
  }
}
