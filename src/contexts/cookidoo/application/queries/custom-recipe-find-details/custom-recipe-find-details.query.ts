/** Query: load a single custom recipe by id. */
export class CustomRecipeFindDetailsQuery {
  public readonly id: string;

  constructor(input: { id: string }) {
    this.id = input.id;
  }
}
