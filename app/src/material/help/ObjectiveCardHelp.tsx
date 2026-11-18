import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { getObjectiveValue, HAND_SIZE, ObjectiveCardType, objectiveDeckLocation } from '@gamepark/quadri-kids/material/ObjectiveCard'
import { QuadriKidsRules } from '@gamepark/quadri-kids/QuadriKidsRules'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * An Objective card, Quadri Kids or Quadri: where it stands (draw pile, a hand, the completed objectives, the
 * shared objectives), then, when its front can be seen, how to complete it and what it brings.
 */
export const ObjectiveCardHelp = ({ item, itemType }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<QuadriKidsRules>()
  const me = usePlayerId<number>()
  const owner = item.location?.player
  const ownerName = usePlayerName(owner)
  if (!rules || !item.location) return null
  const type = itemType as ObjectiveCardType
  const location = item.location.type
  const cooperative = rules.gameMode === GameMode.Cooperative
  const visible = item.id !== undefined && location !== objectiveDeckLocation[type] && item.location.rotation !== true
  const mine = owner !== undefined && owner === me

  return (
    <>
      <h2>{t(type === MaterialType.QuadriObjectiveCard ? 'help.objective.quadri.title' : 'help.objective.title')}</h2>
      {location === objectiveDeckLocation[type] && (
        <>
          <p>{t('help.objective.deck', { count: rules.material(type).location(location).length })}</p>
          {type === MaterialType.QuadriObjectiveCard && <p>{t('help.objective.quadri.deck')}</p>}
        </>
      )}
      {location === LocationType.PlayerHand && <p>{mine ? t('help.objective.hand.you', { count: HAND_SIZE }) : t('help.objective.hand', { player: ownerName })}</p>}
      {location === LocationType.CompletedObjectives && <p>{mine ? t('help.objective.completed.you') : t('help.objective.completed', { player: ownerName })}</p>}
      {location === LocationType.CooperativeObjectives && (
        <>
          <p>{t(item.location.rotation ? 'help.objective.cooperative.done' : 'help.objective.cooperative')}</p>
          <p>{t('help.objective.cooperative.rule', { total: rules.material(MaterialType.ObjectiveCard).location(location).length })}</p>
        </>
      )}
      {visible && (
        <>
          <p>{t('help.objective.goal')}</p>
          <p>{t('help.objective.orientation')}</p>
          {!cooperative && <p>{t('help.objective.points', { points: getObjectiveValue(type, item.id as number) })}</p>}
        </>
      )}
      {!cooperative && (location === LocationType.PlayerHand || location === objectiveDeckLocation[type]) && (
        <p>{t('help.objective.validate', { count: HAND_SIZE })}</p>
      )}
    </>
  )
}
