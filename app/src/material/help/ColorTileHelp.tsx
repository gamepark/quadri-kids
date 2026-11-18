import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { QuadriKidsRules } from '@gamepark/quadri-kids/QuadriKidsRules'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/** A Color tile: in its pile, with the tiles left and how to lay one, or in the play area, with its floor. */
export const ColorTileHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<QuadriKidsRules>()
  if (!rules || !item.location) return null
  const color = item.id as number
  const cooperative = rules.gameMode === GameMode.Cooperative

  return (
    <>
      <h2>{t('help.tile.title', { color })}</h2>
      {item.location.type === LocationType.TilePile ? (
        <>
          <p>{t('help.tile.pile', { count: rules.material(MaterialType.ColorTile).location(LocationType.TilePile).id(color).getQuantity() })}</p>
          <p>{t('help.tile.place')}</p>
          <p>
            {cooperative
              ? t('help.tile.end.cooperative', { total: rules.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives).length })
              : t('help.tile.end')}
          </p>
        </>
      ) : (
        <>
          <p>{t('help.tile.play-area', { below: item.location.z ?? 0 })}</p>
          <p>{t('help.tile.visible')}</p>
        </>
      )}
    </>
  )
}
