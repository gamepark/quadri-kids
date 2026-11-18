import { Location, Material, MaterialItem } from '@gamepark/rules-api'
import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'
import { cellKey, TopColors } from './Pattern'
import { TileColor } from './TileColor'

type Tiles = Material<number, MaterialType, LocationType>

const orthogonalDirections = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
]

/** The tile on top of each pile of the play area, by cell key. */
const getTopTiles = (playArea: Tiles) => {
  const tops = new Map<string, MaterialItem<number, LocationType>>()
  for (const tile of playArea.getItems()) {
    const key = cellKey({ x: tile.location.x!, y: tile.location.y! })
    const top = tops.get(key)
    if (!top || tile.location.z! > top.location.z!) tops.set(key, tile)
  }
  return tops
}

/** Only the color on top of each pile counts. */
export const getTopColors = (playArea: Tiles): TopColors =>
  new Map([...getTopTiles(playArea)].map(([key, tile]) => [key, tile.id as TileColor]))

/**
 * Where a new tile can go: "Placer la nouvelle tuile bord à bord (pas en diagonale) avec une tuile Couleur
 * déjà présente ou par-dessus une tuile Couleur (pas de restriction au nombre d'étages)".
 * [H23] A tile may be laid on a tile of its own color: nothing forbids it.
 */
export const getTileDestinations = (playArea: Tiles): Location<number, LocationType>[] => {
  const tops = getTopTiles(playArea)
  const destinations: Location<number, LocationType>[] = []
  for (const top of tops.values()) {
    const { x = 0, y = 0, z = 0 } = top.location
    destinations.push({ type: LocationType.PlayArea, x, y, z: z + 1 })
  }
  const empty = new Set<string>()
  for (const top of tops.values()) {
    for (const direction of orthogonalDirections) {
      const cell = { x: top.location.x! + direction.x, y: top.location.y! + direction.y }
      const key = cellKey(cell)
      if (!tops.has(key) && !empty.has(key)) {
        empty.add(key)
        destinations.push({ type: LocationType.PlayArea, ...cell, z: 0 })
      }
    }
  }
  return destinations
}
