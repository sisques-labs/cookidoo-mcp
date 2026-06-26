/** Command: delete a custom collection by id. */
export class CustomCollectionRemoveCommand {
  public readonly collectionId: string;

  constructor(input: { collectionId: string }) {
    this.collectionId = input.collectionId;
  }
}
