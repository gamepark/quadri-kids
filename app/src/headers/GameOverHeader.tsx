import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { QuadriKidsRules } from '@gamepark/quadri-kids/QuadriKidsRules'
import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * Competitive: the most points wins, a tie for first place is a draw (decision Q25).
 * Cooperative: won if every objective is completed, lost otherwise.
 */
export const GameOverHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<QuadriKidsRules>()!
  const me = usePlayerId<number>()
  const scores = rules.game.players.map((player) => ({ player, score: rules.getScore(player) }))
  const best = Math.max(...scores.map(({ score }) => score))
  const winners = scores.filter(({ score }) => score === best)
  const winnerName = usePlayerName(winners[0].player)

  if (rules.gameMode === GameMode.Cooperative) {
    const objectives = rules.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives)
    const done = objectives.filter((card) => card.location.rotation === true).length
    if (done === objectives.length) return <>{t('game-over.cooperative.won', { total: objectives.length })}</>
    return <>{t('game-over.cooperative.lost', { done, total: objectives.length })}</>
  }
  if (winners.length > 1) return <>{t('game-over.tie', { score: best })}</>
  if (winners[0].player === me) return <>{t('game-over.you-win', { score: best })}</>
  return <>{t('game-over.win', { player: winnerName, score: best })}</>
}
