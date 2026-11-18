import { RuleId } from '@gamepark/quadri-kids/rules/RuleId'
import { ComponentType } from 'react'
import { ChooseObjectiveDeckHeader } from './ChooseObjectiveDeckHeader'
import { CompleteObjectivesHeader } from './CompleteObjectivesHeader'
import { PlaceTileHeader } from './PlaceTileHeader'

/** First drafts: the headers and buttons are worked on in the next step. */
export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.ChooseObjectiveDeck]: ChooseObjectiveDeckHeader,
  [RuleId.PlaceTile]: PlaceTileHeader,
  [RuleId.CompleteObjectives]: CompleteObjectivesHeader
}
