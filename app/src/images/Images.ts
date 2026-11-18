import { TileColor } from '@gamepark/quadri-kids/material/TileColor'
import ObjectiveBack from './cards/objectives/back.webp'
import QuadriObjectiveBack from './cards/quadri-objectives/back.webp'
import BlackCat from './tiles/black-cat.webp'
import CyanBear from './tiles/cyan-bear.webp'
import MagentaRabbit from './tiles/magenta-rabbit.webp'
import YellowDog from './tiles/yellow-dog.webp'

export { ObjectiveBack, QuadriObjectiveBack }

export const tileImages: Record<TileColor, string> = {
  [TileColor.Yellow]: YellowDog,
  [TileColor.Magenta]: MagentaRabbit,
  [TileColor.Black]: BlackCat,
  [TileColor.Cyan]: CyanBear
}

/** Card id -> image, from the file name (`<id>.webp`). The back is left out. */
const byNumber = (files: Record<string, string>): Record<number, string> =>
  Object.fromEntries(
    Object.entries(files)
      .map(([path, url]) => [Number(/\/(\d+)\.webp$/.exec(path)?.[1]), url] as const)
      .filter(([id]) => !isNaN(id))
  )

export const objectiveImages = byNumber(import.meta.glob<string>('./cards/objectives/*.webp', { eager: true, import: 'default' }))
export const quadriObjectiveImages = byNumber(import.meta.glob<string>('./cards/quadri-objectives/*.webp', { eager: true, import: 'default' }))
