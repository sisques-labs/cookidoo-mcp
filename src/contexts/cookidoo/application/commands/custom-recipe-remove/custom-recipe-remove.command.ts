/** Command: delete a custom recipe by id. */
export class CustomRecipeRemoveCommand {
  public readonly id: string;

  constructor(input: { id: string }) {
    this.id = input.id;
  }
}
