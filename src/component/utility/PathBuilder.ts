export class PathBuilder {
  private array: Array<string> = [];

  public moveTo(x: number, y: number) {
    this.array.push(this.format(`M ${x} ${y}`));
  }

  public lineTo(x: number, y: number) {
    this.array.push(this.format(`L ${x} ${y}`));
  }

  public toString() {
    return this.array.join(' ');
  }

  /**
   * Add space before and after the string
   */
  private format(element: string) {
    return ` ${element} `;
  }
}
