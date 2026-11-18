import { describe, expect, it } from 'vitest'
import { GameMode } from './GameMode'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { TILES_PER_COLOR, tileColors } from './material/TileColor'
import { QuadriKidsRules } from './QuadriKidsRules'
import { QuadriKidsOptions } from './QuadriKidsOptions'
import { QuadriKidsSetup } from './QuadriKidsSetup'

const setup = (options: QuadriKidsOptions) => new QuadriKidsRules(new QuadriKidsSetup().setup(options))

describe('Setup', () => {
  it('lays a square of the 4 colors, and 4 piles of 11 tiles', () => {
    const rules = setup({ players: 3 })
    const square = rules.material(MaterialType.ColorTile).location(LocationType.PlayArea)
    expect(square.getItems().map((tile) => tile.id).sort()).toEqual([...tileColors].sort())
    expect(square.getItems().map(({ location: { x, y, z } }) => `${x},${y},${z}`).sort()).toEqual(['0,0,0', '0,1,0', '1,0,0', '1,1,0'])
    for (const color of tileColors) {
      const pile = rules.material(MaterialType.ColorTile).location(LocationType.TilePile).id(color)
      expect(pile.getQuantity()).toBe(TILES_PER_COLOR - 1)
      expect(pile.getItem()?.location.id).toBe(color)
    }
  })

  it.each([2, 3, 4, 5])('deals 2 Objective cards to each of %i players, the rest is the draw pile', (players) => {
    const rules = setup({ players, mode: GameMode.Competitive })
    for (const player of rules.players) {
      expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(player).length).toBe(2)
    }
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.ObjectiveDeck).length).toBe(42 - 2 * players)
    expect(rules.material(MaterialType.QuadriObjectiveCard).length).toBe(0)
  })

  it('hides the hands from the other players and the draw pile from everyone', () => {
    const rules = setup({ players: 2 })
    const [me, other] = rules.players
    const view = new QuadriKidsRules(rules.getPlayerView(me))
    expect(view.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(me).getItems().every((card) => card.id !== undefined)).toBe(true)
    expect(view.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(other).getItems().every((card) => card.id === undefined)).toBe(true)
    expect(view.material(MaterialType.ObjectiveCard).location(LocationType.ObjectiveDeck).getItems().every((card) => card.id === undefined)).toBe(true)
  })

  it('with the Quadri cards, prepares both draw piles and deals nothing yet', () => {
    const rules = setup({ players: 3, mode: GameMode.Competitive, quadriCards: true })
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.ObjectiveDeck).length).toBe(42)
    expect(rules.material(MaterialType.QuadriObjectiveCard).location(LocationType.ObjectiveDeck).length).toBe(26)
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).length).toBe(0)
  })

  it.each([
    [1, undefined, 15],
    [3, 15, 15],
    [5, 30, 30]
  ])('cooperative with %i players: lays %s objectives face up, the other cards stay in the box', (players, cooperativeObjectives, expected) => {
    const rules = setup({ players, mode: GameMode.Cooperative, cooperativeObjectives })
    const objectives = rules.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives)
    expect(objectives.length).toBe(expected)
    expect(rules.material(MaterialType.ObjectiveCard).length).toBe(expected)
    expect(objectives.getItems().map((card) => card.location.x).sort((a, b) => a! - b!)).toEqual([...Array(expected).keys()])
  })

  it('plays the cooperative variant when alone, even without the option', () => {
    const rules = setup({ players: 1 })
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives).length).toBe(15)
  })
})
