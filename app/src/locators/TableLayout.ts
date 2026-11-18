import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { getGameMode } from '@gamepark/quadri-kids/QuadriKidsOptions'
import { MaterialRules, XYCoordinates } from '@gamepark/rules-api'

/**
 * The whole table, in centimetres, at the scale of the real components.
 *
 * The play area is in the middle, around the origin. It grows during the game in every direction, so
 * everything else is anchored to its edges and moves away as it grows:
 * - the 4 tile piles, then the Objective draw piles, on its left;
 * - the cards of the player who looks at the table, under it, full size;
 * - the cards of the other players, in a column on its right, at half size;
 * - in the cooperative variant, the shared objectives in rows above and under it.
 * Nothing is ever rotated: everyone reads the table the same way.
 */

export const tileSize = 3.5
export const tileThickness = 0.2
export const cardSize = 6
export const cardBorderRadius = 0.3

/** Space between two areas of the table. */
const gap = 1.5
/** The cards of the other players are shown at half size. */
export const opponentScale = 0.5
/** The cooperative objectives are shown smaller, so that 15 to 30 of them fit around the play area. */
export const cooperativeScale = 0.6
const cooperativeCardsPerRow = 8
const cooperativePitch = cardSize * cooperativeScale + 0.4

/**
 * Cells of the play area that are always kept free on screen: 6 × 6 cells around the starting square,
 * so that the other areas do not move during the first turns.
 */
const reservedCells = { minX: -2, maxX: 3, minY: -2, maxY: 3 }

type Rules = MaterialRules<number, MaterialType, LocationType>
type Rect = { left: number; right: number; top: number; bottom: number }

/** The cells covered by the tiles in the play area, at least the reserved ones. */
export const getPlayAreaCells = (rules: Rules) => {
  const cells = { ...reservedCells }
  for (const tile of rules.material(MaterialType.ColorTile).location(LocationType.PlayArea).getItems()) {
    const { x = 0, y = 0 } = tile.location
    cells.minX = Math.min(cells.minX, x)
    cells.maxX = Math.max(cells.maxX, x)
    cells.minY = Math.min(cells.minY, y)
    cells.maxY = Math.max(cells.maxY, y)
  }
  return cells
}

/** Centre of a cell of the play area. The starting square, cells (0,0) to (1,1), is around the origin. */
export const cellCenter = (x: number, y: number): XYCoordinates => ({ x: (x - 0.5) * tileSize, y: (y - 0.5) * tileSize })

/** The rectangle of the play area on the table. */
export const getPlayArea = (rules: Rules): Rect => {
  const cells = getPlayAreaCells(rules)
  return { left: (cells.minX - 1) * tileSize, right: cells.maxX * tileSize, top: (cells.minY - 1) * tileSize, bottom: cells.maxY * tileSize }
}

export const isCooperative = (rules: Rules) => getGameMode({ players: rules.players.length, ...rules.game.options }) === GameMode.Cooperative
const hasQuadriDeck = (rules: Rules) => rules.material(MaterialType.QuadriObjectiveCard).length > 0

// ------------------------------------------------------------------ supply, on the left

/** The 4 tile piles, in a column along the left edge of the play area, in the order of the colors. */
export const tilePileSpot = (rules: Rules, color: number): XYCoordinates => ({
  x: getPlayArea(rules).left - gap - tileSize / 2,
  y: (color - 2.5) * (tileSize + 1)
})

/** The Objective draw piles, left of the tile piles: the Kids one, and the Quadri one under it when it is used. */
export const objectiveDeckSpot = (rules: Rules, type: MaterialType): XYCoordinates => {
  const x = tilePileSpot(rules, 1).x - tileSize / 2 - gap - cardSize / 2
  if (!hasQuadriDeck(rules)) return { x, y: 0 }
  return { x, y: type === MaterialType.QuadriObjectiveCard ? cardSize / 2 + 0.5 : -cardSize / 2 - 0.5 }
}

// ------------------------------------------------------------------ players

/** The players in the order of the table, starting with the one who looks at it (the first player for a spectator). */
export const playersFromViewer = (rules: Rules, viewer?: number): number[] => {
  const start = Math.max(0, viewer === undefined ? 0 : rules.players.indexOf(viewer))
  return [...rules.players.slice(start), ...rules.players.slice(0, start)]
}

/** 0 for the player who looks at the table, then 1, 2… for the others in the order of play. */
export const getSeat = (rules: Rules, player: number, viewer?: number) => playersFromViewer(rules, viewer).indexOf(player)

export const seatScale = (seat: number) => (seat === 0 ? 1 : opponentScale)

/** Space between the 2 cards of a hand. */
export const handGap = (seat: number) => (cardSize + 0.5) * seatScale(seat)

/** First card of the hand of a player: the viewer's under the play area, the others' in the column on its right. */
export const handSpot = (rules: Rules, player: number, viewer?: number): XYCoordinates => {
  const area = getPlayArea(rules)
  const seat = getSeat(rules, player, viewer)
  if (seat === 0) return { x: -handGap(0) / 2, y: area.bottom + gap + cardSize / 2 }
  const small = cardSize * opponentScale
  return { x: area.right + gap + small / 2, y: area.top + small / 2 + (seat - 1) * (small + 1) }
}

/** Space between two completed objectives: they overlap, only the left strip of each one shows. */
export const completedGap = (seat: number) => 1.8 * seatScale(seat)

/** The completed objectives, fanned right of the hand. */
export const completedSpot = (rules: Rules, player: number, viewer?: number): XYCoordinates => {
  const seat = getSeat(rules, player, viewer)
  const hand = handSpot(rules, player, viewer)
  return { x: hand.x + handGap(seat) * 2 + gap * seatScale(seat), y: hand.y }
}

// ------------------------------------------------------------------ cooperative objectives

const countCooperativeObjectives = (rules: Rules) => rules.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives).length

/**
 * The shared objectives, half in rows above the play area, half in rows under it, 8 per row at most.
 * The rows grow away from the play area.
 */
export const cooperativeSpot = (rules: Rules, index: number): XYCoordinates => {
  const count = countCooperativeObjectives(rules)
  const area = getPlayArea(rules)
  const half = Math.ceil(count / 2)
  const above = index < half
  const rank = above ? index : index - half
  const total = above ? half : count - half
  const row = Math.floor(rank / cooperativeCardsPerRow)
  const inRow = Math.min(cooperativeCardsPerRow, total - row * cooperativeCardsPerRow)
  const column = rank % cooperativeCardsPerRow
  const centerX = (area.left + area.right) / 2
  const small = cardSize * cooperativeScale
  const x = centerX + (column - (inRow - 1) / 2) * cooperativePitch
  const y = above ? area.top - gap - small / 2 - row * cooperativePitch : area.bottom + gap + small / 2 + row * cooperativePitch
  return { x, y }
}

// ------------------------------------------------------------------ table

/** Margin around the outermost items. */
const margin = 0.5

const countCompleted = (rules: Rules, player: number) =>
  rules.material(MaterialType.ObjectiveCard).location(LocationType.CompletedObjectives).player(player).length +
  rules.material(MaterialType.QuadriObjectiveCard).location(LocationType.CompletedObjectives).player(player).length

/** The table is exactly as large as what lies on it. */
export const tableBoundaries = (rules: Rules, viewer?: number) => {
  const area = getPlayArea(rules)
  let { right, top, bottom } = area
  let left: number
  if (isCooperative(rules)) {
    left = Math.min(area.left, tilePileSpot(rules, 1).x - tileSize / 2)
    const small = cardSize * cooperativeScale
    for (let index = 0; index < countCooperativeObjectives(rules); index++) {
      const { x, y } = cooperativeSpot(rules, index)
      left = Math.min(left, x - small / 2)
      right = Math.max(right, x + small / 2)
      top = Math.min(top, y - small / 2)
      bottom = Math.max(bottom, y + small / 2)
    }
  } else {
    left = objectiveDeckSpot(rules, MaterialType.ObjectiveCard).x - cardSize / 2
    for (const [seat, player] of playersFromViewer(rules, viewer).entries()) {
      const size = cardSize * seatScale(seat)
      const start = completedSpot(rules, player, viewer)
      right = Math.max(right, start.x + Math.max(0, countCompleted(rules, player) - 1) * completedGap(seat) + size / 2)
      bottom = Math.max(bottom, start.y + size / 2)
    }
  }
  return { xMin: left - margin, xMax: right + margin, yMin: top - margin, yMax: bottom + margin }
}
