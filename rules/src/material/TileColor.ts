import { getEnumValues } from '@gamepark/rules-api'

/**
 * "48 tuiles Couleur (12 tuiles de chaque couleur)": each color has its animal.
 */
export enum TileColor {
  Yellow = 1, // dog
  Magenta, // rabbit
  Black, // cat
  Cyan // bear
}

export const tileColors = getEnumValues(TileColor)

export const TILES_PER_COLOR = 12
