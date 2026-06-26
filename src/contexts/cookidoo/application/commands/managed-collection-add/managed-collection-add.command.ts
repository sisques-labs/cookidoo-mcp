/** Command: subscribe to a managed collection by id. */
export class ManagedCollectionAddCommand {
  public readonly collectionId: string;

  constructor(input: { collectionId: string }) {
    this.collectionId = input.collectionId;
  }
}
