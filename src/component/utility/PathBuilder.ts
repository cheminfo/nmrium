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
}

/**
 * Clamp values to avoid rendering issues of the SVG.
 * This assumes that the viewport has pixel coordinates (so the max values are outside of the visible area)
 */
function clamp(value: number) {
  return Math.max(-1e5, Math.min(1e5, value));
}
