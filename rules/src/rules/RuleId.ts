export enum RuleId {
  /** With the Quadri cards option: each player chooses their deck of Objective cards, all at the same time (decision Q29). */
  ChooseObjectiveDeck = 1,
  /** "le joueur actif pioche une tuile Couleur dans la pile de son choix et la pose" */
  PlaceTile,
  /** The completed objectives are validated automatically after each tile (decision D4), then the game ends or the next player plays. */
  CompleteObjectives
}
