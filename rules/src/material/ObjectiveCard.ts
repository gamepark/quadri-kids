import { range } from 'es-toolkit'

/**
 * The 42 Quadri Kids Objective cards, all worth 3 points.
 * Card n is page 2n of 2026-6-18-cartes_objectif__QuadriKids.pdf (app/src/images/README.md).
 */
export const objectiveCards: number[] = range(1, 43)

/**
 * The Objective cards of Quadri worth 4 and 5 points, that a player may choose to play with (decision Q29).
 * Numbered as on the Quadri card sheet, left to right and top to bottom (the mobile app's numbering).
 */
export const quadriObjectiveCards: number[] = [1, 2, 4, 5, 6, 7, 8, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 31, 32, 33, 38, 39]

/** "pour toujours en avoir 2 dans sa main" */
export const HAND_SIZE = 2
