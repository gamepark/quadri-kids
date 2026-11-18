import { ChooseObjectiveDeck } from '@gamepark/quadri-kids/rules/CustomMoveType'
import { ItemMenuButton } from '@gamepark/react-game'
import { CustomMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/** On top of a draw pile, while the players choose their Objective cards (decision Q29). */
export const ChooseDeckButton = ({ move }: { move: CustomMove<number, ChooseObjectiveDeck> }) => {
  const { t } = useTranslation()
  return <ItemMenuButton move={move} label={t('deck.choose')} labelPosition="right" x={-1.6} y={1.6}>✓</ItemMenuButton>
}
