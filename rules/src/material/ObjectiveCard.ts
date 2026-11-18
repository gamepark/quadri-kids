import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'
import { Pattern } from './Pattern'
import { TileColor } from './TileColor'

/** "pour toujours en avoir 2 dans sa main" */
export const HAND_SIZE = 2

/** "un chiffre de valeur 3 correspondant au nombre de points qu'elle rapporte en fin de partie" */
export const OBJECTIVE_VALUE = 3

const { Cyan: C, Magenta: M, Yellow: Y, Black: K } = TileColor

type Family = 'diagonal' | 'spaced' | 'step' | 'line' | 'chevron' | 'corner'

/** The shapes of the Kids cards, all of 3 squares: `outer` are the 2 ends, `middle` the one in between. */
const shapes: Record<Family, (outer: TileColor, middle: TileColor) => Pattern> = {
  // Stairs: . . X / . Y . / X . .
  diagonal: (o, m) => [
    { x: 0, y: 2, color: o },
    { x: 1, y: 1, color: m },
    { x: 2, y: 0, color: o }
  ],
  // A line with one cell between the squares: X . Y . X ([H24] exactly one cell, as on the card)
  spaced: (o, m) => [
    { x: 0, y: 0, color: o },
    { x: 2, y: 0, color: m },
    { x: 4, y: 0, color: o }
  ],
  // A step: . . M / X X .  (here `outer` is the pair side by side, `middle` the square on the diagonal)
  step: (o, m) => [
    { x: 0, y: 1, color: o },
    { x: 1, y: 1, color: o },
    { x: 2, y: 0, color: m }
  ],
  // A straight line: X / Y / X
  line: (o, m) => [
    { x: 0, y: 0, color: o },
    { x: 0, y: 1, color: m },
    { x: 0, y: 2, color: o }
  ],
  // A chevron: X . / . Y / X .
  chevron: (o, m) => [
    { x: 0, y: 0, color: o },
    { x: 1, y: 1, color: m },
    { x: 0, y: 2, color: o }
  ],
  // An L of 3 squares: X . / X X
  corner: (o) => [
    { x: 0, y: 0, color: o },
    { x: 0, y: 1, color: o },
    { x: 1, y: 1, color: o }
  ]
}

/**
 * The 42 Quadri Kids Objective cards, read card by card on the print PDF (mobile app, objectives.ts).
 * [card, family, outer color, middle color]. Card n is page 2n of 2026-6-18-cartes_objectif__QuadriKids.pdf.
 * [H31] only 2 spaced cards, and [H34] the unbalanced chevrons: the cards are kept as printed.
 */
const kidsCards: [number, Family, TileColor, TileColor][] = [
  [1, 'diagonal', M, M],
  [2, 'diagonal', C, C],
  [3, 'diagonal', K, K],
  [4, 'diagonal', Y, Y],
  [5, 'spaced', K, K],
  [6, 'diagonal', C, K],
  [7, 'diagonal', C, M],
  [8, 'diagonal', C, Y],
  [9, 'diagonal', M, C],
  [10, 'diagonal', M, Y],
  [11, 'diagonal', M, K],
  [12, 'diagonal', K, C],
  [13, 'diagonal', K, M],
  [14, 'diagonal', K, Y],
  [15, 'diagonal', Y, C],
  [16, 'diagonal', Y, M],
  [17, 'diagonal', Y, K],
  [18, 'step', Y, M],
  [19, 'step', M, Y],
  [20, 'step', K, C],
  [21, 'step', C, K],
  [22, 'line', M, Y],
  [23, 'line', C, M],
  [24, 'line', K, C],
  [25, 'line', Y, K],
  [26, 'line', M, M],
  [27, 'line', Y, Y],
  [28, 'line', C, C],
  [29, 'line', K, K],
  [30, 'chevron', Y, M],
  [31, 'chevron', M, K],
  [32, 'chevron', K, C],
  [33, 'chevron', C, Y],
  [34, 'corner', Y, Y],
  [35, 'corner', C, C],
  [36, 'corner', M, M],
  [37, 'corner', K, K],
  [38, 'chevron', M, C],
  [39, 'chevron', Y, K],
  [40, 'chevron', K, M],
  [41, 'chevron', C, K],
  [42, 'spaced', C, C]
]

export const objectivePatterns: Record<number, Pattern> = Object.fromEntries(kidsCards.map(([card, family, outer, middle]) => [card, shapes[family](outer, middle)]))

export const objectiveCards: number[] = kidsCards.map(([card]) => card)

/** A grid written "KKKK/.C.C": one row per line, "." is a cell that does not matter. */
const parseGrid = (grid: string): Pattern => {
  const colors: Record<string, TileColor> = { C, M, Y, K }
  return grid.split('/').flatMap((row, y) => [...row].flatMap((letter, x) => (letter === '.' ? [] : [{ x, y, color: colors[letter] }])))
}

/**
 * The Objective cards of Quadri worth 4 and 5 points, that a player may choose to play with (decision Q29).
 * [card, value, shape], numbered as on the Quadri card sheet, left to right and top to bottom (mobile app, quadri/objectives.ts).
 */
const quadriCards: [number, number, string][] = [
  [1, 4, 'YYYY'],
  [2, 4, 'CCCC'],
  [4, 4, '.M/M./MM'],
  [5, 4, 'KK/KK'],
  [6, 4, 'CC/CC'],
  [7, 4, 'YY/YY'],
  [8, 4, 'MM/MM'],
  [14, 5, '.YK/YY./.Y.'],
  [15, 5, '.KY/KK./.K.'],
  [16, 5, '.CY/CC./.C.'],
  [17, 5, '.MY/MM./.M.'],
  [18, 5, '.M./MMM/.M.'],
  [19, 5, '.C./CCC/.C.'],
  [20, 5, '.Y./YYY/.Y.'],
  [21, 4, 'KKKK'],
  [22, 4, 'MMMM'],
  [23, 5, '.KK../K..KK'],
  [24, 5, '.C./CMC/.C.'],
  [25, 5, '.Y./YMY/.Y.'],
  [27, 4, 'C./C./CY'],
  [28, 5, 'KKK/.Y./..Y'],
  [31, 4, '.Y/Y./YY'],
  [32, 4, 'YCKM'],
  [33, 4, '.C/C./CC'],
  [38, 4, '.Y./YKY'],
  [39, 4, '.K./KYK']
]

export const quadriObjectivePatterns: Record<number, Pattern> = Object.fromEntries(quadriCards.map(([card, , grid]) => [card, parseGrid(grid)]))
export const quadriObjectiveValues: Record<number, number> = Object.fromEntries(quadriCards.map(([card, value]) => [card, value]))

export const quadriObjectiveCards: number[] = quadriCards.map(([card]) => card)

/** The 2 kinds of Objective cards: Quadri Kids, and Quadri worth 4 and 5. */
export const objectiveCardTypes = [MaterialType.ObjectiveCard, MaterialType.QuadriObjectiveCard] as const
export type ObjectiveCardType = (typeof objectiveCardTypes)[number]

/** Each kind of card has its own draw pile. */
export const objectiveDeckLocation: Record<ObjectiveCardType, LocationType> = {
  [MaterialType.ObjectiveCard]: LocationType.ObjectiveDeck,
  [MaterialType.QuadriObjectiveCard]: LocationType.QuadriObjectiveDeck
}

export const getObjectivePattern = (type: ObjectiveCardType, card: number): Pattern =>
  type === MaterialType.ObjectiveCard ? objectivePatterns[card] : quadriObjectivePatterns[card]

export const getObjectiveValue = (type: ObjectiveCardType, card: number): number =>
  type === MaterialType.ObjectiveCard ? OBJECTIVE_VALUE : quadriObjectiveValues[card]
