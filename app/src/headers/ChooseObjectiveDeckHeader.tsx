import { usePlayerId, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

export const ChooseObjectiveDeckHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()
  const me = usePlayerId<number>()
  if (me !== undefined && rules?.isTurnToPlay(me)) return <>{t('header.choose-deck.you')}</>
  return <>{t('header.choose-deck')}</>
}
