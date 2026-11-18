import { getEnumValues, OptionsSpecV2 } from '@gamepark/rules-api'
import { GameMode } from './GameMode'

/**
 * This is the type of object that the game receives when a new game is started.
 */
export type QuadriKidsOptions = {
  players: number
  mode?: GameMode
  /** Competitive: the players may choose to play with the Quadri Objective cards worth 4 and 5 (decision Q29). */
  quadriCards?: boolean
  /** Cooperative: "Ici il faut réaliser 15 objectifs", more to make it harder (decision H30). */
  cooperativeObjectives?: number
}

/** "Pour augmenter la difficulté du jeu, après quelques parties, vous pouvez ajouter des cartes Objectif." */
export const cooperativeObjectiveCounts = [15, 20, 25, 30]
export const DEFAULT_COOPERATIVE_OBJECTIVES = 15

/**
 * The structure of everything a host can choose before the game starts — and nothing else.
 * Texts live in `app/public/options/<locale>.json`.
 * No player identities: the players are only numbered (decision of the publisher, 18/11/2026).
 */
export const QuadriKidsOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 1, max: 5 },
  options: {
    mode: {
      kind: 'enum',
      values: getEnumValues(GameMode).map((mode) => (mode === GameMode.Competitive ? { value: mode, playerCount: { min: 2 } } : mode))
    },
    quadriCards: { kind: 'boolean', requires: [{ option: 'mode', values: [GameMode.Competitive] }] },
    cooperativeObjectives: { kind: 'enum', values: cooperativeObjectiveCounts, requires: [{ option: 'mode', values: [GameMode.Cooperative] }] }
  }
}

/** A table of 1 can only play the cooperative variant. */
export const getGameMode = (options: QuadriKidsOptions) => options.mode ?? (options.players === 1 ? GameMode.Cooperative : GameMode.Competitive)
