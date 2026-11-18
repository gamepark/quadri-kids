import { css } from '@emotion/react'
import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { QuadriKidsRules } from '@gamepark/quadri-kids/QuadriKidsRules'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import { ObjectiveBack } from '../images/Images'
import PanelBackground from '../images/panel-background.svg?no-inline'

/** Competitive: each panel shows the points of the player's completed objectives. */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules<QuadriKidsRules>()
  const root = document.getElementById('root')
  if (!root || !rules) {
    return null
  }
  const competitive = rules.gameMode === GameMode.Competitive

  return createPortal(
    <>
      {players.map((player, index) => (
        <StyledPlayerPanel
          key={player.id}
          player={player}
          css={panelPosition(index)}
          activeRing
          backgroundImage={PanelBackground}
          mainCounter={competitive ? { image: ObjectiveBack, value: rules.getScore(player.id), imageCss: counterImageCss } : undefined}
        />
      ))}
    </>,
    root
  )
}

const panelPosition = (index: number) => css`
  position: absolute;
  right: 1em;
  top: ${8.5 + index * 16}em;
  width: 28em;
`

const counterImageCss = css`
  border-radius: 0.2em;
`
