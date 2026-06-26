/** Query: load the full details of a single recipe by id. */
export class RecipeFindDetailsQuery {
  public readonly id: string;

  constructor(input: { id: string }) {
    this.id = input.id;
  }
}
