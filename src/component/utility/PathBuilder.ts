export class PathBuilder {
  private array: string[] = [];

  public moveTo(x: number, y: number) {
    x = clamp(x);
    y = clamp(y);
    this.array.push(`M ${x} ${y}`);
  }

  public lineTo(x: number, y: number) {
    x = clamp(x);
    y = clamp(y);
    this.array.push(`L ${x} ${y}`);
  }

  public closePath() {
    if (this.array.length > 0) this.array.push('Z');
  }

  public toString() {
    return this.array.join(' ');
  }

  public concatPath(pathBuilder: PathBuilder) {
    return this.array.concat(pathBuilder.array).join(' ');
  }
}

/**
 * Clamp values to avoid rendering issues of the SVG.
 * This assumes that the viewport has pixel coordinates (so the max values are outside of the visible area)
 */
function clamp(value: number) {
  if (value < -1e5) return -1e5;
  if (value > 1e5) return 1e5;
  return value;
}
