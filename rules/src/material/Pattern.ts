import { XYCoordinates } from '@gamepark/rules-api'
import { TileColor } from './TileColor'

/**
 * The shape drawn on an Objective card: a list of cells with their color, x to the right and y downwards.
 * Only the listed cells matter: a cell between two squares of a diagonal or of a spaced line may be empty
 * or of any color (decision Q24), and so may the neighbours of the shape.
 */
export type PatternCell = XYCoordinates & { color: TileColor }
export type Pattern = PatternCell[]

/** The pattern moved so that its smallest cell is at (0, 0), cells sorted. */
const normalize = (pattern: Pattern): Pattern => {
  const minX = Math.min(...pattern.map((cell) => cell.x))
  const minY = Math.min(...pattern.map((cell) => cell.y))
  return pattern.map((cell) => ({ x: cell.x - minX, y: cell.y - minY, color: cell.color })).sort((a, b) => a.y - b.y || a.x - b.x)
}

const signature = (pattern: Pattern) => pattern.map((cell) => `${cell.x},${cell.y},${cell.color}`).join(';')

/** A quarter turn clockwise. */
const rotate = (pattern: Pattern): Pattern => normalize(pattern.map((cell) => ({ x: -cell.y, y: cell.x, color: cell.color })))

/** Left-right mirror. */
const mirror = (pattern: Pattern): Pattern => normalize(pattern.map((cell) => ({ x: -cell.x, y: cell.y, color: cell.color })))

const orientationsCache = new WeakMap<Pattern, Pattern[]>()

/**
 * Every distinct way to lay the card: 4 quarter turns (decision Q22), each one as on the card or mirrored
 * ("Les objectifs peuvent être réalisés dans les 2 sens; comme sur la carte ou comme dans un miroir", decision Q21).
 */
export const getOrientations = (pattern: Pattern): Pattern[] => {
  let orientations = orientationsCache.get(pattern)
  if (!orientations) {
    const seen = new Set<string>()
    orientations = []
    for (let current of [normalize(pattern), mirror(pattern)]) {
      for (let turn = 0; turn < 4; turn++, current = rotate(current)) {
        if (!seen.has(signature(current))) {
          seen.add(signature(current))
          orientations.push(current)
        }
      }
    }
    orientationsCache.set(pattern, orientations)
  }
  return orientations
}

/** The color showing on each cell of the play area, by cell key (see {@link cellKey}). */
export type TopColors = Map<string, TileColor>

export const cellKey = ({ x, y }: XYCoordinates) => `${x},${y}`

/**
 * Where the pattern is in the play area, in any orientation: the cells that make it, or undefined.
 * Only the color on top of each pile of tiles counts.
 */
export const findPattern = (colors: TopColors, pattern: Pattern): XYCoordinates[] | undefined => {
  for (const oriented of getOrientations(pattern)) {
    const [anchor] = oriented
    for (const [key, color] of colors) {
      if (color !== anchor.color) continue
      const [x, y] = key.split(',').map(Number)
      const cells = oriented.map((cell) => ({ x: cell.x + x - anchor.x, y: cell.y + y - anchor.y }))
      if (oriented.every((cell, index) => colors.get(cellKey(cells[index])) === cell.color)) return cells
    }
  }
  return undefined
}

/**
 * How many cells of the pattern already show the right color, in its best placement and orientation:
 * the size of the pattern once it is completed. Placements are anchored on the tiles of the play area.
 */
export const patternProgress = (colors: TopColors, pattern: Pattern): number => {
  let best = 0
  for (const oriented of getOrientations(pattern)) {
    for (const anchor of oriented) {
      for (const [key, color] of colors) {
        if (color !== anchor.color) continue
        const [x, y] = key.split(',').map(Number)
        const count = oriented.filter((cell) => colors.get(cellKey({ x: cell.x + x - anchor.x, y: cell.y + y - anchor.y })) === cell.color).length
        if (count > best) {
          best = count
          if (best === pattern.length) return best
        }
      }
    }
  }
  return best
}
