import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

export const PlaceTileHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()
  const me = usePlayerId<number>()
  const active = rules?.getActivePlayer()
  const name = usePlayerName(active)
  if (active !== undefined && active === me) return <>{t('header.place-tile.you')}</>
  return <>{t('header.place-tile', { player: name })}</>
}
