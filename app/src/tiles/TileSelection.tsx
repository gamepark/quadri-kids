import { useDndMonitor } from '@dnd-kit/core'
import { LocationType } from '@gamepark/quadri-kids/material/LocationType'
import { MaterialType } from '@gamepark/quadri-kids/material/MaterialType'
import { RuleId } from '@gamepark/quadri-kids/rules/RuleId'
import { usePlay, usePlayerId, useRules } from '@gamepark/react-game'
import { MaterialMove, MaterialRules } from '@gamepark/rules-api'
import { useEffect, useRef } from 'react'

type Rules = MaterialRules<number, MaterialType, LocationType>

/**
 * Laying a tile with clicks (decision D6): the player clicks a pile, the cells light up, and a click on a
 * cell lays the tile. The pile clicked is "selected", a local move that only this player sees.
 * Only one pile is selected at a time, and none outside the player's turn or while a tile is dragged.
 */
export const TileSelection = () => {
  const rules = useRules<Rules>()
  const play = usePlay<MaterialMove<number, MaterialType, LocationType>>()
  const me = usePlayerId<number>()
  const previous = useRef<number[]>([])

  const selected = rules?.material(MaterialType.ColorTile).selected()
  const selectedIndexes = selected?.getIndexes() ?? []
  const myTurn = rules?.game.rule?.id === RuleId.PlaceTile && me !== undefined && rules.getActivePlayer() === me
  const key = selectedIndexes.join(',')

  useEffect(() => {
    if (!rules) return
    const all = rules.material(MaterialType.ColorTile).selected()
    const indexes = all.getIndexes()
    // The pile clicked last stays selected; a tile that left its pile is not selected any more
    const latest = indexes.filter((index) => !previous.current.includes(index)).slice(-1)
    const keep = myTurn ? (latest.length ? latest : indexes.slice(-1)) : []
    const release = all.filter((item, index) => !keep.includes(index) || item.location.type !== LocationType.TilePile)
    for (const move of release.unselectItems()) play(move, { transient: true })
    previous.current = keep
  }, [key, myTurn, rules, play])

  useDndMonitor({
    onDragStart: () => {
      for (const move of rules?.material(MaterialType.ColorTile).selected().unselectItems() ?? []) play(move, { transient: true })
    }
  })

  return null
}
