export enum LocationType {
  /** One pile of Color tiles per color, id = the TileColor. */
  TilePile = 1,
  /** The shared play area: x, y = the cell, z = the layer (0 for a tile laid on the table). */
  PlayArea,
  /** The face-down draw pile of the Quadri Kids Objective cards. */
  ObjectiveDeck,
  /** The face-down draw pile of the Quadri Objective cards worth 4 and 5 (decision Q29). */
  QuadriObjectiveDeck,
  /** The 2 Objective cards of a player, hidden from the others. */
  PlayerHand,
  /** The Objective cards a player has completed, face up in front of them. */
  CompletedObjectives,
  /** Cooperative variant: the objectives visible to all around the play area, turned face down when completed. */
  CooperativeObjectives
}
