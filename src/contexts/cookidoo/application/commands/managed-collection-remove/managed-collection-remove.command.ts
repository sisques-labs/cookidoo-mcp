/** Command: unsubscribe from a managed collection by id. */
export class ManagedCollectionRemoveCommand {
  public readonly collectionId: string;

  constructor(input: { collectionId: string }) {
    this.collectionId = input.collectionId;
  }
}
