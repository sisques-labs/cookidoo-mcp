/** Command: create a custom collection with the given name. */
export class CustomCollectionAddCommand {
  public readonly name: string;

  constructor(input: { name: string }) {
    this.name = input.name;
  }
}
