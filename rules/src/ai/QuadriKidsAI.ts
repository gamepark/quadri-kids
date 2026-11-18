import { CustomMove, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { GameMode } from '../GameMode'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { getObjectivePattern, getObjectiveValue, objectiveCardTypes } from '../material/ObjectiveCard'
import { cellKey, Pattern, patternProgress, TopColors } from '../material/Pattern'
import { getTopColors } from '../material/PlayArea'
import { TileColor } from '../material/TileColor'
import { QuadriKidsRules } from '../QuadriKidsRules'
import { ChooseObjectiveDeck, CustomMoveType } from '../rules/CustomMoveType'
import { RuleId } from '../rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/** An objective the bot works on: its shape, and what completing it is worth to the bot. */
type Target = { pattern: Pattern; value: number }

/** Completed ≫ one square missing ≫ started (the mobile app's computer player, "moyen" level). */
const progressValue = (progress: number, size: number) => (progress >= size ? 1000 : progress === size - 1 ? 20 : progress)

/**
 * The objectives the bot may read. Fairness: in the competitive game, only its own hand, never the hands of the
 * others or the draw piles. In the cooperative variant, the shared objectives not yet done, which everyone sees.
 */
const getTargets = (rules: QuadriKidsRules, player: number): Target[] => {
  if (rules.gameMode === GameMode.Cooperative) {
    return rules
      .material(MaterialType.ObjectiveCard)
      .location(LocationType.CooperativeObjectives)
      .filter((card) => card.location.rotation !== true)
      .getItems()
      .map((card) => ({ pattern: getObjectivePattern(MaterialType.ObjectiveCard, card.id as number), value: 1 }))
  }
  return objectiveCardTypes.flatMap((type) =>
    rules
      .material(type)
      .location(LocationType.PlayerHand)
      .player(player)
      .getItems()
      .map((card) => ({ pattern: getObjectivePattern(type, card.id as number), value: getObjectiveValue(type, card.id as number) }))
  )
}

const evaluateTargets = (colors: TopColors, targets: Target[]) =>
  targets.reduce((sum, { pattern, value }) => sum + value * progressValue(patternProgress(colors, pattern), pattern.length), 0)

/** Taking the last tile of a pile ends the game (decision Q27): welcome when it wins, to avoid otherwise. */
const endOfGameValue = (rules: QuadriKidsRules, player: number, colors: TopColors, targets: Target[]): number => {
  const completed = targets.filter(({ pattern }) => patternProgress(colors, pattern) === pattern.length)
  if (rules.gameMode === GameMode.Cooperative) return completed.length === targets.length ? 5000 : -5000
  const myScore = rules.getScore(player) + completed.reduce((sum, { value }) => sum + value, 0)
  const othersBest = Math.max(...rules.players.filter((other) => other !== player).map((other) => rules.getScore(other)))
  return myScore > othersBest ? 5000 : -500
}

/** A draw among `count`: the same position always gets the same move, without reading anything hidden. */
const draw = (game: Game, player: number, count: number, salt = 0) => {
  const tiles = game.items[MaterialType.ColorTile] ?? []
  let hash = player * 101 + salt
  for (const tile of tiles) hash = (hash * 31 + (tile.location.x ?? 0) * 7 + (tile.location.y ?? 0) * 13 + (tile.id as number)) | 0
  return Math.abs(hash) % count
}

/** The tile moves of the bot, each with its value. */
export const rankTileMoves = (game: Game, player: number): { move: MoveItem<number, MaterialType.ColorTile, LocationType>; value: number; completes: boolean }[] => {
  const rules = new QuadriKidsRules(game)
  const targets = getTargets(rules, player)
  const tiles = rules.material(MaterialType.ColorTile)
  const colors = getTopColors(tiles.location(LocationType.PlayArea))
  const moves = rules.getLegalMoves(player).filter(isMoveItemType(MaterialType.ColorTile))
  return moves.map((move) => {
    const color = tiles.getItem(move.itemIndex).id as TileColor
    const after: TopColors = new Map(colors)
    after.set(cellKey({ x: move.location.x!, y: move.location.y! }), color)
    const completes = targets.some(({ pattern }) => patternProgress(after, pattern) === pattern.length)
    let value = evaluateTargets(after, targets)
    const left = tiles.getItem(move.itemIndex).quantity ?? 1
    if (left === 1) value += endOfGameValue(rules, player, after, targets)
    // In the cooperative variant, every turn counts: draw from the fullest piles.
    if (rules.gameMode === GameMode.Cooperative) value += left / 100
    return { move, value, completes }
  })
}

/**
 * - easy, the default (decision of Ludo): the "facile" level of the mobile app. When a tile completes one of its
 *   objectives, it lays it one time out of 2; otherwise it lays any tile.
 * - medium: the best move of {@link rankTileMoves}.
 */
export type BotLevel = 'easy' | 'medium'

/** Easy: probability to take the chance of completing an objective. */
const EASY_TAKES_OBJECTIVE = 0.5

/** The moves the bot plays now, for `player`. */
export const chooseMoves = (game: Game, player: number, level: BotLevel = 'easy'): Move[] => {
  const rules = new QuadriKidsRules(game)
  if (game.rule?.id === RuleId.ChooseObjectiveDeck) {
    const choices = rules.getLegalMoves(player).filter(isCustomMoveType<CustomMoveType, ChooseObjectiveDeck>(CustomMoveType.ChooseObjectiveDeck))
    const kids = choices.find((move: CustomMove<number, ChooseObjectiveDeck>) => move.data?.deck === MaterialType.ObjectiveCard)
    return kids ? [kids] : choices.slice(0, 1)
  }
  const ranked = rankTileMoves(game, player)
  if (!ranked.length) return rules.getLegalMoves(player).slice(0, 1)
  if (level === 'easy') {
    const completing = ranked.filter(({ completes }) => completes)
    const takes = completing.length > 0 && draw(game, player, 100, 1) < EASY_TAKES_OBJECTIVE * 100
    const pool = takes ? completing : ranked
    return [pool[draw(game, player, pool.length, 2)].move]
  }
  const best = Math.max(...ranked.map(({ value }) => value))
  const candidates = ranked.filter(({ value }) => value === best)
  return [candidates[draw(game, player, candidates.length)].move]
}

/** The bot of the tutorial and of `game.bot()` in development. It never plays online. */
export const QuadriKidsAI = (game: Game, player: number): Promise<Move[]> => Promise.resolve(chooseMoves(game, player))
