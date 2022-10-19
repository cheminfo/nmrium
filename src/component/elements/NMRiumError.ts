export class NMRiumError extends Error {
  public readonly isNMRiumError: boolean;
  constructor(...params) {
    super(...params);
    this.isNMRiumError = true;
  }
}
