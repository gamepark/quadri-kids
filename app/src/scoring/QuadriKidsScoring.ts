import { GameMode } from '@gamepark/quadri-kids/GameMode'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { objectiveCardTypes } from '@gamepark/quadri-kids/material/ObjectiveCard'
import { QuadriKidsRules } from '@gamepark/quadri-kids/QuadriKidsRules'
import { ScoringDescription } from '@gamepark/react-game'
import i18next from 'i18next'
import { GameOverHeader } from '../headers/GameOverHeader'

enum ScoringKey {
  Objectives = 1,
  Points
}

/**
 * The result: the header says who wins (or whether the team won), the table the objectives and points of each player.
 * Everything is computed from the state, nothing is memorised.
 */
export class QuadriKidsScoring implements ScoringDescription<number, QuadriKidsRules, ScoringKey> {
  ResultHeader = GameOverHeader

  getScoringKeys(rules: QuadriKidsRules) {
    return rules.gameMode === GameMode.Cooperative ? [ScoringKey.Objectives] : [ScoringKey.Objectives, ScoringKey.Points]
  }

  getScoringHeader(key: ScoringKey) {
    return i18next.t(key === ScoringKey.Objectives ? 'scoring.objectives' : 'scoring.points')
  }

  getScoringPlayerData(key: ScoringKey, player: number, rules: QuadriKidsRules) {
    if (key === ScoringKey.Points) return rules.getScore(player)
    if (rules.gameMode === GameMode.Cooperative) {
      const objectives = rules.material(MaterialType.ObjectiveCard).location(LocationType.CooperativeObjectives)
      return `${objectives.filter((card) => card.location.rotation === true).length} / ${objectives.length}`
    }
    return objectiveCardTypes.reduce((count, type) => count + rules.material(type).location(LocationType.CompletedObjectives).player(player).length, 0)
  }
}
