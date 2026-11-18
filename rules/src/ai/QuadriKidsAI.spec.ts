import { applyAutomaticMoves, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { GameMode } from '../GameMode'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { QuadriKidsOptions } from '../QuadriKidsOptions'
import { QuadriKidsRules } from '../QuadriKidsRules'
import { QuadriKidsSetup } from '../QuadriKidsSetup'
import { RuleId } from '../rules/RuleId'
import { chooseMoves, rankTileMoves } from './QuadriKidsAI'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/** Math.random replaced by a seeded generator while `run` runs, so that the deal is the same for every contender. */
const withSeed = <T>(seed: number, run: () => T): T => {
  const random = Math.random
  let state = seed * 7919 + 1
  Math.random = () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
  try {
    return run()
  } finally {
    Math.random = random
  }
}

/** Plays a whole game. `bots` are the seats played by the bot, the others play at random. */
const playGame = (options: QuadriKidsOptions, seed: number, bots: (seat: number) => boolean): Game =>
  withSeed(seed, () => {
    const game: Game = new QuadriKidsSetup().setup(options)
    for (let count = 0; game.rule?.id !== undefined && count < 500; count++) {
      const rules = new QuadriKidsRules(game)
      const player = game.players.find((player) => rules.isTurnToPlay(player))!
      const legal = rules.getLegalMoves(player)
      const moves = bots(game.players.indexOf(player)) ? chooseMoves(structuredClone(game), player) : [legal[Math.floor(Math.random() * legal.length)]]
      for (const move of moves) applyAutomaticMoves(rules, [move as Move])
    }
    expect(game.rule?.id, 'the game must end').toBeUndefined()
    return game
  })

const seeds = [...Array(12).keys()]

describe('The bot', () => {
  it('plays whole games at every player count, in both modes', () => {
    for (const players of [2, 3, 4, 5]) playGame({ players, mode: GameMode.Competitive }, players, () => true)
    for (const players of [2, 3]) playGame({ players, mode: GameMode.Competitive, quadriCards: true }, players, () => true)
    for (const players of [1, 2, 3, 4, 5]) playGame({ players, mode: GameMode.Cooperative }, players, () => true)
  })

  it('scores more than a player playing at random, on the same deals', () => {
    let bot = 0
    let random = 0
    for (const seed of seeds) {
      for (const botSeat of [0, 1]) {
        const game = playGame({ players: 2, mode: GameMode.Competitive }, seed, (seat) => seat === botSeat)
        const rules = new QuadriKidsRules(game)
        bot += rules.getScore(game.players[botSeat])
        random += rules.getScore(game.players[1 - botSeat])
      }
    }
    expect(bot).toBeGreaterThan(random * 1.5)
  })

  it('completes more cooperative objectives than random play', () => {
    const done = (bots: boolean) =>
      seeds.reduce((sum, seed) => {
        const game = playGame({ players: 2, mode: GameMode.Cooperative }, seed, () => bots)
        return sum + new QuadriKidsRules(game).getScore(game.players[0])
      }, 0)
    expect(done(true)).toBeGreaterThan(done(false) * 1.5)
  })

  it('takes a move that completes one of its objectives whenever there is one', () => {
    for (const seed of seeds) {
      withSeed(seed, () => {
        const game: Game = new QuadriKidsSetup().setup({ players: 2, mode: GameMode.Competitive })
        for (let turn = 0; turn < 40 && game.rule?.id === RuleId.PlaceTile; turn++) {
          const rules = new QuadriKidsRules(game)
          const player = rules.getActivePlayer()!
          const ranked = rankTileMoves(structuredClone(game), player)
          const [move] = chooseMoves(structuredClone(game), player)
          const chosen = ranked.find((entry) => JSON.stringify(entry.move) === JSON.stringify(move))!
          if (ranked.some((entry) => entry.value >= 1000)) expect(chosen.value).toBeGreaterThanOrEqual(1000)
          applyAutomaticMoves(rules, [move])
        }
      })
    }
  })

  it('never reads the cards of the other players or of the draw pile', () => {
    for (const seed of seeds) {
      withSeed(seed, () => {
        const game: Game = new QuadriKidsSetup().setup({ players: 3, mode: GameMode.Competitive })
        const rules = new QuadriKidsRules(game)
        const player = rules.getActivePlayer()!
        const before = chooseMoves(structuredClone(game), player)
        // Deal the hidden cards again among themselves: the hands of the others and the draw pile
        const shuffled = structuredClone(game)
        const cards = shuffled.items[MaterialType.ObjectiveCard]!
        const hidden = cards.filter((card) => card.location.type === LocationType.ObjectiveDeck || (card.location.type === LocationType.PlayerHand && card.location.player !== player))
        const ids = hidden.map((card) => card.id).reverse()
        hidden.forEach((card, index) => (card.id = ids[index]))
        expect(chooseMoves(shuffled, player)).toEqual(before)
      })
    }
  })
})
