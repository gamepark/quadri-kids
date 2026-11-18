import { applyAutomaticMoves, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { GameMode } from './GameMode'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { objectiveCards, quadriObjectiveCards } from './material/ObjectiveCard'
import { findPattern, Pattern, TopColors } from './material/Pattern'
import { TILES_PER_COLOR, TileColor, tileColors } from './material/TileColor'
import { QuadriKidsOptions } from './QuadriKidsOptions'
import { QuadriKidsRules } from './QuadriKidsRules'
import { QuadriKidsSetup } from './QuadriKidsSetup'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const { Yellow: Y, Magenta: M, Black: K, Cyan: C } = TileColor

/** A play area written like the cards: one row per line, "." for an empty cell. */
const board = (grid: string): TopColors => {
  const colors: Record<string, TileColor> = { Y, M, K, C }
  const map: TopColors = new Map()
  grid.split('/').forEach((row, y) => [...row].forEach((letter, x) => letter !== '.' && map.set(`${x},${y}`, colors[letter])))
  return map
}

const diagonal: Pattern = [
  { x: 0, y: 2, color: Y },
  { x: 1, y: 1, color: K },
  { x: 2, y: 0, color: Y }
]
const step: Pattern = [
  { x: 0, y: 1, color: Y },
  { x: 1, y: 1, color: Y },
  { x: 2, y: 0, color: M }
]

describe('Objective shapes', () => {
  it('finds a shape as on the card', () => {
    expect(findPattern(board('..Y/.K./Y..'), diagonal)).toHaveLength(3)
  })

  it('finds a shape turned a quarter (decision Q22)', () => {
    expect(findPattern(board('Y../.K./..Y'), diagonal)).toBeDefined()
  })

  it('finds a shape seen in a mirror (decision Q21)', () => {
    expect(findPattern(board('M../.YY'), step)).toBeDefined()
    expect(findPattern(board('..M/YY.'), step)).toBeDefined()
  })

  it('ignores the cells the card does not draw (decision Q24)', () => {
    expect(findPattern(board('MCY/CKM/YMC'), diagonal)).toBeDefined()
  })

  it('needs every color', () => {
    expect(findPattern(board('..Y/.M./Y..'), diagonal)).toBeUndefined()
    expect(findPattern(board('..Y/.K./...'), diagonal)).toBeUndefined()
  })
})

const newGame = (options: QuadriKidsOptions): Game => new QuadriKidsSetup().setup(options)

describe('Placing a tile', () => {
  it('can go on any of the 4 tiles or next to them, from any of the 4 piles', () => {
    const rules = new QuadriKidsRules(newGame({ players: 2, mode: GameMode.Competitive }))
    // 4 tiles to cover, 8 empty cells along the edges of the square
    expect(rules.getLegalMoves(rules.getActivePlayer()!)).toHaveLength(12 * 4)
  })

  // Regression: a client that does not know the other hands crashed while checking the objectives
  it('is left to the server, which alone knows every hand', () => {
    const game = newGame({ players: 3, mode: GameMode.Competitive })
    const rules = new QuadriKidsRules(game)
    const [active, other] = game.players
    const move = rules.getLegalMoves(active)[0]
    expect(rules.isUnpredictableMove(move, active)).toBe(true)
    const view = new QuadriKidsRules(rules.getPlayerView(other))
    expect(() => applyAutomaticMoves(view, [move])).not.toThrow()
  })
})

describe('Choosing the Objective cards', () => {
  it('deals 2 cards of the chosen deck to each player, then the first player plays', () => {
    const game = newGame({ players: 2, mode: GameMode.Competitive, quadriCards: true })
    const rules = new QuadriKidsRules(game)
    expect(game.rule?.id).toBe(RuleId.ChooseObjectiveDeck)
    const [first, second] = game.players
    const [kids] = rules.getLegalMoves(first)
    const [, quadri] = rules.getLegalMoves(second)
    applyAutomaticMoves(rules, [kids])
    applyAutomaticMoves(rules, [quadri])
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(first).length).toBe(2)
    expect(rules.material(MaterialType.QuadriObjectiveCard).location(LocationType.PlayerHand).player(second).length).toBe(2)
    expect(game.rule?.id).toBe(RuleId.PlaceTile)
    expect(game.rule?.player).toBe(first)
  })
})

/** Lays the starting square with chosen colors: (0,0), (1,0), (0,1), (1,1). */
const layStartingSquare = (game: Game, colors: TileColor[]) => {
  const square = game.items[MaterialType.ColorTile]!.filter((tile) => tile.location.type === LocationType.PlayArea)
  square.forEach((tile) => {
    tile.id = colors[tile.location.x! + 2 * tile.location.y!]
  })
}

const placeTile = (rules: QuadriKidsRules, color: TileColor, x: number, y: number) => {
  const move = rules
    .getLegalMoves(rules.getActivePlayer()!)
    .filter(isMoveItemType(MaterialType.ColorTile))
    .find((move) => rules.material(MaterialType.ColorTile).getItem(move.itemIndex).id === color && move.location.x === x && move.location.y === y)
  expect(move, `no move to lay ${color} in (${x},${y})`).toBeDefined()
  applyAutomaticMoves(rules, [move!])
}

describe('Completing objectives', () => {
  it('puts the card in front of its player, who draws a new one; then the next player plays', () => {
    const game = newGame({ players: 2, mode: GameMode.Competitive })
    const [first, second] = game.players
    // Card 26 is a line of 3 magenta squares
    const hand = game.items[MaterialType.ObjectiveCard]!.filter((card) => card.location.type === LocationType.PlayerHand && card.location.player === second)
    const swapped = game.items[MaterialType.ObjectiveCard]!.find((card) => card.id === 26)!
    ;[swapped.id, hand[0].id] = [hand[0].id, 26]
    layStartingSquare(game, [M, Y, M, C])
    const rules = new QuadriKidsRules(game)
    placeTile(rules, M, 0, 2)
    // [H8] the objective of the other player is validated too, outside their turn
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.CompletedObjectives).player(second).getItem()?.id).toBe(26)
    expect(rules.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(second).length).toBe(2)
    expect(rules.getScore(second)).toBe(3)
    expect(game.rule?.id).toBe(RuleId.PlaceTile)
    expect(game.rule?.player).toBe(first === game.rule?.player ? first : second)
  })

  it('turns a completed cooperative objective face down, and the team wins when they are all done', () => {
    const game = newGame({ players: 1, mode: GameMode.Cooperative, cooperativeObjectives: 15 })
    // Keep only one objective, card 26 (line of 3 magenta)
    const objective = game.items[MaterialType.ObjectiveCard]!.find((card) => card.location.type === LocationType.CooperativeObjectives)!
    game.items[MaterialType.ObjectiveCard] = [{ ...objective, id: 26 }]
    layStartingSquare(game, [M, Y, M, C])
    const rules = new QuadriKidsRules(game)
    placeTile(rules, M, 0, 2)
    expect(rules.material(MaterialType.ObjectiveCard).getItem()?.location.rotation).toBe(true)
    expect(game.rule?.id).toBeUndefined()
  })

  it('ends the game once a pile is empty, after the objectives are checked (decision Q27)', () => {
    const game = newGame({ players: 2, mode: GameMode.Competitive })
    game.items[MaterialType.ColorTile]!.find((tile) => tile.location.type === LocationType.TilePile && tile.id === K)!.quantity = 1
    const rules = new QuadriKidsRules(game)
    const square = rules.material(MaterialType.ColorTile).location(LocationType.PlayArea).getItems()
    const { x, y } = square[0].location
    placeTile(rules, K, x!, y!)
    expect(game.rule?.id).toBeUndefined()
  })
})

// ------------------------------------------------------------------ whole games

const MAX_MOVES = 500

const playRandomGame = (options: QuadriKidsOptions, seed: number): Game => {
  const game = newGame(options)
  let random = seed + 1
  let moves = 0
  while (game.rule?.id !== undefined && moves < MAX_MOVES) {
    const rules = new QuadriKidsRules(game)
    const player = game.players.find((player) => rules.isTurnToPlay(player))!
    const legal = rules.getLegalMoves(player)
    expect(legal, `no legal move for player ${player} on rule ${game.rule.id}`).not.toHaveLength(0)
    random = (random * 1103515245 + 12345) % 2147483648
    applyAutomaticMoves(rules, [legal[random % legal.length] as MaterialMove<number, MaterialType, LocationType>])
    moves++
    check(game, options)
  }
  expect(game.rule?.id, 'the game must end').toBeUndefined()
  return game
}

/** What must hold between any two moves of any game. */
const check = (game: Game, options: QuadriKidsOptions) => {
  const rules = new QuadriKidsRules(game)
  const tiles = rules.material(MaterialType.ColorTile)
  for (const color of tileColors) {
    expect(tiles.id(color).getQuantity()).toBe(TILES_PER_COLOR)
  }
  // Every tile of the play area lies on the table or on a tile, and touches another one
  const playArea = tiles.location(LocationType.PlayArea).getItems()
  for (const tile of playArea) {
    const { x, y, z } = tile.location
    if (z! > 0) expect(playArea.some((other) => other.location.x === x && other.location.y === y && other.location.z === z! - 1)).toBe(true)
    if (playArea.length > 1) {
      expect(playArea.some((other) => Math.abs(other.location.x! - x!) + Math.abs(other.location.y! - y!) === 1)).toBe(true)
    }
  }
  if (options.mode === GameMode.Cooperative) return
  expect(rules.material(MaterialType.ObjectiveCard).length).toBe(objectiveCards.length)
  expect(rules.material(MaterialType.QuadriObjectiveCard).length).toBe(options.quadriCards ? quadriObjectiveCards.length : 0)
  if (game.rule?.id === RuleId.PlaceTile) {
    for (const player of game.players) {
      const hand =
        rules.material(MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(player).length +
        rules.material(MaterialType.QuadriObjectiveCard).location(LocationType.PlayerHand).player(player).length
      expect(hand).toBeLessThanOrEqual(2)
    }
  }
}

describe('Random games', () => {
  it.each([2, 3, 4, 5])('competitive with %i players ends when a pile is empty or all the objectives are done', (players) => {
    for (let seed = 0; seed < 5; seed++) {
      const game = playRandomGame({ players, mode: GameMode.Competitive }, seed)
      const rules = new QuadriKidsRules(game)
      const piles = rules.material(MaterialType.ColorTile).location(LocationType.TilePile)
      const pileEmpty = tileColors.some((color) => piles.id(color).getQuantity() === 0)
      const nothingLeft = rules.material(MaterialType.ObjectiveCard).location((type) => type !== LocationType.CompletedObjectives).length === 0
      expect(pileEmpty || nothingLeft).toBe(true)
      const total = game.players.reduce((sum, player) => sum + rules.getScore(player), 0)
      expect(total).toBe(3 * rules.material(MaterialType.ObjectiveCard).location(LocationType.CompletedObjectives).length)
    }
  })

  it.each([2, 5])('competitive with the Quadri cards and %i players', (players) => {
    for (let seed = 0; seed < 5; seed++) playRandomGame({ players, mode: GameMode.Competitive, quadriCards: true }, seed)
  })

  it.each([1, 3, 5])('cooperative with %i players', (players) => {
    for (let seed = 0; seed < 5; seed++) {
      const game = playRandomGame({ players, mode: GameMode.Cooperative, cooperativeObjectives: 15 }, seed)
      const rules = new QuadriKidsRules(game)
      const done = rules.material(MaterialType.ObjectiveCard).filter((card) => card.location.rotation === true).length
      for (const player of game.players) expect(rules.getScore(player)).toBe(done)
    }
  })
})
