import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { TileColor } from '@gamepark/quadri-kids/material/TileColor'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { firstObjective, me, opponent, secondObjective, TutorialSetup } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>
type Move = MaterialMove<number, MaterialType, LocationType>

/** Around what is focused, so that the table does not zoom in too much and the popup has room. */
const pilesMargin = { top: 3, bottom: 3, left: 3, right: 28 }
const cardsMargin = { top: 14, left: 8, right: 8, bottom: 1 }
const tableMargin = { top: 10, bottom: 4, left: 6, right: 8 }

const components = { bold: <strong />, italic: <em /> }

const text = (key: string) => () => <Trans i18nKey={key} components={components} />

/**
 * The script written with Ludo (script-tuto.txt): 2 players, Quadri Kids cards. The player completes an objective
 * by laying a tile next to another, then one by laying a tile on another; then finishes the game against the bot.
 */
export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 1
  options = { players: 2, mode: GameMode.Competitive }
  setup = new TutorialSetup()

  players = [
    { id: me },
    {
      id: opponent,
      name: 'Antoine',
      avatar: {
        topType: 'ShortHairShortFlat',
        hairColor: 'Brown',
        facialHairType: 'BeardLight',
        facialHairColor: 'Brown',
        clotheType: 'Hoodie',
        clotheColor: 'Blue03',
        eyeType: 'Happy',
        eyebrowType: 'DefaultNatural',
        mouthType: 'Smile',
        skinColor: 'Light'
      }
    }
  ]

  /** Laying the tile of `color` on the cell (x, y). */
  private layTile(color: TileColor, x: number, y: number) {
    return (move: Move, game: Game) =>
      isMoveItemType(MaterialType.ColorTile)(move) &&
      move.location.x === x &&
      move.location.y === y &&
      this.material(game, MaterialType.ColorTile).getItem(move.itemIndex).id === color
  }

  private playArea = (game: Game) => this.material(game, MaterialType.ColorTile).location(LocationType.PlayArea)

  private tile = (game: Game, x: number, y: number) =>
    this.playArea(game)
      .location((location) => location.x === x && location.y === y)
      .maxBy((tile) => tile.location.z ?? 0)

  steps: TutorialStep<number, MaterialType, LocationType>[] = [
    { popup: { text: text('tuto.welcome') } },
    {
      popup: { text: text('tuto.goal'), position: { y: -25 } },
      focus: (game) => ({ materials: [this.playArea(game)], margin: { top: 10, bottom: 6, left: 10, right: 10 } })
    },
    {
      popup: { text: text('tuto.piles'), position: { x: 25 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.ColorTile).location(LocationType.TilePile)], margin: pilesMargin })
    },
    {
      popup: { text: text('tuto.objectives'), position: { y: -25 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(me)], margin: cardsMargin })
    },
    { popup: { text: text('tuto.help') } },
    { popup: { text: text('tuto.place') } },
    {
      popup: { text: text('tuto.first-objective'), position: { y: -25 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.ObjectiveCard).id(firstObjective),
          this.tile(game, 0, 0),
          this.tile(game, 0, 1)
        ],
        margin: tableMargin
      })
    },
    {
      popup: { text: text('tuto.lay-yellow'), position: { y: -30 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.ColorTile).location(LocationType.TilePile).id(TileColor.Yellow), this.tile(game, 0, 1)],
        locations: [{ type: LocationType.PlayArea, x: 0, y: 2, z: 0 }],
        margin: tableMargin
      }),
      move: { filter: this.layTile(TileColor.Yellow, 0, 2) }
    },
    {
      popup: { text: text('tuto.completed'), position: { y: -25 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.ObjectiveCard).location(LocationType.CompletedObjectives).player(me),
          this.material(game, MaterialType.ObjectiveCard).location(LocationType.PlayerHand).player(me)
        ],
        margin: cardsMargin
      })
    },
    { popup: { text: text('tuto.opponent') } },
    { move: { player: opponent, filter: this.layTile(TileColor.Black, -1, 1) } },
    { popup: { text: text('tuto.anytime') } },
    {
      popup: { text: text('tuto.second-objective'), position: { y: -25 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.ObjectiveCard).id(secondObjective),
          this.tile(game, 0, 0),
          this.tile(game, 0, 2),
          this.tile(game, 1, 1)
        ],
        margin: tableMargin
      })
    },
    {
      popup: { text: text('tuto.lay-magenta'), position: { y: -30 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.ColorTile).location(LocationType.TilePile).id(TileColor.Magenta), this.tile(game, 1, 1)],
        margin: tableMargin
      }),
      move: { filter: this.layTile(TileColor.Magenta, 1, 1) }
    },
    { popup: { text: text('tuto.orientation') } },
    {
      popup: { text: text('tuto.end'), position: { x: 25 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.ColorTile).location(LocationType.TilePile)], margin: pilesMargin })
    },
    { popup: { text: text('tuto.winner') } },
    { popup: { text: text('tuto.cooperative') } },
    { popup: { text: text('tuto.go') } }
  ]
}
