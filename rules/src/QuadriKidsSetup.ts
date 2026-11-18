import { MaterialGameSetup } from '@gamepark/rules-api'
import { shuffle } from 'es-toolkit'
import { GameMode } from './GameMode'
import { DEFAULT_COOPERATIVE_OBJECTIVES, getGameMode, QuadriKidsOptions } from './QuadriKidsOptions'
import { QuadriKidsRules } from './QuadriKidsRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { HAND_SIZE, objectiveCards, quadriObjectiveCards } from './material/ObjectiveCard'
import { TILES_PER_COLOR, tileColors } from './material/TileColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class QuadriKidsSetup extends MaterialGameSetup<number, MaterialType, LocationType, QuadriKidsOptions> {
  Rules = QuadriKidsRules

  setupMaterial(options: QuadriKidsOptions) {
    this.setupTiles()
    if (getGameMode(options) === GameMode.Cooperative) {
      this.setupCooperativeObjectives(options.cooperativeObjectives ?? DEFAULT_COOPERATIVE_OBJECTIVES)
    } else {
      this.setupCompetitiveObjectives(options.quadriCards ?? false)
    }
  }

  /**
   * "Poser 4 tuiles pour former un carré de 4 couleurs différentes au centre de la table"
   * [H20] the 4 colors of the starting square are drawn at random.
   * [H19] the 4 tiles of the square are taken from the 12 of each color: piles of 11.
   */
  setupTiles() {
    const square = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ]
    this.material(MaterialType.ColorTile).createItems(
      shuffle(tileColors).map((color, index) => ({ id: color, location: { type: LocationType.PlayArea, ...square[index], z: 0 } }))
    )
    this.material(MaterialType.ColorTile).createItems(
      tileColors.map((color) => ({ id: color, quantity: TILES_PER_COLOR - 1, location: { type: LocationType.TilePile, id: color } }))
    )
  }

  /**
   * "Prendre les cartes Objectif puis en distribuer 2 à chaque joueur. Le reste des cartes Objectif forme 1 pile, face cachée"
   * With the Quadri cards, the hands are dealt once each player has chosen their deck (decision Q29).
   */
  setupCompetitiveObjectives(quadriCards: boolean) {
    this.material(MaterialType.ObjectiveCard).createItems(objectiveCards.map((id) => ({ id, location: { type: LocationType.ObjectiveDeck } })))
    this.material(MaterialType.ObjectiveCard).shuffle()
    if (quadriCards) {
      this.material(MaterialType.QuadriObjectiveCard).createItems(quadriObjectiveCards.map((id) => ({ id, location: { type: LocationType.QuadriObjectiveDeck } })))
      this.material(MaterialType.QuadriObjectiveCard).shuffle()
      return
    }
    const deck = this.material(MaterialType.ObjectiveCard).location(LocationType.ObjectiveDeck).deck()
    for (const player of this.players) {
      deck.deal({ type: LocationType.PlayerHand, player }, HAND_SIZE)
    }
  }

  /**
   * "Ici il faut réaliser 15 objectifs visibles de tous et placés autour de la zone de jeu"
   * The objectives are drawn at random (decision Q30); the other cards stay in the box.
   */
  setupCooperativeObjectives(count: number) {
    this.material(MaterialType.ObjectiveCard).createItems(objectiveCards.map((id) => ({ id, location: { type: LocationType.ObjectiveDeck } })))
    this.material(MaterialType.ObjectiveCard).shuffle()
    this.material(MaterialType.ObjectiveCard).location(LocationType.ObjectiveDeck).deck().deal({ type: LocationType.CooperativeObjectives }, count)
    this.material(MaterialType.ObjectiveCard).location(LocationType.ObjectiveDeck).deleteItemsAtOnce()
  }

  /** "Le joueur le plus jeune est le premier joueur": on Game Park, the seats are random, so the first seat starts. */
  start(options: QuadriKidsOptions) {
    if (getGameMode(options) === GameMode.Competitive && options.quadriCards) {
      this.startSimultaneousRule(RuleId.ChooseObjectiveDeck)
    } else {
      this.startPlayerTurn(RuleId.PlaceTile, this.players[0])
    }
  }
}
