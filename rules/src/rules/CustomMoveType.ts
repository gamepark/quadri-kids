import { ObjectiveCardType } from '../material/ObjectiveCard'

export enum CustomMoveType {
  /** A player chooses the deck of Objective cards they play with (decision Q29). */
  ChooseObjectiveDeck = 1
}

export type ChooseObjectiveDeck = { player: number; deck: ObjectiveCardType }
