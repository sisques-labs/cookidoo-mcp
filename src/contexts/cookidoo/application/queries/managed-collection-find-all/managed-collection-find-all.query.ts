/** Query: a page of managed collections. */
export class ManagedCollectionFindAllQuery {
  public readonly page: number;

  constructor(input: { page?: number } = {}) {
    this.page = input.page ?? 0;
  }
}
