/** Query: a page of the user's own ("custom") collections. */
export class CustomCollectionFindAllQuery {
  public readonly page: number;

  constructor(input: { page?: number } = {}) {
    this.page = input.page ?? 0;
  }
}
