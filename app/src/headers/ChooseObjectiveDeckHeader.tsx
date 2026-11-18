import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { ChooseObjectiveDeck, CustomMoveType } from '@gamepark/quadri-kids/rules/CustomMoveType'
import { PlayMoveButton, useLegalMoves, usePlayerId, useRules } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType, MaterialMove, MaterialRules } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

export const ChooseObjectiveDeckHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()
  const me = usePlayerId<number>()
  const moves = useLegalMoves<MaterialMove>(isCustomMoveType(CustomMoveType.ChooseObjectiveDeck)) as CustomMove<number, ChooseObjectiveDeck>[]
  if (me === undefined || !rules?.game.players.includes(me)) return <>{t('header.choose-deck')}</>
  if (!rules.isTurnToPlay(me)) return <>{t('header.choose-deck.others')}</>
  const kids = moves.find((move) => move.data?.deck === MaterialType.ObjectiveCard)
  const quadri = moves.find((move) => move.data?.deck === MaterialType.QuadriObjectiveCard)
  return <Trans i18nKey="header.choose-deck.you" components={{ kids: <PlayMoveButton move={kids} />, quadri: <PlayMoveButton move={quadri} /> }} />
}
