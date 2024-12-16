export class PathBuilder {
  private path = '';

  private appendPath(segment: string) {
    this.path += `${segment} `;
  }

  public moveTo(x: number, y: number) {
    x = clamp(x);
    y = clamp(y);
    this.appendPath(`M ${x} ${y}`);
  }

  public lineTo(x: number, y: number) {
    x = clamp(x);
    y = clamp(y);
    this.appendPath(`L ${x} ${y}`);
  }

  public closePath() {
    if (this.path.length > 0) this.appendPath('Z');
  }

  public toString() {
    return this.path.trim();
  }

  public concatPath(pathBuilder: PathBuilder) {
    return (this.path + pathBuilder.path).trim();
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
